"""API routers for the university backend.

This package groups the route handlers into separate modules based on
functional areas. Each module exposes a `router` object that can be
mounted onto the FastAPI application in `main.py`. Splitting routes
into dedicated routers improves organisation and makes the codebase
easier to navigate.
"""

from .schedule import router as schedule_router  # noqa: F401
# from .events import router as events_router  # noqa: F401
# from .leaderboard import router as leaderboard_router  # noqa: F401
# from .university import router as university_router  # noqa: F401
from .profile import router as profile_router  # noqa: F401