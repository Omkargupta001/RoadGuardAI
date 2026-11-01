from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.utils import secure_filename
from pathlib import Path
from model import analyze_image, calculate_severity

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = Path(__file__).parent / "uploads"
UPLOAD_FOLDER.mkdir(exist_ok=True)


@app.route("/")
def home():
    return jsonify({
        "message": "RoadGuard AI backend is running"
    })


@app.route("/health")
def health():
    return jsonify({
        "status": "healthy",
        "service": "RoadGuard AI"
    })


@app.route("/analyze", methods=["POST"])
def analyze():
    if "image" not in request.files:
        return jsonify({"error": "No image received"}), 400

    image = request.files["image"]

    if not image.filename:
        return jsonify({"error": "No image selected"}), 400

    filename = secure_filename(image.filename)

    if not filename:
        return jsonify({"error": "Invalid filename"}), 400

    image_path = UPLOAD_FOLDER / filename
    image.save(image_path)

    try:
        detections = analyze_image(str(image_path))
        severity = calculate_severity(detections)
        return jsonify({
            "status": "success",
            "filename": filename,
            "detections": detections,
            "severity": severity,
            "message": "Image analyzed successfully"
        })

    except Exception:
        app.logger.exception("Image analysis failed")
        return jsonify({
            "error": "Image analysis failed. Check backend terminal."
        }), 500


if __name__ == "__main__":
    app.run(debug=True)
