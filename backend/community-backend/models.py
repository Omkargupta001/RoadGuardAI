
from datetime import datetime
from database import db


class Complaint(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.String(20), unique=True, nullable=False)
    hazard_type = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    image = db.Column(db.String(255))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    status = db.Column(db.String(30), default="Pending")
    authority_response = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    feedback = db.relationship(
        "Feedback",
        backref="complaint",
        cascade="all, delete-orphan"
    )


class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(
        db.Integer,
        db.ForeignKey("complaint.id"),
        nullable=False
    )
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)



class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="user")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
