
import { useState } from "react";
import { submitComplaint } from "./CommunityApi";

function ComplaintForm({ onComplaintSubmitted }) {
  const [hazardType, setHazardType] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function getLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toString());
        setLongitude(position.coords.longitude.toString());
        setError("");
        setMessage("Location captured successfully.");
      },
      () => {
        setError("Unable to get location. Please allow location access.");
      }
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!hazardType || !image) {
      setError("Please select a hazard type and upload an image.");
      return;
    }

    const formData = new FormData();
    formData.append("hazard_type", hazardType);
    formData.append("description", description);
    formData.append("image", image);

    if (latitude) formData.append("latitude", latitude);
    if (longitude) formData.append("longitude", longitude);

    try {
      setLoading(true);

      const result = await submitComplaint(formData);

      setMessage(
        `Complaint submitted! Your ID is ${result.complaint.complaint_id}`
      );

      setHazardType("");
      setDescription("");
      setImage(null);
      setLatitude("");
      setLongitude("");

      e.target.reset();

      if (onComplaintSubmitted) {
        onComplaintSubmitted(result.complaint);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="community-form">
      <h2>Report a Road Hazard</h2>
      <p>Help make roads safer by reporting damaged roads.</p>

      <form onSubmit={handleSubmit}>
        <label>Hazard Type</label>
        <select
          value={hazardType}
          onChange={(e) => setHazardType(e.target.value)}
          required
        >
          <option value="">Select hazard</option>
          <option value="Pothole">Pothole</option>
          <option value="Longitudinal Crack">Longitudinal Crack</option>
          <option value="Transverse Crack">Transverse Crack</option>
          <option value="Alligator Crack">Alligator Crack</option>
          <option value="Waterlogging">Waterlogging</option>
          <option value="Damaged Road">Damaged Road</option>
          <option value="Other">Other</option>
        </select>

        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the road problem and its location..."
          rows="4"
        />

        <label>Upload Road Image</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setImage(e.target.files[0] || null)}
          required
        />

        <button type="button" onClick={getLocation}>
          Capture My Location
        </button>

        {latitude && longitude && (
          <p>
            Location: {Number(latitude).toFixed(5)},{" "}
            {Number(longitude).toFixed(5)}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Complaint"}
        </button>
      </form>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </section>
  );
}

export default ComplaintForm;
