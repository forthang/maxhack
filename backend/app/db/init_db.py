"""Database initialization and seeding.

This module contains the `init_db` function which is responsible for creating
database tables and populating them with initial data. This is intended for
development environments to ensure a consistent starting state.
"""

from sqlalchemy import text
from .session import Base, engine, SessionLocal

def init_db() -> None:
    """Create database tables and seed with some sample data.

    This function should be invoked at application startup. It creates all
    tables based on the new hierarchical model and seeds them with mock data,
    including universities, specializations, courses, groups, and students.
    """
    from .. import models

    # Drop and recreate tables for a clean slate. In production, use migrations.
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    # Lightweight migrations for development
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS duration_hours INTEGER DEFAULT 2"))
        conn.execute(text("ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS materials VARCHAR"))
        conn.execute(text("ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS auditorium VARCHAR"))
        conn.execute(text("ALTER TABLE IF EXISTS schedule ADD COLUMN IF NOT EXISTS auditorium VARCHAR"))
        # Drop the obsolete signups table if it exists
        conn.execute(text("DROP TABLE IF EXISTS signups"))
        conn.commit()

    db = SessionLocal()
    try:
        # --- Seed Universities ---
        universities = [
            models.University(name="НИТУ МИСИС", points=200),
            models.University(name="Московский Политех", points=150),
            models.University(name="Технопарк МГТУ", points=120),
            models.University(name="СПбГУ", points=90),
            models.University(name="МГУ", points=180),
        ]
        db.add_all(universities)
        db.commit()

        # --- Seed Hierarchy for НИТУ МИСИС ---
        misis = db.query(models.University).filter_by(name="НИТУ МИСИС").one()
        
        spec_pm = models.Specialization(name="Прикладная математика", university_id=misis.id)
        spec_it = models.Specialization(name="Информационные технологии", university_id=misis.id)
        db.add_all([spec_pm, spec_it])
        db.commit()

        # Courses (years) and Groups for Прикладная математика
        for year_num in range(1, 5):
            course = models.Course(year=year_num, specialization_id=spec_pm.id)
            db.add(course)
            db.commit()
            # Add groups to each course
            for group_num in range(1, 5):
                group_name = f"БПМ-24-{group_num}" if year_num == 2 else f"БXX-{year_num}{group_num}"
                group = models.Group(name=group_name, course_id=course.id)
                db.add(group)
        db.commit()

        # --- Seed Users ---
        # Create and assign default user (ID=1)
        bpm_24_4 = db.query(models.Group).filter_by(name="БПМ-24-4").one()
        user1 = models.User(
            id=1,
            name="Max Hack",
            role=models.UserRole.student,
            group_id=bpm_24_4.id,
            xp=150,
            coins=75
        )
        db.add(user1)
        db.commit()

        # Create a teacher user for testing
        teacher = models.User(
            id=100,
            name="Dr. Teacher",
            role=models.UserRole.teacher,
            xp=500,
            coins=200
        )
        db.add(teacher)
        db.commit()

        # Manually set the sequence to the max id to avoid conflicts
        with engine.connect() as conn:
            conn.execute(text("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));"))
            conn.commit()

        # Create other random students for various groups
        import random
        all_groups = db.query(models.Group).all()
        for i, group in enumerate(all_groups):
            for j in range(5): # 5 students per group
                student = models.User(
                    name=f"Студент {group.name}-{j+1}",
                    role=models.UserRole.student,
                    group_id=group.id,
                    xp=random.randint(50, 250),
                    coins=random.randint(20, 120)
                )
                db.add(student)
        db.commit()

        # --- Seed Schedule for БПМ-24-4 ---
        from datetime import datetime, timedelta
        now = datetime.utcnow()
        iso_offset = now.isoweekday() - 1
        monday = (now - timedelta(days=iso_offset)).replace(hour=0, minute=0, second=0, microsecond=0)

        schedule_entries = []
        for day_offset in range(5):  # Mon-Fri
            # 9:00–10:30 Math Analysis
            start1 = monday + timedelta(days=day_offset, hours=9)
            end1 = start1 + timedelta(hours=1, minutes=30)
            schedule_entries.append(models.ScheduleItem(
                start_time=start1, end_time=end1, description="Лекция: Математический анализ",
                auditorium="А-315", group_id=bpm_24_4.id
            ))
            # 11:00–12:30 Discrete Math
            start2 = monday + timedelta(days=day_offset, hours=11)
            end2 = start2 + timedelta(hours=1, minutes=30)
            schedule_entries.append(models.ScheduleItem(
                start_time=start2, end_time=end2, description="Семинар: Дискретная математика",
                auditorium="Б-404", group_id=bpm_24_4.id
            ))
        db.add_all(schedule_entries)
        db.commit()

        # --- Seed Extracurricular Events ---
        event_specs = [
            (2, 18, "Митап: Data Science", "Современные методы обработки данных", "https://example.com/ds-meetup", "Аудитория DS"),
            (4, 20, "Кино вечер", "Просмотр классического фильма", "https://example.com/movie-night", "Актовый зал"),
        ]
        event_entries = [
            models.Event(
                event_time=monday + timedelta(days=day, hours=hour),
                title=title, description=desc, duration_hours=2, materials=mats, auditorium=room
            ) for day, hour, title, desc, mats, room in event_specs
        ]
        db.add_all(event_entries)
        db.commit()

        # --- Seed Event Reviews ---
        event1 = db.query(models.Event).filter_by(title="Митап: Data Science").first()
        user1 = db.query(models.User).filter_by(id=1).first()
        if event1 and user1:
            event_review1 = models.EventReview(
                event_id=event1.id,
                user_id=user1.id,
                rating=5,
                comment="Отличный митап, очень информативно!"
            )
            db.add(event_review1)
        
        # --- Seed Course Reviews ---
        if user1:
            course_review1 = models.CourseReview(
                course_id="algorithms", # Example course ID from frontend
                user_id=user1.id,
                rating=4,
                comment="Хороший курс по алгоритмам, но можно добавить больше практики."
            )
            db.add(course_review1)

        db.commit()

    finally:
        db.close()
