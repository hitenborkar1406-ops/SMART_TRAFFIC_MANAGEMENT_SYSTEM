# Nagpur Traffic Congestion API

FastAPI service that serves congestion predictions from `nagpur_traffic_model.pkl`
(scikit-learn Pipeline: StandardScaler + OneHotEncoder -> RandomForestClassifier) and route data from
`nagpur_current_congestion.csv`.

## Setup

```bash
python -m venv .venv && source .venv/bin/activate      # Python 3.10+
pip install -r requirements.txt
cp /path/to/nagpur_traffic_model.pkl models/
cp /path/to/nagpur_current_congestion.csv data/
uvicorn app.main:app --reload
```

Docs: http://localhost:8000/docs. Paths can be changed with `MODEL_PATH` / `DATA_PATH` (see `.env.example`).

**scikit-learn must be 1.6.1.** The model was pickled with that version and newer releases fail to load it.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Row/route counts, data range, 5-minute continuity check, model classes |
| GET | `/routes` | Route metadata (source, destination, distance, alternate route) |
| GET | `/congestion/current` | Predicted level for all routes. Params: `at`, `level`, `sort=route\|severity` |
| GET | `/congestion/{route_id}` | One route at `at` |
| GET | `/congestion/{route_id}/history` | Predicted vs recorded level, `hours` (1-48) ending at `at` |
| GET | `/reroute/{route_id}` | Recommended route and time saved, plus predicted level on both routes |
| POST | `/predict` | Predict from your own sensor readings (see example in `/docs`) |

"Current" is the latest record in the CSV (the data is a historical replay). `at` takes an ISO local time and
snaps down to the 5-minute record at or before it; times outside the data range return 404.

```bash
curl "localhost:8000/congestion/current?sort=severity"
curl "localhost:8000/congestion/N001/history?at=2026-09-15T12:00&hours=6"
curl -X POST localhost:8000/predict -H 'content-type: application/json' -d '{
  "route_id":"N001","timestamp":"2026-09-30T08:30","traffic_volume":210,"vehicle_count":190,
  "avg_speed_kmph":33,"travel_time_min":7.5,"queue_length_m":85,"temperature_c":27,"weather":"Clear"}'
```

`/predict` derives Hour, Minute, Day_of_Week (Mon=1), Peak_Hour (hours 8-10 and 17-19) and Speed_Ratio from the
request, and fills Distance_km and Free_Flow_Speed_kmph from the route when omitted. It rejects unknown fields,
so `recommended_route` / `time_saved_min` cannot be sent to the model.

## Design rules

- `Recommended_Route` and `Time_Saved_min` are served only by `/reroute`. At startup the service checks the model's
  feature list and refuses to start if either appears in it.
- No `Predicted_Congestion_15min` is added. This model classifies the current level; it does not forecast.

## Tests and Docker

```bash
pip install -r requirements-dev.txt && pytest          # needs the model and CSV in place
docker build -t nagpur-traffic .
docker run -p 8000:8000 -v $(pwd)/models:/srv/models -v $(pwd)/data:/srv/data nagpur-traffic
```
