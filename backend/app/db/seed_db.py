import logging
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.db.init_db import init_db
from app.models import University, Specialization, Course, Group, User, ScheduleItem
from datetime import date, timedelta, time

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
        
        subjects = ["Математический анализ", "Линейная алгебра", "История", "Программирование", "Физика"]
        auditoriums = ["А-101", "Б-203", "В-305", "Г-404", "Д-501"]
        class_times = [time(9, 0), time(11, 0), time(13, 30)]

        for group in all_groups:
            for i in range(14): # Two weeks from today
                current_day = today + timedelta(days=i)
                # Skip weekends
                if current_day.weekday() >= 5: # Saturday or Sunday
                    continue

                for class_time in class_times:
                    start_datetime = current_day.strftime('%Y-%m-%d') + 'T' + class_time.strftime('%H:%M:%S')
                    end_datetime = current_day.strftime('%Y-%m-%d') + 'T' + (class_time.hour + 1).__str__().zfill(2) + ':' + class_time.minute.__str__().zfill(2) + ':00'

                    schedule_item = ScheduleItem(
                        group_id=group.id,
                        start_time=start_datetime,
                        end_time=end_datetime,
                        description=subjects[(i + class_times.index(class_time)) % len(subjects)],
                        auditorium=auditoriums[(i + class_times.index(class_time)) % len(auditoriums)]
                    )
                    schedule_items.append(schedule_item)
        
        db.add_all(schedule_items)
        db.commit()

        logger.info("Database seeding complete.")

    finally:
        db.close()

if __name__ == "__main__":
    logger.info("Running seeder directly.")
    init_db()
    seed_db()
    logger.info("Direct seeding finished.")
