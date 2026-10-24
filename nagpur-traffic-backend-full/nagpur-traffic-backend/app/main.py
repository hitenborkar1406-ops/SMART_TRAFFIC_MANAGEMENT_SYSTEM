import logging
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Literal

import pandas as pd
import sklearn
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from .config import Settings
from .schemas import (CurrentResponse, Health, HistoryPoint, HistoryResponse, Level, PredictRequest,
                      PredictResponse, Probabilities, RerouteResponse, RouteInfo, RouteStatus)
from .service import LEVELS, TimestampNotFound, TrafficService, UnknownRoute

logging.basicConfig(level=logging.INFO)
settings = Settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.service = TrafficService(settings.model_path, settings.data_path)
    yield


app = FastAPI(
    title="Nagpur Traffic Congestion API",
    version="1.0.0",
    description="Serves congestion predictions from the trained XGBoost pipeline and route data "
                "from nagpur_current_congestion.csv.",
    lifespan=lifespan,
)
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins, allow_methods=["*"], allow_headers=["*"])

AtParam = Query(None, description="ISO 8601 local time, e.g. 2026-09-30T08:30. Uses the latest record at or before it. "
                                  "Omit for the most recent record.")


def _svc(request: Request) -> TrafficService:
    return request.app.state.service


def _resolve(svc: TrafficService, at: datetime | None) -> pd.Timestamp:
    try:
        return svc.resolve_timestamp(at)
    except TimestampNotFound as e:
        raise HTTPException(404, str(e))


def _route(svc: TrafficService, route_id: str) -> dict:
    try:
        return svc.require_route(route_id.upper())
    except UnknownRoute:
        raise HTTPException(404, f"Unknown route '{route_id}'")


def _probs(r) -> Probabilities:
    return Probabilities(Low=r.Prob_Low, Medium=r.Prob_Medium, High=r.Prob_High)


def _status(r) -> RouteStatus:
    return RouteStatus(
        route_id=r.Route_ID, source=r.Source, destination=r.Destination, timestamp=r.Timestamp.to_pydatetime(),
        predicted_level=r.Predicted_Level, confidence=getattr(r, f"Prob_{r.Predicted_Level}"), probabilities=_probs(r),
        recorded_level=r.Congestion_Level, traffic_volume=r.Traffic_Volume, vehicle_count=int(r.Vehicle_Count),
        avg_speed_kmph=r.Avg_Speed_kmph, speed_ratio=round(r.Speed_Ratio, 4), travel_time_min=r.Travel_Time_min,
        queue_length_m=r.Queue_Length_m, accident=r.Accident == "Yes", road_work=r.Road_Work == "Yes",
        emergency_vehicle=r.Emergency_Vehicle == "Yes", weather=r.Weather, temperature_c=r.Temperature_C,
    )


@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse("/docs")


@app.get("/health", response_model=Health, tags=["meta"])
def health(request: Request):
    s = _svc(request)
    return Health(status="ok", rows=len(s.df), routes=len(s.routes), data_start=s.first_ts.to_pydatetime(),
                  data_end=s.last_ts.to_pydatetime(), continuous_5min=s.continuous_5min,
                  model_classes=list(s.model.classes_), sklearn_version=sklearn.__version__)


@app.get("/routes", response_model=list[RouteInfo], tags=["routes"])
def list_routes(request: Request):
    return list(_svc(request).routes.values())


@app.get("/congestion/current", response_model=CurrentResponse, tags=["congestion"])
def current_congestion(
    request: Request,
    at: datetime | None = AtParam,
    level: Level | None = Query(None, description="Only return routes with this predicted level"),
    sort: Literal["route", "severity"] = Query("route", description="'severity' lists the most congested first"),
):
    s = _svc(request)
    ts = _resolve(s, at)
    snap = s.snapshot(ts)
    summary = {lv: int((snap.Predicted_Level == lv).sum()) for lv in LEVELS}
    if level:
        snap = snap[snap.Predicted_Level == level]
    if sort == "severity":
        order = snap.Predicted_Level.map({"High": 2, "Medium": 1, "Low": 0})
        snap = snap.assign(_o=order).sort_values(["_o", "Prob_High", "Queue_Length_m"], ascending=False)
    return CurrentResponse(timestamp=ts.to_pydatetime(), summary=summary,
                           routes=[_status(r) for r in snap.itertuples(index=False)])


@app.get("/congestion/{route_id}", response_model=RouteStatus, tags=["congestion"])
def route_congestion(request: Request, route_id: str, at: datetime | None = AtParam):
    s = _svc(request)
    _route(s, route_id)
    ts = _resolve(s, at)
    snap = s.snapshot(ts)
    return _status(snap[snap.Route_ID == route_id.upper()].iloc[0])


@app.get("/congestion/{route_id}/history", response_model=HistoryResponse, tags=["congestion"])
def route_history(request: Request, route_id: str, at: datetime | None = AtParam,
                  hours: int = Query(6, ge=1, le=48, description="Window length ending at `at`")):
    s = _svc(request)
    _route(s, route_id)
    ts = _resolve(s, at)
    h = s.history(route_id.upper(), ts, hours)
    points = [
        HistoryPoint(timestamp=r.Timestamp.to_pydatetime(), predicted_level=r.Predicted_Level,
                     recorded_level=r.Congestion_Level, probabilities=_probs(r), traffic_volume=r.Traffic_Volume,
                     avg_speed_kmph=r.Avg_Speed_kmph, travel_time_min=r.Travel_Time_min,
                     queue_length_m=r.Queue_Length_m)
        for r in h.itertuples(index=False)
    ]
    return HistoryResponse(route_id=route_id.upper(), start=points[0].timestamp, end=points[-1].timestamp, points=points)


@app.get("/reroute/{route_id}", response_model=RerouteResponse, tags=["routing"])
def reroute(request: Request, route_id: str, at: datetime | None = AtParam):
    """Routing view: uses the dataset's Recommended_Route / Time_Saved_min. These never feed the congestion model."""
    s = _svc(request)
    meta = _route(s, route_id)
    ts = _resolve(s, at)
    snap = s.snapshot(ts).set_index("Route_ID")
    r = snap.loc[meta["route_id"]]
    return RerouteResponse(
        route_id=meta["route_id"], timestamp=ts.to_pydatetime(), travel_time_min=r.Travel_Time_min,
        alternate_route=r.Alternate_Route, alternate_distance_km=r.Alternate_Distance_km,
        alternate_time_min=r.Alternate_Time_min, recommended_route=r.Recommended_Route,
        time_saved_min=r.Time_Saved_min, reroute=r.Recommended_Route != meta["route_id"],
        primary_predicted_level=r.Predicted_Level, alternate_predicted_level=snap.loc[r.Alternate_Route, "Predicted_Level"],
    )


@app.post("/predict", response_model=PredictResponse, tags=["congestion"])
def predict(request: Request, body: PredictRequest):
    s = _svc(request)
    if body.route_id not in s.routes:
        raise HTTPException(422, f"Unknown route '{body.route_id}'")
    feats = s.features_from_request(**body.model_dump())
    r = next(s.predict_features(feats).itertuples(index=False))
    return PredictResponse(route_id=body.route_id, predicted_level=r.Predicted_Level,
                           confidence=getattr(r, f"Prob_{r.Predicted_Level}"), probabilities=_probs(r))
