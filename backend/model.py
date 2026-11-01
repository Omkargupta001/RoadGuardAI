
from ultralytics import YOLO

# Load the trained road-damage detection model
model = YOLO("pothole_best.pt")

CONF_THRESHOLD = 0.15

IGNORE_CLASSES = {
    "other",
    "others",
    "other corruption",
}

# Initial weights: tune them using real test images
CLASS_WEIGHTS = {
    "pothole": 3.0,
    "alligator": 2.5,
    "longitudinal": 1.0,
    "transverse": 1.0,
}

def analyze_image(image_path):
    results = model(image_path, conf=CONF_THRESHOLD)
    detections = []

    for result in results:
        img_h, img_w = result.orig_shape

        for box in result.boxes:
            class_id = int(box.cls[0])
            class_name = result.names[class_id]

            if class_name.lower() in IGNORE_CLASSES:
                continue

            x1, y1, x2, y2 = [
                float(v) for v in box.xyxy[0]
            ]

            box_area = max(0, x2 - x1) * max(0, y2 - y1)
            image_area = img_w * img_h

            area_percent = (
                box_area / image_area * 100
                if image_area > 0
                else 0
            )

            detections.append({
                "class": class_name,
                "confidence": round(
                    float(box.conf[0]) * 100, 2
                ),
                "bbox": [
                    round(x1), round(y1),
                    round(x2), round(y2)
                ],
                "area_percent": round(area_percent, 2),
                "image_width": img_w,
                "image_height": img_h,
            })

    return detections


def get_weight(class_name):
    name = class_name.lower()

    for key, weight in CLASS_WEIGHTS.items():
        if key in name:
            return weight

    return 1.0


def calculate_severity(detections):
    if not detections:
        return {
            "level": "None",
            "score": 0,
            "priority": "No detected damage; verify if necessary",
        }

    # Group detections by hazard class.
    # Use the largest box per class as a limited visual signal,
    # rather than adding every box's area to the total.
    class_scores = {}

    for detection in detections:
        class_name = detection["class"]
        weight = get_weight(class_name)

        area_percent = detection.get("area_percent", 0)

        # Cap the influence of image-relative box area.
        # This does NOT measure real-world damage size.
        capped_area = min(max(area_percent, 0), 5.0)

        # Area contributes only a small adjustment.
        area_factor = 1 + (capped_area / 25.0)

        score = weight * area_factor

        if class_name not in class_scores:
            class_scores[class_name] = score
        else:
            class_scores[class_name] = max(
                class_scores[class_name], score
            )

    # Combine classes with diminishing contribution.
    # Repeated boxes of the same class are not simply summed.
    scores = sorted(class_scores.values(), reverse=True)

    score = scores[0]

    for extra_score in scores[1:]:
        score += extra_score * 0.25

    score = round(score, 2)

    if score < 2.0:
        level = "Low"
        priority = "Routine monitoring"
    elif score < 3.5:
        level = "Medium"
        priority = "Inspect and schedule repair"
    else:
        level = "High"
        priority = "Prompt inspection; prioritize repair if risk is confirmed"

    return {
        "level": level,
        "score": score,
        "priority": priority,
    }
