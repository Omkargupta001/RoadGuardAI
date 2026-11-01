import json
import threading
import time
from pathlib import Path

from flask import Blueprint, jsonify, request

reports_bp = Blueprint("reports", __name__)

REPORTS_FILE = Path(__file__).parent / "reports.json"
VALID_TYPES = {"pothole", "accident"}
_lock = threading.Lock()


def _load():
    if not REPORTS_FILE.exists():
        return []
    try:
        return json.loads(REPORTS_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []


def _save(reports):
    REPORTS_FILE.write_text(json.dumps(reports, indent=2), encoding="utf-8")


@reports_bp.route("/reports", methods=["GET"])
def list_reports():
    with _lock:
        return jsonify(_load())


@reports_bp.route("/reports", methods=["POST"])
def create_report():
    data = request.get_json(silent=True) or {}

    try:
        lat = float(data["lat"])
        lng = float(data["lng"])
    except (KeyError, TypeError, ValueError):
        return jsonify({"error": "lat and lng must be numbers"}), 400

    if not (-90 <= lat <= 90 and -180 <= lng <= 180):
        return jsonify({"error": "Coordinates out of range"}), 400

    report_type = data.get("type")
    if report_type not in VALID_TYPES:
        return jsonify({"error": "type must be 'pothole' or 'accident'"}), 400

    report = {
        "id": int(time.time() * 1000),
        "type": report_type,
        "lat": lat,
        "lng": lng,
        "time": time.strftime("%H:%M:%S"),
        "severity": data.get("severity"),
        "photo": data.get("photo"),
    }

    with _lock:
        reports = _load()
        reports.append(report)
        _save(reports)

    return jsonify(report), 201