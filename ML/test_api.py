import requests
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"

def test_get_skills():
    response = requests.get(f"{BASE_URL}/skills")
    return response.status_code == 200

def test_recommend_events():
    now = datetime.now()
    request_data = {
        "user_profile": {
            "user_id": 1,
            "interesting_skills": ["Machine Learning", "Data Science"],
            "education_place": "МФТИ",
            "visited_events": [
                {"event_id": 1, "attended": True, "rating": 1},
                {"event_id": 2, "attended": False, "rating": 2}
            ]
        },
        "events": [
            {
                "event_id": 1, "title": "Введение в Machine Learning",
                "organizer": "VK Education", "recommended_skills": ["Linear Algebra", "Statistics"],
                "datetime": (now + timedelta(days=2)).isoformat(), "duration_minutes": 180,
                "location": "Онлайн", "max_participants": 100, "category": "course", "уровень": "начальный"
            },
            {
                "event_id": 2, "title": "React и Frontend разработка",
                "organizer": "VK Education", "recommended_skills": ["HTML", "CSS", "React"],
                "datetime": (now + timedelta(days=5)).isoformat(), "duration_minutes": 240,
                "location": "МФТИ", "max_participants": 40, "category": "workshop", "уровень": "средний"
            },
            {
                "event_id": 3, "title": "Python для анализа данных",
                "organizer": "VK Education", "recommended_skills": ["Pandas", "NumPy", "SQL"],
                "datetime": (now + timedelta(days=7)).isoformat(), "duration_minutes": 360,
                "location": "Онлайн", "max_participants": 150, "category": "course", "уровень": "начальный средний продвинутый"
            },
            {
                "event_id": 4, "title": "Deep Learning с PyTorch",
                "organizer": "МФТИ", "recommended_skills": ["PyTorch", "Deep Learning"],
                "datetime": (now + timedelta(days=10)).isoformat(), "duration_minutes": 300,
                "location": "МФТИ", "max_participants": 50, "category": "workshop", "уровень": "продвинутый"
            }
        ],
        "universities": {
            "МФТИ": ["Machine Learning", "Data Science", "Computer Vision"],
            "VK Education": ["Web Development", "Data Science", "Mobile Development"]
        },
        "n_recommendations": 3
    }
    
    response = requests.post(f"{BASE_URL}/recommend-events", json=request_data)
    
    if response.status_code == 200:
        result = response.json()
        for rec in result['recommendations']:
            prob = rec['interest_probability']
            assert 0.0 <= prob <= 1.0, f"Вероятность должна быть от 0 до 1, получено: {prob}"
    
    return response.status_code == 200

def test_validation_error():
    request_data = {
        "user_profile": {
            "user_id": 1,
            "interesting_skills": ["InvalidSkill"],
            "education_place": None,
            "visited_events": []
        },
        "events": [],
        "n_recommendations": 5
    }
    
    response = requests.post(f"{BASE_URL}/recommend-events", json=request_data)
    return response.status_code == 422

def test_probability_range():
    now = datetime.now()
    request_data = {
        "user_profile": {
            "user_id": 2,
            "interesting_skills": ["Python"],
            "education_place": None,
            "visited_events": []
        },
        "events": [{
            "event_id": 10, "title": "Тестовое мероприятие", "organizer": "Test Org",
            "recommended_skills": ["Python"], "datetime": (now + timedelta(days=1)).isoformat(),
            "duration_minutes": 60, "location": "Онлайн", "max_participants": 10,
            "category": "course", "уровень": "начальный"
        }],
        "n_recommendations": 1
    }
    
    response = requests.post(f"{BASE_URL}/recommend-events", json=request_data)
    
    if response.status_code == 200:
        for rec in response.json().get("recommendations", []):
            prob = rec.get("interest_probability")
            assert prob is not None, "Отсутствует поле interest_probability"
            assert 0.0 <= prob <= 1.0, f"Вероятность вне диапазона [0, 1]: {prob}"
        return True
    return False

if __name__ == "__main__":
    try:
        results = [
            test_get_skills(),
            test_recommend_events(),
            test_validation_error(),
            test_probability_range()
        ]
        print(f"Пройдено тестов: {sum(results)}/{len(results)}")
    except requests.exceptions.ConnectionError:
        print("Ошибка: не удалось подключиться к серверу")
        print("Убедитесь, что сервер запущен: python max_hack.py")
    except Exception as e:
        print(f"Ошибка: {e}")
