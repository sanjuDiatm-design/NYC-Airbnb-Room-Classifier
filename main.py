from fastapi import FastAPI
import pandas as pd
from pydantic import BaseModel, Field
import joblib
from fastapi.middleware.cors import CORSMiddleware

# ── Compatibility patches for sklearn 1.6.x pkl loaded under sklearn 1.9.x ──
import sklearn.compose._column_transformer as _ct
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer

# 1. Restore removed _RemainderColsList class (dropped in sklearn 1.7)
if not hasattr(_ct, "_RemainderColsList"):
    class _RemainderColsList(list):
        def __init__(self, *args, **kwargs):
            super().__init__(*args)
            self.__dict__.update(kwargs)
    _ct._RemainderColsList = _RemainderColsList

def _patch_pipeline(est):
    """Recursively patch all estimators for sklearn 1.6 → 1.9 compatibility."""
    # SimpleImputer: _fill_dtype was renamed to _fit_dtype in sklearn 1.7
    if isinstance(est, SimpleImputer):
        if not hasattr(est, "_fill_dtype") and hasattr(est, "_fit_dtype"):
            est._fill_dtype = est._fit_dtype
        elif not hasattr(est, "_fit_dtype") and hasattr(est, "_fill_dtype"):
            est._fit_dtype = est._fill_dtype

    # Recurse into Pipeline steps
    if isinstance(est, Pipeline):
        for _, step in est.steps:
            _patch_pipeline(step)

    # Recurse into ColumnTransformer transformers
    if isinstance(est, ColumnTransformer):
        for item in getattr(est, "transformers_", []):
            _, transformer, _ = item
            _patch_pipeline(transformer)
# ─────────────────────────────────────────────────────────────────────────────

model = joblib.load("Model_Pipeline.pkl")
_patch_pipeline(model)  # Apply all compat patches right after loading


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


COLUMNS = ["latitude", "longitude", "price", "minimum_nights",
    "number_of_reviews", "reviews_per_month",
    "calculated_host_listings_count", "availability_365",
    "neighbourhood_group", "neighbourhood",]


#Pydantic Model = the input validation
class Features(BaseModel):
    latitude: float = Field(..., ge=-90, le=90, description="Latitude coordinate")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude coordinate")
    price: float = Field(..., gt=0, description="Price per night, must be positive")
    minimum_nights: int = Field(..., ge=1, le=365, description="Minimum nights required for booking")
    number_of_reviews: int = Field(..., ge=0, description="Total number of reviews")
    reviews_per_month: float = Field(..., ge=0, description="Average reviews per month")
    calculated_host_listings_count: int = Field(..., ge=0, description="Number of listings by this host")
    availability_365: int = Field(..., ge=0, le=365, description="Days available out of 365")
    neighbourhood_group: str = Field(..., min_length=1, description="Borough or neighbourhood group")
    neighbourhood: str = Field(..., min_length=1, description="Specific neighbourhood name")



@app.get('/')
def greet():
    return "Hello Guyss"


@app.post('/predict')
def predict(features: Features):
    row = pd.DataFrame([features.model_dump()], columns=COLUMNS)
    prediction  = model.predict(row)
    probability = model.predict_proba(row)

    return {
        "Predicted_room_type": prediction[0],
        "Probability": probability.tolist()[0]}