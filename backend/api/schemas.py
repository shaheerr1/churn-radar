from pydantic import BaseModel
from typing import List

class CustomerInput(BaseModel):
    tenure: float
    MonthlyCharges: float
    TotalCharges: float
    Contract: str
    InternetService: str
    PaymentMethod: str
    gender: str
    SeniorCitizen: int
    Partner: str
    Dependents: str
    PhoneService: str
    MultipleLines: str
    OnlineSecurity: str
    OnlineBackup: str
    DeviceProtection: str
    TechSupport: str
    StreamingTV: str
    StreamingMovies: str
    PaperlessBilling: str

class ShapReason(BaseModel):
    feature: str
    value: float
    shap_impact: float
    direction: str

class PredictionResponse(BaseModel):
    customer_id: str
    churn_probability: float
    risk_level: str
    monthly_charges: float
    tenure: int
    contract: str
    shap_reasons: List[ShapReason]
    recommended_action: str