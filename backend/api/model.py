import joblib
import numpy as np
import pandas as pd
import shap
import os

BASE = os.path.dirname(os.path.abspath(__file__))
MODELS = BASE

model = joblib.load(os.path.join(MODELS, 'churn_model.pkl'))
feature_cols = joblib.load(os.path.join(MODELS, 'feature_columns.pkl'))
threshold = joblib.load(os.path.join(MODELS, 'threshold.pkl'))
explainer = joblib.load(os.path.join(MODELS, 'shap_explainer.pkl'))

ACTIONS = {
    'Contract':       "Offer a discounted annual plan — month-to-month customers churn 3x more",
    'MonthlyCharges': "Review pricing — high charges without perceived value is the top churn driver",
    'tenure':         "Trigger onboarding support — new customers need a check-in call in first 90 days",
    'OnlineSecurity': "Offer free security add-on trial — customers without it churn significantly more",
    'TechSupport':    "Assign a support rep — customers without tech support feel abandoned",
    'InternetService':"Review service quality — fiber customers have more alternatives and leave faster",
    'TotalCharges':   "Send a value summary email showing what they've gotten for their investment",
}

def get_risk_level(prob):
    if prob >= 0.75:
        return "critical"
    elif prob >= 0.55:
        return "high"
    elif prob >= 0.35:
        return "medium"
    else:
        return "low"

def engineer_features(df):
    df = df.copy()
    df['charge_per_month'] = df['TotalCharges'] / (df['tenure'] + 1)
    df['num_services'] = (
        (df['OnlineSecurity'] == 1).astype(int) +
        (df['OnlineBackup'] == 1).astype(int) +
        (df['DeviceProtection'] == 1).astype(int) +
        (df['TechSupport'] == 1).astype(int) +
        (df['StreamingTV'] == 1).astype(int) +
        (df['StreamingMovies'] == 1).astype(int)
    )
    df['is_new_customer'] = (df['tenure'] <= 3).astype(int)
    df['high_risk_combo'] = (
        (df['Contract'] == 0) &
        (df['MonthlyCharges'] > 65)
    ).astype(int)
    return df

ENCODINGS = {
    'gender':          {'Male': 1, 'Female': 0},
    'Partner':         {'Yes': 1, 'No': 0},
    'Dependents':      {'Yes': 1, 'No': 0},
    'PhoneService':    {'Yes': 1, 'No': 0},
    'PaperlessBilling':{'Yes': 1, 'No': 0},
    'MultipleLines':   {'Yes': 2, 'No': 1, 'No phone service': 0},
    'InternetService': {'Fiber optic': 2, 'DSL': 1, 'No': 0},
    'OnlineSecurity':  {'Yes': 2, 'No': 1, 'No internet service': 0},
    'OnlineBackup':    {'Yes': 2, 'No': 1, 'No internet service': 0},
    'DeviceProtection':{'Yes': 2, 'No': 1, 'No internet service': 0},
    'TechSupport':     {'Yes': 2, 'No': 1, 'No internet service': 0},
    'StreamingTV':     {'Yes': 2, 'No': 1, 'No internet service': 0},
    'StreamingMovies': {'Yes': 2, 'No': 1, 'No internet service': 0},
    'Contract':        {'Month-to-month': 0, 'One year': 1, 'Two year': 2},
    'PaymentMethod':   {
        'Electronic check': 0,
        'Mailed check': 1,
        'Bank transfer (automatic)': 2,
        'Credit card (automatic)': 3
    },
}

def preprocess(customer_dict):
    df = pd.DataFrame([customer_dict])
    for col, mapping in ENCODINGS.items():
        if col in df.columns:
            df[col] = df[col].map(mapping)
    df = engineer_features(df)
    df = df[feature_cols]
    return df

def get_shap_reasons(row_df, top_n=5):
    shap_vals = explainer.shap_values(row_df)[0]
    feature_names = feature_cols
    feature_values = row_df.iloc[0].to_dict()

    pairs = sorted(
        zip(feature_names, shap_vals),
        key=lambda x: abs(x[1]),
        reverse=True
    )

    reasons = []
    for feature, impact in pairs[:top_n]:
        reasons.append({
            "feature": feature,
            "value": round(float(feature_values[feature]), 2),
            "shap_impact": round(float(impact), 4),
            "direction": "increases risk" if impact > 0 else "decreases risk"
        })
    return reasons

def get_action(shap_reasons):
    for r in shap_reasons:
        if r['direction'] == 'increases risk':
            feature = r['feature']
            if feature in ACTIONS:
                return ACTIONS[feature]
    return "Monitor closely and schedule a proactive check-in call"

def predict(customer_dict, customer_id="unknown"):
    df = preprocess(customer_dict)
    prob = float(model.predict_proba(df)[0][1])
    risk = get_risk_level(prob)
    reasons = get_shap_reasons(df)
    action = get_action(reasons)

    return {
        "customer_id": customer_id,
        "churn_probability": round(prob, 4),
        "risk_level": risk,
        "monthly_charges": customer_dict.get('MonthlyCharges', 0),
        "tenure": customer_dict.get('tenure', 0),
        "contract": customer_dict.get('Contract', ''),
        "shap_reasons": reasons,
        "recommended_action": action
    }