from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict
from datetime import datetime
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from collections import defaultdict
import numpy as np
import uvicorn
from skills import AVAILABLE_SKILLS
from universities import TARGET_UNIVERSITIES

app = FastAPI(title="Event Recommendation API", version="1.0.0")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        error_msg = str(error.get('msg', ''))
        if error_msg.startswith('Value error, '):
            error_msg = error_msg.replace('Value error, ', '', 1)
        new_error = {
            'loc': error.get('loc', []),
            'msg': error_msg,
            'type': error.get('type', 'validation_error')
        }
        if 'input' in error:
            new_error['input'] = error['input']
        errors.append(new_error)
    return JSONResponse(
        status_code=422,
        content={"detail": errors}
    )

class EventAttendance(BaseModel):
    event_id: int
    attended: bool
    rating: int = Field(..., ge=1, le=5)

class UserProfile(BaseModel):
    user_id: int
    interesting_skills: List[str] = Field(default_factory=list)
    education_place: Optional[str] = None
    visited_events: List[EventAttendance] = Field(default_factory=list)
    
    @validator('interesting_skills', each_item=True)
    def validate_skills(cls, v):
        if v not in AVAILABLE_SKILLS:
            raise ValueError(f"Skill '{v}' is not in the available skills list")
        return v

class Event(BaseModel):
    event_id: int
    title: str
    organizer: str
    recommended_skills: List[str] = Field(default_factory=list)
    datetime: datetime
    duration_minutes: int
    location: str
    max_participants: int
    category: str
    уровень: Optional[str] = None
    
    @validator('recommended_skills', each_item=True)
    def validate_skills(cls, v):
        if v not in AVAILABLE_SKILLS:
            raise ValueError(f"Skill '{v}' is not in the available skills list")
        return v

class RecommendationRequest(BaseModel):
    user_profile: UserProfile
    events: List[Event]
    universities: Optional[Dict[str, List[str]]] = Field(default_factory=dict)
    n_recommendations: int = Field(default=10, ge=1, le=100)

class EventRecommendationModel:
    def __init__(self, university_specializations: Optional[Dict[str, List[str]]] = None):
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        self.organizer_stats = {}
        self.skill_importance = {}
        self.university_specializations = university_specializations or {}
        
    def compute_organizer_stats(self, user_profile: UserProfile, events: List[Event]):
        organizer_ratings = defaultdict(list)
        
        for attendance in user_profile.visited_events:
            event = next((e for e in events if e.event_id == attendance.event_id), None)
            if event and attendance.attended:
                organizer_ratings[event.organizer].append(attendance.rating)
        
        for organizer, ratings in organizer_ratings.items():
            self.organizer_stats[organizer] = {
                'avg_rating': np.mean(ratings) if ratings else 3.0,
                'attendance_count': len(ratings),
                'success_rate': len([r for r in ratings if r >= 4]) / len(ratings) if ratings else 0.5
            }
    
    def compute_skill_importance(self, user_profile: UserProfile, events: List[Event]):
        skill_weights = defaultdict(int)
        
        for attendance in user_profile.visited_events:
            if attendance.attended and attendance.rating >= 4:
                event = next((e for e in events if e.event_id == attendance.event_id), None)
                if event:
                    for skill in event.recommended_skills:
                        skill_weights[skill] += attendance.rating
        
        total_weight = sum(skill_weights.values()) if skill_weights else 1
        self.skill_importance = {skill: weight/total_weight for skill, weight in skill_weights.items()}
    
    def create_event_features(self, user_profile: UserProfile, event: Event) -> List[float]:
        features = []
        
        user_skills = set(user_profile.interesting_skills)
        event_skills = set(event.recommended_skills or [])
        intersection = user_skills & event_skills
        union = user_skills | event_skills
        
        features.append(len(intersection))
        features.append(len(intersection) / len(union) if union else 1.0)
        features.append(len(intersection) / len(event_skills) if event_skills else 1.0)
        
        organizer = event.organizer
        organizer_stats = self.organizer_stats.get(organizer, {})
        features.append(organizer_stats.get('avg_rating', 3.0))
        features.append(organizer_stats.get('success_rate', 0.5))
        
        event_time = event.datetime
        features.append(event_time.hour)
        features.append(event_time.weekday())
        features.append(1 if event_time.weekday() >= 5 else 0)
        
        user_education = user_profile.education_place
        event_location = event.location
        
        same_location = 0
        if user_education:
            if user_education == event_location:
                same_location = 1
            elif user_education in TARGET_UNIVERSITIES:
                if TARGET_UNIVERSITIES[user_education].get("city") == event_location:
                    same_location = 1
        features.append(same_location)
        
        is_online = 1 if event_location == "Онлайн" else 0
        features.append(is_online)
        
        university_match = 0
        org_specializations = None
        if organizer in self.university_specializations:
            org_specializations = self.university_specializations[organizer]
            if isinstance(org_specializations, dict):
                org_specializations = org_specializations.get("specialization", [])
        elif organizer in TARGET_UNIVERSITIES:
            org_specializations = TARGET_UNIVERSITIES[organizer].get("specialization", [])
        
        if org_specializations:
            event_skills_lower = [s.lower() for s in event_skills]
            for spec in org_specializations:
                if any(spec.lower() in skill or skill in spec.lower() for skill in event_skills_lower):
                    university_match = 1
                    break
        features.append(university_match)
        
        features.append(event.duration_minutes / 60.0)
        features.append(event.max_participants / 100.0)
        
        level_score = 0.0
        if event.уровень:
            level_lower = event.уровень.lower()
            level_score = sum(0.33 for word in ["начальный", "средний"] if word in level_lower) + (0.34 if "продвинутый" in level_lower else 0)
        features.append(level_score)
        
        return features
    
    def collect_training_data(self, user_profile: UserProfile, events: List[Event]):
        features = []
        labels = []
        
        self.compute_organizer_stats(user_profile, events)
        self.compute_skill_importance(user_profile, events)
        
        for attendance in user_profile.visited_events:
            event = next((e for e in events if e.event_id == attendance.event_id), None)
            if event:
                event_features = self.create_event_features(user_profile, event)
                features.append(event_features)
                label = 1 if attendance.attended and attendance.rating >= 4 else 0
                labels.append(label)
        
        return np.array(features), np.array(labels)
    
    def train(self, user_profile: UserProfile, events: List[Event]):
        """
        Обучает модель на истории пользователя.
        Возвращает True если модель обучена, False если недостаточно данных для обучения.
        """
        MIN_EVENTS_FOR_TRAINING = 100
        MIN_POSITIVE_EXAMPLES = 50
        
        if len(user_profile.visited_events) < MIN_EVENTS_FOR_TRAINING:
            self.is_trained = False
            return False
            
        features, labels = self.collect_training_data(user_profile, events)
        
        if len(features) == 0:
            self.is_trained = False
            return False
        
        if len(np.unique(labels)) < 2:
            self.is_trained = False
            return False
        
        positive_count = np.sum(labels == 1)
        if positive_count < MIN_POSITIVE_EXAMPLES:
            self.is_trained = False
            return False
        
        features_scaled = self.scaler.fit_transform(features)
        self.model.fit(features_scaled, labels)
        self.is_trained = True
        
        return True
    
    def predict_probability(self, user_profile: UserProfile, event: Event) -> float:
        """
        Предсказывает вероятность того, что пользователю понравится мероприятие.
        
        Если модель обучена (достаточно данных) - использует RandomForest.
        Если модель не обучена (мало данных) - использует эвристический подход.
        """
        if not self.is_trained:
            return self._heuristic_prediction(user_profile, event)
            
        features = self.create_event_features(user_profile, event)
        features_scaled = self.scaler.transform([features])
        probability = self.model.predict_proba(features_scaled)[0][1]
        
        return float(probability)
    
    def _heuristic_prediction(self, user_profile: UserProfile, event: Event) -> float:
        """
        Эвристическое предсказание для случаев с малым количеством данных.
        Использует простые правила на основе навыков, местоположения и типа мероприятия.
        """
        base_prob = 0.5
        
        user_skills = set(user_profile.interesting_skills)
        event_skills = set(event.recommended_skills or [])
        
        common_skills = len(user_skills & event_skills)
        if common_skills > 0:
            base_prob += 0.2
            
        if event.location == "Онлайн":
            base_prob += 0.1
            
        if user_profile.education_place:
            if user_profile.education_place == event.location:
                base_prob += 0.15
            elif user_profile.education_place in TARGET_UNIVERSITIES:
                if TARGET_UNIVERSITIES[user_profile.education_place].get("city") == event.location:
                    base_prob += 0.15
            
        return max(0.0, min(base_prob, 1.0))

def recommend_events(user_profile: UserProfile, events: List[Event], universities: Dict[str, List[str]], n_recommendations: int = 10):
    event_model = EventRecommendationModel(university_specializations=universities)
    event_model.train(user_profile, events)
    
    scored_events = []
    for event in events:
        if any(att.event_id == event.event_id for att in user_profile.visited_events):
            continue
            
        probability = event_model.predict_probability(user_profile, event)
        scored_events.append((probability, event))
    
    scored_events.sort(key=lambda x: x[0], reverse=True)
    
    result = []
    for prob, event in scored_events[:n_recommendations]:
        event_dict = event.dict()
        event_dict["interest_probability"] = float(prob)
        result.append(event_dict)
    
    return result

@app.post("/recommend-events")
async def get_event_recommendations(request: RecommendationRequest):
    try:
        recommendations = recommend_events(
            request.user_profile,
            request.events,
            request.universities,
            request.n_recommendations
        )
        
        return {
            "user_id": request.user_profile.user_id,
            "recommendations_count": len(recommendations),
            "recommendations": recommendations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/skills")
async def get_available_skills():
    return {"skills": AVAILABLE_SKILLS}

@app.get("/universities")
async def get_universities():
    return {"universities": TARGET_UNIVERSITIES}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
