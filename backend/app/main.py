"""Main FastAPI application entrypoint.

This module configures the FastAPI app, binds route handlers, and wires
database access via dependency injection. Endpoints are designed to be
lightweight wrappers around functions in `crud.py`. The application
autonomously initializes the database on startup and seeds it with sample
data for a quick demonstration.

Security note: authentication is simplified. Users are created via
invitation links outside of this backend. In a real system you would
integrate proper authentication and enforce access control. Here we only
require a `user_id` query parameter where necessary.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import init_db
from .api import (
    schedule_router,
    events_router,
    leaderboard_router,
    university_router,
    profile_router,
)


# Initialize the FastAPI app
app = FastAPI(
    title="University Support API",
    description="Backend API for university mobile web application.",
    version="0.1.0",
)

origins = [
    "http://localhost",
    "http://localhost:5173",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    """Initialize the database when the application starts."""
    init_db()

# Mount individual routers from the api package. Splitting the routes
# into separate modules clarifies their responsibilities and makes the
# codebase easier to extend.
app.include_router(schedule_router)
app.include_router(events_router)
app.include_router(leaderboard_router)
app.include_router(university_router)
app.include_router(profile_router)


@app.get("/", tags=["root"])
def read_root() -> dict[str, str]:
    """Root endpoint showing service status."""
    return {"status": "ok"}

