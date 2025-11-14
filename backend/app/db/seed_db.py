from sqlalchemy.orm import Session
from datetime import time, datetime
from .. import models

def seed_db(db: Session):
    # Check if DB is already seeded
    university = db.query(models.University).first()
    if university:
        return # DB is already seeded

    # 1. Create Universities
    universities = [
        models.University(name="Московский Политех"),
        models.University(name="Технопарк МГТУ"),
        models.University(name="СПбГУ"),
        models.University(name="МГУ"),
        models.University(name="ВШЭ"),
    ]
    db.add_all(universities)
    db.commit()

    # 2. Create Groups for each University
    groups = []
    for uni in universities:
        for i in range(1, 4):
            group = models.Group(name=f"Группа {uni.name[:3]}-{i}", university_id=uni.id)
            groups.append(group)
    db.add_all(groups)
    db.commit()

    # 3. Create Schedule for each Group
    schedule_items = []
    for group in groups:
        for day in range(5): # Monday to Friday
            schedule_items.append(models.ScheduleItem(
                day_of_week=day,
                start_time=time.fromisoformat("09:00"),
                end_time=time.fromisoformat("10:30"),
                subject=f"Лекция {day+1}",
                teacher="Профессор Иванов",
                location="Ауд. 101",
                group_id=group.id
            ))
            schedule_items.append(models.ScheduleItem(
                day_of_week=day,
                start_time=time.fromisoformat("10:45"),
                end_time=time.fromisoformat("12:15"),
                subject=f"Семинар {day+1}",
                teacher="Доцент Петров",
                location="Ауд. 202",
                group_id=group.id
            ))
    db.add_all(schedule_items)
    db.commit()

    # 4. Create some global events
    events = [
        models.Event(title="Митап: Data Science", description="Современные методы обработки данных", start_time=datetime.fromisoformat("2025-11-20T18:00:00"), end_time=datetime.fromisoformat("2025-11-20T20:00:00"), location="Актовый зал"),
        models.Event(title="Кино вечер", description="Просмотр классического фильма", start_time=datetime.fromisoformat("2025-11-21T20:00:00"), end_time=datetime.fromisoformat("2025-11-21T22:00:00"), location="Актовый зал"),
    ]
    db.add_all(events)
    db.commit()
