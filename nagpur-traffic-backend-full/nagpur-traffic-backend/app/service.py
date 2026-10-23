"""Model + data access layer. No FastAPI imports here, so it can be tested or reused on its own."""
from __future__ import annotations

import logging
from datetime import datetime
from functools import lru_cache
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

log = logging.getLogger("nagpur.service")

NUMERIC = [
    "Traffic_Volume", "Vehicle_Count", "Avg_Speed_kmph", "Travel_Time_min", "Queue_Length_m",
    "Temperature_C", "Hour", "Minute", "Distance_km", "Free_Flow_Speed_kmph", "Speed_Ratio",
]
CATEGORICAL = [
    "Route_ID", "Accident", "Road_Work", "Emergency_Vehicle", "Weather", "Day_of_Week", "Peak_Hour",
]
MODEL_FEATURES = NUMERIC + CATEGORICAL

# Routing outputs: kept for routing evaluation, never passed to the congestion model.
ROUTING_ONLY = frozenset({"Recommended_Route", "Time_Saved_min"})

LEVELS = ("Low", "Medium", "High")
PEAK_HOURS = frozenset({8, 9, 10, 17, 18, 19})   # matches Peak_Hour in the dataset
STEP = pd.Timedelta(minutes=5)


class TimestampNotFound(LookupError):
    pass


class UnknownRoute(KeyError):
    pass


class TrafficService:
    def __init__(self, model_path: Path, data_path: Path):
        self.model = self._load_model(model_path)
        self.df = self._load_data(data_path)

        self.timestamps = pd.DatetimeIndex(sorted(self.df["Timestamp"].unique()))
        self.first_ts, self.last_ts = self.timestamps[0], self.timestamps[-1]
        self._rows_by_ts = self.df.groupby("Timestamp").indices
        self._rows_by_route = self.df.groupby("Route_ID").indices
        self.routes = self._build_route_meta()
        self.continuous_5min = self._check_continuity()
        self._snapshot = lru_cache(maxsize=512)(self._snapshot_uncached)

    # ------------------------------------------------------------------ loading
    @staticmethod
    def _load_model(path: Path):
        if not path.exists():
            raise FileNotFoundError(f"Model file not found: {path}")
        model = joblib.load(path)
        names = list(getattr(model, "feature_names_in_", []))
        if set(names) != set(MODEL_FEATURES):
            raise RuntimeError(f"Model features differ from the API's feature list: {names}")
        if ROUTING_ONLY & set(names):
            raise RuntimeError("Model uses routing outputs as inputs, which is not allowed")
        if set(model.classes_) != set(LEVELS):
            raise RuntimeError(f"Unexpected model classes: {list(model.classes_)}")
        # Requests are tiny (1-576 rows); a single thread per call avoids oversubscription under concurrency.
        model.steps[-1][1].n_jobs = 1
        return model

    @staticmethod
    def _load_data(path: Path) -> pd.DataFrame:
        if not path.exists():
            raise FileNotFoundError(f"Data file not found: {path}")
        df = pd.read_csv(path)
        missing = (set(MODEL_FEATURES) | ROUTING_ONLY | {
            "Timestamp", "Source", "Destination", "Congestion_Level",
            "Alternate_Route", "Alternate_Distance_km", "Alternate_Time_min",
        }) - set(df.columns)
        if missing:
            raise RuntimeError(f"Data file is missing columns: {sorted(missing)}")
        df["Timestamp"] = pd.to_datetime(df["Timestamp"], format="%d-%m-%Y %H:%M")
        return df.sort_values(["Timestamp", "Route_ID"]).reset_index(drop=True)

    def _build_route_meta(self) -> dict[str, dict]:
        first = self.df.groupby("Route_ID").first()
        ff = self.df.groupby("Route_ID")["Free_Flow_Speed_kmph"].median()
        return {
            rid: {
                "route_id": rid,
                "source": r["Source"],
                "destination": r["Destination"],
                "distance_km": float(r["Distance_km"]),
                "alternate_route": r["Alternate_Route"],
                "alternate_distance_km": float(r["Alternate_Distance_km"]),
                "free_flow_speed_kmph": round(float(ff[rid]), 2),
            }
            for rid, r in first.iterrows()
        }

    def _check_continuity(self) -> bool:
        ok = True
        for rid, pos in self._rows_by_route.items():
            gaps = np.diff(self.df["Timestamp"].values[pos]).astype("timedelta64[m]").astype(int)
            if not (gaps == 5).all():
                log.warning("Route %s does not have a continuous 5-minute timeline", rid)
                ok = False
        return ok

    # ------------------------------------------------------------------ lookup
    def resolve_timestamp(self, at: datetime | None) -> pd.Timestamp:
        """None -> latest record. Otherwise the latest record at or before `at` (wall-clock, tz ignored)."""
        if at is None:
            return self.last_ts
        ts = pd.Timestamp(at)
        if ts.tzinfo is not None:
            ts = ts.tz_localize(None)
        ts = ts.floor("5min")
        if ts < self.first_ts or ts > self.last_ts:
            raise TimestampNotFound(
                f"No data for {ts:%Y-%m-%d %H:%M}; available {self.first_ts:%Y-%m-%d %H:%M} to {self.last_ts:%Y-%m-%d %H:%M}"
            )
        return ts

    def require_route(self, route_id: str) -> dict:
        if route_id not in self.routes:
            raise UnknownRoute(route_id)
        return self.routes[route_id]

    # --------------------------------------------------------------- prediction
    def _predict(self, rows: pd.DataFrame) -> pd.DataFrame:
        """Return a copy of `rows` with Predicted_Level and Prob_<level> columns added."""
        proba = self.model.predict_proba(rows[MODEL_FEATURES])
        probs = pd.DataFrame(proba, columns=list(self.model.classes_), index=rows.index)[list(LEVELS)]
        out = rows.copy()
        out["Predicted_Level"] = probs.idxmax(axis=1)
        for lv in LEVELS:
            out[f"Prob_{lv}"] = probs[lv].round(4)
        return out

    def _snapshot_uncached(self, ts: pd.Timestamp) -> pd.DataFrame:
        return self._predict(self.df.iloc[self._rows_by_ts[ts]])

    def snapshot(self, ts: pd.Timestamp) -> pd.DataFrame:
        """All routes at one timestamp, with predictions (cached)."""
        return self._snapshot(ts)

    def history(self, route_id: str, end_ts: pd.Timestamp, hours: int) -> pd.DataFrame:
        pos = self._rows_by_route[route_id]
        stamps = self.df["Timestamp"].values[pos]
        end = np.searchsorted(stamps, end_ts.to_datetime64(), side="right")
        start = max(0, end - hours * 12)
        return self._predict(self.df.iloc[pos[start:end]])

    def predict_features(self, features: pd.DataFrame) -> pd.DataFrame:
        return self._predict(features)

    # -------------------------------------------------------- request -> features
    def features_from_request(self, *, route_id: str, timestamp: datetime, traffic_volume: float,
                              vehicle_count: int, avg_speed_kmph: float, travel_time_min: float,
                              queue_length_m: float, temperature_c: float, weather: str,
                              accident: bool, road_work: bool, emergency_vehicle: bool,
                              distance_km: float | None, free_flow_speed_kmph: float | None) -> pd.DataFrame:
        meta = self.require_route(route_id)
        ts = pd.Timestamp(timestamp)
        dist = distance_km if distance_km is not None else meta["distance_km"]
        ff = free_flow_speed_kmph if free_flow_speed_kmph is not None else meta["free_flow_speed_kmph"]
        yn = lambda b: "Yes" if b else "No"  # noqa: E731
        return pd.DataFrame([{
            "Traffic_Volume": traffic_volume, "Vehicle_Count": vehicle_count,
            "Avg_Speed_kmph": avg_speed_kmph, "Travel_Time_min": travel_time_min,
            "Queue_Length_m": queue_length_m, "Temperature_C": temperature_c,
            "Hour": ts.hour, "Minute": ts.minute, "Distance_km": dist,
            "Free_Flow_Speed_kmph": ff, "Speed_Ratio": avg_speed_kmph / ff,
            "Route_ID": route_id, "Accident": yn(accident), "Road_Work": yn(road_work),
            "Emergency_Vehicle": yn(emergency_vehicle), "Weather": weather,
            "Day_of_Week": ts.isoweekday(),                     # Monday=1 ... Sunday=7, as in the dataset
            "Peak_Hour": yn(ts.hour in PEAK_HOURS),
        }])
