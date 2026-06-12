# churn-radar
ML-powered churn prediction dashboard — React frontend, Python/FastAPI backend, XGBoost model

## What it does

ChurnRadar predicts which customers are likely to churn and explains why. It combines an XGBoost classification model with SHAP explainability so every prediction comes with a breakdown of the contributing factors — not just a score.

**Pipeline overview:**
1. Accepts customer data via the dashboard or API
2. Runs prediction through a trained XGBoost model
3. Generates SHAP values to explain each prediction
4. Displays results and feature importance in a React dashboard

## Tech stack

**Backend**
- Python, FastAPI
- XGBoost
- SHAP
- Pandas, Scikit-learn

**Frontend**
- React
- Deployed via Vercel

## Model performance

- Accuracy: 84.5%

## Project structure

```
churn-radar/
├── backend/
│   ├── model/
│   │   └── train.py        # XGBoost training pipeline
│   ├── main.py             # FastAPI app
│   └── requirements.txt
├── frontend/
│   ├── src/
│   └── package.json
```

## Getting started

### Prerequisites

- Python 3.10+
- Node.js 18+

### Backend setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend setup

```bash
cd frontend
npm install
npm run dev
```

## Notes

- SHAP values are generated per prediction — every result includes a feature importance breakdown
- Model was trained on a standard telecom churn dataset

## Author

Shaheer Aslam — [LinkedIn](https://www.linkedin.com/in/shaheer-aslam-54b70b37b) | [Live Demo](https://churnradar-nu.vercel.app)
