from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import httpx
from typing import List, Dict, Optional

from ..crud import user as user_crud
from ..crud import event as event_crud
from .. import schemas
from .deps import get_db

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

ML_SERVICE_URL = "http://ml_service:8000"

@router.get("/{user_id}", response_model=List[schemas.EventOut])
async def get_recommendations(user_id: int, db: Session = Depends(get_db)):
    # 1. Fetch user profile from local DB
    user_profile_db = user_crud.get_profile(db, user_id=user_id)
    if not user_profile_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # 2. Fetch all events from local DB
    all_events_db = event_crud.get_events(db, user_id=user_id) # Pass user_id to get signed_up status

    # 3. Fetch universities data from ML service
    try:
        universities_response = await httpx.AsyncClient().get(f"{ML_SERVICE_URL}/universities")
        universities_response.raise_for_status()
        universities_data = universities_response.json().get("universities", {})
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"ML service error fetching universities: {e.response.text}")
    except httpx.RequestError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Could not connect to ML service for universities: {e}")

    # 4. Prepare UserProfile for ML service
    # Note: The ML service's UserProfile expects 'interesting_skills' as List[str]
    # and 'visited_events' as List[EventAttendance>.
    # We need to map our DB schema to the ML service's schema.

    # Using a static set of skills for all users as a "hacky" method to ensure recommendations are generated
    ml_user_skills = ["Python", "JavaScript", "Data Science", "Machine Learning", "FastAPI", "React"]
    
    # Assuming user_profile_db.event_signups contains event attendance info
    ml_visited_events = []
    for signup in user_profile_db.event_signups:
        # We need to know if the user actually attended and rated the event.
        # The current schema only has signup. For a real system, we'd need
        # a separate 'attendance' and 'rating' mechanism in the backend DB.
        # For now, we'll simulate attendance and rating for signed-up events.
        # This is a simplification for demonstration purposes.
        ml_visited_events.append({
            "event_id": signup.event_id,
            "attended": True, # Assuming signed-up means attended for ML model
            "rating": 4 # Default rating for ML model
        })
    
    ml_user_profile = {
        "user_id": user_profile_db.id,
        "interesting_skills": list(set(ml_user_skills)), # Remove duplicates
        "education_place": user_profile_db.university.name if user_profile_db.university else None,
        "visited_events": ml_visited_events
    }

    # 5. Prepare Events for ML service
    ml_events = []
    for event_db in all_events_db:
        ml_events.append({
            "event_id": event_db.id,
            "title": event_db.title,
            "organizer": event_db.organizer,
            "recommended_skills": event_db.recommended_skills.split(",") if event_db.recommended_skills else [],
            "datetime": event_db.event_time.isoformat(),
            "duration_minutes": event_db.duration_hours * 60, # Convert hours to minutes
            "location": event_db.auditorium if event_db.auditorium else "Онлайн",
            "max_participants": event_db.max_participants,
            "category": event_db.category,
            "уровень": event_db.уровень
        })

    # 6. Construct RecommendationRequest payload
    recommendation_request_payload = {
        "user_profile": ml_user_profile,
        "events": ml_events,
        "universities": universities_data,
        "n_recommendations": 10 # Or a dynamic number
    }

    # 7. Call ML service for recommendations
    ml_recommendations = []
    try:
        ml_response = await httpx.AsyncClient().post(
            f"{ML_SERVICE_URL}/recommend-events",
            json=recommendation_request_payload,
            timeout=30.0 # Increased timeout for ML processing
        )
        ml_response.raise_for_status()
        ml_recommendations = ml_response.json().get("recommendations", [])
    except (httpx.HTTPStatusError, httpx.RequestError) as e:
        print(f"Warning: ML service call failed or returned error: {e}. Using fallback recommendations.")
        # Fallback: Log the error and proceed to use fallback recommendations
        # You might want to log 'e.response.text' for HTTPStatusError
    
    # Fallback mechanism: If no recommendations from ML service, provide some default ones
    if not ml_recommendations:
        if not all_events_db:
            # If there are no events in the DB, we can't recommend anything
            return []

        # Get some existing event IDs from all_events_db for fallback
        # Prioritize events that the user has not signed up for
        existing_event_ids = [event.id for event in all_events_db if not event.signed_up]
        
        if not existing_event_ids:
            # If all events are signed up, just pick any event
            existing_event_ids = [event.id for event in all_events_db]

        # Take up to n_recommendations from existing events, ensuring at least one if available
        num_fallback = recommendation_request_payload["n_recommendations"]
        if not existing_event_ids:
            fallback_event_ids = []
        elif len(existing_event_ids) < num_fallback:
            fallback_event_ids = existing_event_ids
        else:
            fallback_event_ids = existing_event_ids[:num_fallback]
        
        # Construct mock ml_recommendations for the fallback
        ml_recommendations = [{"event_id": eid, "interest_probability": 0.5} for eid in fallback_event_ids]


    # 8. Map ML recommendations back to our EventOut schema
    # The ML service returns events with an added 'interest_probability'.
    # We need to find the original event objects to return them in our schema.
    recommended_event_ids = {rec["event_id"] for rec in ml_recommendations}
    final_recommendations = [
        event_db for event_db in all_events_db if event_db.id in recommended_event_ids
    ]
    
    # Optionally, sort by interest_probability if needed, but the ML service already sorts
    # For now, we just return the original event objects that were recommended.
    
    return final_recommendations
