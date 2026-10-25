import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.service import MODEL_FEATURES, ROUTING_ONLY

cfg = Settings()
pytestmark = pytest.mark.skipif(
    not (cfg.model_path.exists() and cfg.data_path.exists()),
    reason="model .pkl and data .csv must be in place (see README)",
)


@pytest.fixture(scope="module")
def client():
    from app.main import app
    with TestClient(app) as c:      # runs lifespan -> loads model + data
        yield c


def test_model_never_sees_routing_outputs():
    assert not ROUTING_ONLY & set(MODEL_FEATURES)


def test_health(client):
    h = client.get("/health").json()
    assert h["rows"] == 26 * 30 * 288 and h["routes"] == 26 and h["continuous_5min"] is True
    assert set(h["model_classes"]) == {"Low", "Medium", "High"}


def test_routes(client):
    r = client.get("/routes").json()
    assert len(r) == 26 and {"route_id", "alternate_route", "free_flow_speed_kmph"} <= r[0].keys()


def test_current_all_routes(client):
    d = client.get("/congestion/current").json()
    assert len(d["routes"]) == 26 and sum(d["summary"].values()) == 26
    for r in d["routes"]:
        assert abs(sum(r["probabilities"].values()) - 1) < 1e-3


def test_current_filter_and_sort(client):
    d = client.get("/congestion/current", params={"at": "2026-09-15T08:30", "sort": "severity"}).json()
    order = {"High": 2, "Medium": 1, "Low": 0}
    levels = [order[r["predicted_level"]] for r in d["routes"]]
    assert levels == sorted(levels, reverse=True)
    only = client.get("/congestion/current", params={"at": "2026-09-15T08:30", "level": "Low"}).json()
    assert all(r["predicted_level"] == "Low" for r in only["routes"])


def test_at_snaps_to_five_minutes_and_out_of_range(client):
    d = client.get("/congestion/N001", params={"at": "2026-09-15T08:33"}).json()
    assert d["timestamp"].endswith("08:30:00")
    assert client.get("/congestion/N001", params={"at": "2026-10-05T08:30"}).status_code == 404
    assert client.get("/congestion/N001", params={"at": "2026-08-01T08:30"}).status_code == 404


def test_unknown_route(client):
    assert client.get("/congestion/N999").status_code == 404
    assert client.get("/reroute/N999").status_code == 404


def test_history(client):
    h = client.get("/congestion/n001/history", params={"at": "2026-09-15T12:00", "hours": 3}).json()
    assert len(h["points"]) == 36 and h["end"].startswith("2026-09-15T12:00")
    ts = [p["timestamp"] for p in h["points"]]
    assert ts == sorted(ts)


def test_reroute_matches_dataset(client):
    r = client.get("/reroute/N011", params={"at": "2026-09-15T08:30"}).json()
    assert r["reroute"] == (r["recommended_route"] != "N011")
    assert r["time_saved_min"] >= 0


def test_predict_round_trip_matches_current(client):
    """Posting a record's own fields to /predict must reproduce the /congestion prediction."""
    row = client.get("/congestion/N005", params={"at": "2026-09-15T08:30"}).json()
    body = {k: row[k] for k in (
        "route_id", "timestamp", "traffic_volume", "vehicle_count", "avg_speed_kmph", "travel_time_min",
        "queue_length_m", "temperature_c", "weather", "accident", "road_work", "emergency_vehicle")}
    p = client.post("/predict", json=body)
    assert p.status_code == 200
    assert p.json()["predicted_level"] == row["predicted_level"]


def test_predict_rejects_routing_outputs_and_bad_input(client):
    ok = {"route_id": "N001", "timestamp": "2026-09-30T08:30", "traffic_volume": 200, "vehicle_count": 180,
          "avg_speed_kmph": 30, "travel_time_min": 8, "queue_length_m": 60, "temperature_c": 27, "weather": "Clear"}
    assert client.post("/predict", json=ok).status_code == 200
    assert client.post("/predict", json={**ok, "recommended_route": "N003"}).status_code == 422
    assert client.post("/predict", json={**ok, "time_saved_min": 3}).status_code == 422
    assert client.post("/predict", json={**ok, "weather": "Snow"}).status_code == 422
    assert client.post("/predict", json={**ok, "route_id": "N999"}).status_code == 422
    assert client.post("/predict", json={**ok, "avg_speed_kmph": -5}).status_code == 422
