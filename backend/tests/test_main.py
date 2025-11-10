"""Unit tests for FastAPI backend routes.

These tests exercise core endpoints using FastAPI's TestClient. The
database is created in‑memory (SQLite) to avoid polluting the real
PostgreSQL instance. Each test seeds required data before exercising
endpoints.
"""

from datetime import datetime, timedelta

import pytest
from fastapi.testclient import TestClient

from app.main import app, get_db
from app import models
from app.database import Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


# Create an in‑memory SQLite engine for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Override the get_db dependency to use the test database
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="module")
def client():
    # Create tables and seed test data
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        # Seed one university
        uni = models.University(name="Test Uni", points=50)
        db.add(uni)
        db.commit()
        db.refresh(uni)
        # Seed one user
        user = models.User(name="Test User", role=models.UserRole.student, university_id=uni.id)
        db.add(user)
        db.commit()
        db.refresh(user)
        # Seed schedule items
        item = models.ScheduleItem(
            start_time=datetime.utcnow() + timedelta(hours=1),
            end_time=datetime.utcnow() + timedelta(hours=2),
            description="Test lesson"
        )
        db.add(item)
        # Seed events
        event = models.Event(
            event_time=datetime.utcnow() + timedelta(hours=3),
            title="Test event",
            description="Test description"
        )
        db.add(event)
        db.commit()
    finally:
        db.close()
    with TestClient(app) as c:
        yield c


def test_root(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_get_schedule(client: TestClient):
    response = client.get("/schedule")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["description"] == "Test lesson"


def test_signup_and_flags(client: TestClient):
    # Retrieve user and schedule ids
    db = TestingSessionLocal()
    try:
        user = db.query(models.User).first()
        item = db.query(models.ScheduleItem).first()
    finally:
        db.close()
    # Sign up user to schedule
    res = client.post(f"/schedule/{item.id}/signup", params={"user_id": user.id})
    assert res.status_code == 200
    assert res.json() == {"created": True}
    # Second sign up should return False
    res2 = client.post(f"/schedule/{item.id}/signup", params={"user_id": user.id})
    assert res2.status_code == 200
    assert res2.json() == {"created": False}
    # Now schedule endpoint should indicate signed_up
    resp = client.get("/schedule", params={"user_id": user.id})
    assert resp.status_code == 200
    data = resp.json()
    assert data[0]["signed_up"] is True


def test_events(client: TestClient):
    response = client.get("/events")
    assert response.status_code == 200
    events = response.json()
    assert len(events) == 1
    assert events[0]["title"] == "Test event"


def test_leaderboard(client: TestClient):
    response = client.get("/leaderboard")
    assert response.status_code == 200
    leaderboard = response.json()
    assert len(leaderboard) >= 1
    assert leaderboard[0]["university"]["name"] == "Test Uni"


def test_profile(client: TestClient):
    # fetch user id from DB
    db = TestingSessionLocal()
    try:
        user = db.query(models.User).first()
    finally:
        db.close()
    response = client.get(f"/profile/{user.id}")
    assert response.status_code == 200
    profile = response.json()
    assert profile["name"] == "Test User"
    # update profile
    new_data = {"name": "Updated", "progress": 42}
    put_resp = client.put(f"/profile/{user.id}", json=new_data)
    assert put_resp.status_code == 200
    updated_profile = put_resp.json()
    assert updated_profile["name"] == "Updated"
    assert updated_profile["progress"] == 42