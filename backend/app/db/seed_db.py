import logging
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.db.init_db import init_db
from app.models import University, Specialization, Course, Group, User, ScheduleItem
from datetime import date, timedelta, time, datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_db():
    db = SessionLocal()
    try:
        # Check if data already exists
        if db.query(University).first():
            logger.info("Database already seeded. Skipping.")
            return

        logger.info("Seeding database with initial data...")

        # --- Create Universities ---
        universities = []
        for i in range(1, 6):
            uni = University(name=f"Университет #{i}", points=0)
            universities.append(uni)
        db.add_all(universities)
        db.commit()

        # --- Create Specializations, Courses, Groups, and Students ---
        for uni in universities:
            for j in range(1, 3):
                spec = Specialization(name=f"Направление {j}", university_id=uni.id)
                db.add(spec)
                db.commit()

                for k in range(1, 5): # 4 Courses (years)
                    course = Course(year=k, specialization_id=spec.id)
                    db.add(course)
                    db.commit()

                    group = Group(name=f"Группа {uni.id}-{spec.id}-{course.id}", course_id=course.id)
                    db.add(group)
                    db.commit()

                    students = []
                    for l in range(1, 6): # 5 Students
                        # Create a unique ID for seed users to avoid conflict with real MAX IDs
                        user_id = int(f"999{uni.id}{spec.id}{course.id}{l}") 
                        user = User(
                            id=user_id,
                            first_name=f"Студент {l}",
                            last_name=f"(Группа {group.id})",
                            xp=0,
                            coins=0,
                            group_id=group.id,
                            university_id=uni.id
                        )
                        students.append(user)
                    db.add_all(students)
                    db.commit()

        logger.info("Finished seeding users and university structure.")
        logger.info("Seeding schedule for all groups...")

        # --- Create Schedule for each group ---
        all_groups = db.query(Group).all()
        today = date.today()
        schedule_items = []
        
        subjects = ["Математический анализ", "Линейная алгебра", "История", "Программирование", "Физика", "Английский язык", "Базы данных"]
        auditoriums = ["А-101", "Б-203", "В-305", "Г-404", "Д-501", "Е-110", "Ж-212"]
        
        # Generate classes from 9:00 to 16:00
        class_start_times = [time(9, 0), time(10, 30), time(12, 0), time(13, 30), time(15, 0)]

        for group in all_groups:
            for i in range(14): # Two weeks from today
                current_day = today + timedelta(days=i)
                # Skip weekends
                if current_day.weekday() >= 5: # Saturday or Sunday
                    continue

                for class_time in class_start_times:
                    start_datetime = datetime.combine(current_day, class_time)
                    end_datetime = start_datetime + timedelta(hours=1, minutes=20) # 80 minute classes

                    schedule_item = ScheduleItem(
                        group_id=group.id,
                        start_time=start_datetime,
                        end_time=end_datetime,
                        description=subjects[(i + class_start_times.index(class_time)) % len(subjects)],
                        auditorium=auditoriums[(i + class_start_times.index(class_time)) % len(auditoriums)]
                    )
                    schedule_items.append(schedule_item)
        
        db.add_all(schedule_items)
        db.commit()
        logger.info("Finished seeding schedule.")

        # --- Create global events ---
        logger.info("Seeding global events...")
        events_to_add = []
        for i in range(4):
            event_day = today + timedelta(days=i)
            event_time = datetime.combine(event_day, time(19, 0)) # 7 PM
            new_event = models.Event(
                title=f"Глобальное событие #{i+1}",
                description=f"Описание для глобального события #{i+1}, которое состоится {event_day.strftime('%d.%m')}.",
                event_time=event_time,
                duration_hours=2,
                auditorium="Главный актовый зал"
            )
            events_to_add.append(new_event)
        
        db.add_all(events_to_add)
        db.commit()

        logger.info("Database seeding complete.")

    finally:
        db.close()

if __name__ == "__main__":
    logger.info("Running seeder directly.")
    init_db()
    seed_db()
    logger.info("Direct seeding finished.")
