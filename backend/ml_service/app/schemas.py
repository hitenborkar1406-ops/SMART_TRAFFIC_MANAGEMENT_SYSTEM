from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Level = Literal["Low", "Medium", "High"]
Weather = Literal["Clear", "Cloudy", "Rain"]


class Probabilities(BaseModel):
    Low: float
    Medium: float
    High: float


class Health(BaseModel):
    status: Literal["ok"]
    rows: int
    routes: int
    data_start: datetime
    data_end: datetime
    continuous_5min: bool
    model_classes: list[str]
    sklearn_version: str


class RouteInfo(BaseModel):
    route_id: str
    source: str
    destination: str
    distance_km: float
    alternate_route: str
    alternate_distance_km: float
    free_flow_speed_kmph: float


class RouteStatus(BaseModel):
    route_id: str
    source: str
    destination: str
    timestamp: datetime
    predicted_level: Level
    confidence: float = Field(description="Probability of the predicted level")
    probabilities: Probabilities
    recorded_level: Level = Field(description="Congestion_Level stored in the dataset for this record")
    traffic_volume: float
    vehicle_count: int
    avg_speed_kmph: float
    speed_ratio: float
    travel_time_min: float
    queue_length_m: float
    accident: bool
    road_work: bool
    emergency_vehicle: bool
    weather: Weather
    temperature_c: float


class CurrentResponse(BaseModel):
    timestamp: datetime
    summary: dict[Level, int] = Field(description="Number of routes per predicted level (before any filter)")
    routes: list[RouteStatus]


class HistoryPoint(BaseModel):
    timestamp: datetime
    predicted_level: Level
    recorded_level: Level
    probabilities: Probabilities
    traffic_volume: float
    avg_speed_kmph: float
    travel_time_min: float
    queue_length_m: float


class HistoryResponse(BaseModel):
    route_id: str
    start: datetime
    end: datetime
    points: list[HistoryPoint]


class RerouteResponse(BaseModel):
    route_id: str
    timestamp: datetime
    travel_time_min: float
    alternate_route: str
    alternate_distance_km: float
    alternate_time_min: float
    recommended_route: str
    time_saved_min: float
    reroute: bool = Field(description="True when the recommended route differs from this route")
    primary_predicted_level: Level
    alternate_predicted_level: Level


class PredictRequest(BaseModel):
    """Current conditions on one route. Routing outputs (Recommended_Route, Time_Saved_min) are rejected."""
    model_config = ConfigDict(
        extra="forbid",
        json_schema_extra={"example": {
            "route_id": "N001", "timestamp": "2026-09-30T08:30:00",
            "traffic_volume": 210.4, "vehicle_count": 190, "avg_speed_kmph": 33.5,
            "travel_time_min": 7.5, "queue_length_m": 85.0, "temperature_c": 27.4,
            "weather": "Clear", "accident": False, "road_work": False, "emergency_vehicle": False,
        }},
    )
    route_id: str
    timestamp: datetime = Field(description="Local time; Hour, Minute, Day_of_Week and Peak_Hour are derived from it")
    traffic_volume: float = Field(ge=0)
    vehicle_count: int = Field(ge=0)
    avg_speed_kmph: float = Field(gt=0)
    travel_time_min: float = Field(gt=0)
    queue_length_m: float = Field(ge=0)
    temperature_c: float = Field(ge=-10, le=55)
    weather: Weather
    accident: bool = False
    road_work: bool = False
    emergency_vehicle: bool = False
    distance_km: float | None = Field(None, gt=0, description="Defaults to the route's distance")
    free_flow_speed_kmph: float | None = Field(None, gt=0, description="Defaults to the route's free-flow speed")


class PredictResponse(BaseModel):
    route_id: str
    predicted_level: Level
    confidence: float
    probabilities: Probabilities
