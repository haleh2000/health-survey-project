from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    JSON,
    ForeignKey,
)
from sqlalchemy.orm import relationship

from database import Base


class Person(Base):
    __tablename__ = "persons"

    # SSO fields
    national_id = Column(String(10), primary_key=True)
    full_name = Column(String(255), nullable=True)
    gender = Column(String(20), nullable=True)
    birth_date = Column(String(20), nullable=True)

    created_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    updated_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    submissions = relationship(
        "SurveySubmission",
        back_populates="person",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<Person(national_id={self.national_id}, name={self.full_name})>"


class SurveySubmission(Base):
    __tablename__ = "survey_assessments"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # Link assessment to person
    person_national_id = Column(
        String(10),
        ForeignKey("persons.national_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Assessment data
    height = Column(Float, nullable=False)
    weight = Column(Float, nullable=False)

    # Lifestyle
    smoking_status = Column(String(50), nullable=False)
    cigarettes_per_day = Column(String(20), default="0")
    hookah_ecig = Column(String(10), nullable=False)
    alcohol = Column(String(100), nullable=False)
    adds_salt = Column(String(10), nullable=False)
    hot_drink_temp = Column(String(50), nullable=False)
    junk_food = Column(String(100), nullable=False)
    processed_meat = Column(String(100), nullable=False)
    veg_fruit = Column(String(100), nullable=False)
    smoked_food = Column(String(10), nullable=False)
    air_pollution = Column(String(10), nullable=False)
    occupational_hazard = Column(String(10), nullable=False)
    physical_activity = Column(String(200), nullable=False)

    # Medical history
    confirmed_diseases = Column(JSON, nullable=False)
    stroke_history = Column(JSON, nullable=False)
    h_pylori = Column(String(100), nullable=False)
    cancer_history = Column(String(10), nullable=False)
    cancer_types = Column(JSON, default=list)
    family_history = Column(JSON, nullable=False)

    # Risk results
    age = Column(Integer, nullable=False)
    bmi = Column(Float, nullable=False)
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String(255), nullable=False)

    lung_risk = Column(Integer, nullable=False)
    gastric_risk = Column(Integer, nullable=False)
    colon_risk = Column(Integer, nullable=False)
    pancreas_risk = Column(Integer, nullable=False)
    stroke_risk = Column(Integer, nullable=False)
    cardiac_risk = Column(Integer, nullable=False)
    metabolic_risk = Column(Integer, nullable=False)
    liver_risk = Column(Integer, nullable=False)

    flags = Column(JSON, nullable=False)

    created_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationship
    person = relationship(
        "Person",
        back_populates="submissions",
    )

    def __repr__(self):
        return (
            f"<SurveySubmission("
            f"id={self.id}, "
            f"person={self.person_national_id}, "
            f"risk={self.risk_level})>"
        )