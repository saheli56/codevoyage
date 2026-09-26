import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "HEALTHY"

def test_scam_message_dangerous():
    payload = {
        "text": "URGENT: Your SBI netbanking account is suspended due to expired KYC. Update immediately at http://sbi-kyc-verify.top or access will be blocked."
    }
    response = client.post("/api/v1/analyze/message", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["overall_risk"] == "DANGEROUS"
    assert data["risk_score"] >= 70
    assert len(data["signals"]) >= 2

def test_legitimate_bank_alert():
    payload = {
        "text": "Your account credit card ending in 4021 was charged INR 450.00 at Starbucks on 26-Sep-2026."
    }
    response = client.post("/api/v1/analyze/message", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["overall_risk"] == "SAFE"
    assert data["risk_score"] < 35

def test_suspicious_payment_assessment():
    payload = {
        "amount": 15000.0,
        "recipient_vpa": "sbi-lottery-support@okaxis",
        "is_new_beneficiary": True,
        "context_note": "Processing fee for prize"
    }
    response = client.post("/api/v1/analyze/transaction", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["overall_risk"] == "DANGEROUS"
    assert data["risk_score"] >= 65

def test_model_evaluation_metrics():
    response = client.get("/api/v1/models/evaluation")
    assert response.status_code == 200
    data = response.json()
    assert data["f1_score"] >= 0.90
    assert data["precision"] >= 0.90
    assert data["recall"] >= 0.90
    assert "confusion_matrix" in data
