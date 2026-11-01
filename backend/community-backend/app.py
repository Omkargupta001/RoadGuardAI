
from flask import Flask, request, jsonify
from flask_cors import CORS
from database import db
from models import Complaint, Feedback, User
from datetime import datetime, timedelta
from pathlib import Path
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity
)
import uuid
import os


app = Flask(__name__)

app.config["JWT_SECRET_KEY"] = os.environ.get(
    "JWT_SECRET_KEY", "change-this-secret-before-deployment"
)
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=12)

jwt = JWTManager(app)

CORS(app)

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_FOLDER = BASE_DIR / "uploads"
UPLOAD_FOLDER.mkdir(exist_ok=True)

app.config["SQLALCHEMY_DATABASE_URI"] = (
    "sqlite:///" + str(BASE_DIR / "roadguard.db")
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

db.init_app(app)

with app.app_context():
    db.create_all()
    
@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    user = User(
        name=name,
        email=email,
        password_hash=generate_password_hash(password),
        role="user"
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "Registration successful"}), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(
        user.password_hash, password
    ):
        return jsonify({"error": "Invalid email or password"}), 401

    token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role}
    )

    return jsonify({
        "message": "Login successful",
        "access_token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }), 200



@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "RoadGuard Community API is running"
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"})


@app.route("/api/complaints", methods=["POST"])
@jwt_required()
def create_complaint():
    hazard_type = request.form.get("hazard_type")
    description = request.form.get("description", "")
    latitude = request.form.get("latitude")
    longitude = request.form.get("longitude")
    image = request.files.get("image")

    if not hazard_type:
        return jsonify({"error": "Hazard type is required"}), 400

    if not image or not image.filename:
        return jsonify({"error": "Road image is required"}), 400

    if not image.mimetype.startswith("image/"):
        return jsonify({"error": "Please upload a valid image"}), 400

    try:
        latitude = float(latitude) if latitude else None
        longitude = float(longitude) if longitude else None
    except ValueError:
        return jsonify({"error": "Invalid GPS coordinates"}), 400

    if latitude is not None and not -90 <= latitude <= 90:
        return jsonify({"error": "Invalid latitude"}), 400

    if longitude is not None and not -180 <= longitude <= 180:
        return jsonify({"error": "Invalid longitude"}), 400

    extension = Path(secure_filename(image.filename)).suffix.lower()
    if extension not in [".jpg", ".jpeg", ".png", ".webp"]:
        return jsonify({"error": "Unsupported image format"}), 400

    filename = f"{uuid.uuid4().hex}{extension}"
    image.save(UPLOAD_FOLDER / filename)

    complaint_id = "RG" + uuid.uuid4().hex[:8].upper()

    complaint = Complaint(
        complaint_id=complaint_id,
        hazard_type=hazard_type,
        description=description,
        image=filename,
        latitude=latitude,
        longitude=longitude
    )

    try:
        db.session.add(complaint)
        db.session.commit()
    except Exception:
        db.session.rollback()
        (UPLOAD_FOLDER / filename).unlink(missing_ok=True)
        return jsonify({"error": "Could not save complaint"}), 500

    return jsonify({
        "message": "Complaint submitted successfully",
        "complaint": complaint_to_dict(complaint)
    }), 201


def complaint_to_dict(complaint):
    return {
        "id": complaint.id,
        "complaint_id": complaint.complaint_id,
        "hazard_type": complaint.hazard_type,
        "description": complaint.description,
        "image_url": f"/uploads/{complaint.image}",
        "latitude": complaint.latitude,
        "longitude": complaint.longitude,
        "status": complaint.status,
        "authority_response": complaint.authority_response,
        "created_at": complaint.created_at.isoformat()
    }


@app.route("/api/complaints", methods=["GET"])
def get_complaints():
    complaints = Complaint.query.order_by(
        Complaint.created_at.desc()
    ).all()

    return jsonify([
        complaint_to_dict(c) for c in complaints
    ])


@app.route("/api/complaints/<int:complaint_id>", methods=["GET"])
def get_complaint(complaint_id):
    complaint = db.session.get(Complaint, complaint_id)

    if not complaint:
        return jsonify({"error": "Complaint not found"}), 404

    return jsonify(complaint_to_dict(complaint))


@app.route("/api/complaints/<int:complaint_id>/status", methods=["PUT"])
@jwt_required()
def update_status(complaint_id):
    current_user = User.query.get(int(get_jwt_identity()))

    if not current_user or current_user.role != "admin":
        return jsonify({"error": "Admin access required"}), 403

    complaint = db.session.get(Complaint, complaint_id)

    if not complaint:
        return jsonify({"error": "Complaint not found"}), 404

    data = request.get_json(silent=True) or {}
    status = data.get("status")
    response = data.get("authority_response", "")

    allowed_statuses = ["Pending", "In Progress", "Resolved"]

    if status not in allowed_statuses:
        return jsonify({"error": "Invalid complaint status"}), 400

    complaint.status = status
    complaint.authority_response = response
    db.session.commit()

    return jsonify({
        "message": "Complaint status updated",
        "complaint": complaint_to_dict(complaint)
    })


@app.route("/api/complaints/<int:complaint_id>/feedback", methods=["POST"])
@jwt_required()
def add_feedback(complaint_id):
    complaint = db.session.get(Complaint, complaint_id)

    if not complaint:
        return jsonify({"error": "Complaint not found"}), 404

    if complaint.status != "Resolved":
        return jsonify({
            "error": "Feedback is available after resolution"
        }), 400

    data = request.get_json(silent=True) or {}
    rating = data.get("rating")
    comment = data.get("comment", "")

    if not isinstance(rating, int) or isinstance(rating, bool) or not 1 <= rating <= 5:
        return jsonify({"error": "Rating must be between 1 and 5"}), 400

    feedback = Feedback(
        complaint_id=complaint.id,
        rating=rating,
        comment=comment
    )

    db.session.add(feedback)
    db.session.commit()

    return jsonify({
        "message": "Thank you for your feedback"
    }), 201


@app.route("/uploads/<filename>", methods=["GET"])
def uploaded_image(filename):
    from flask import send_from_directory
    return send_from_directory(UPLOAD_FOLDER, filename)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=True)
