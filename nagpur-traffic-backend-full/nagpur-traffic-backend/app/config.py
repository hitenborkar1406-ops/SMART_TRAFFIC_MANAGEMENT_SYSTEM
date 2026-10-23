import os
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def _path(env_name: str, default: str) -> Path:
    p = Path(os.getenv(env_name, default))
    return p if p.is_absolute() else ROOT / p


@dataclass(frozen=True)
class Settings:
    model_path: Path = field(default_factory=lambda: _path("MODEL_PATH", "models/nagpur_traffic_model.pkl"))
    data_path: Path = field(default_factory=lambda: _path("DATA_PATH", "data/nagpur_current_congestion.csv"))
    cors_origins: list[str] = field(
        default_factory=lambda: [o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",") if o.strip()]
    )
