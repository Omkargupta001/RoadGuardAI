
function ComplaintCard({ complaint }) {
  const statusClass = complaint.status
    .toLowerCase()
    .replace(" ", "-");

  return (
    <div className="complaint-card">
      <div className="complaint-image">
        <img
          src={`http://127.0.0.1:5001${complaint.image_url}`}
          alt={complaint.hazard_type}
        />
      </div>

      <div className="complaint-details">
        <div className="complaint-heading">
          <h3>{complaint.hazard_type}</h3>
          <span className={`status-badge ${statusClass}`}>
            {complaint.status}
          </span>
        </div>

        <p>
          <strong>Complaint ID:</strong> {complaint.complaint_id}
        </p>

        <p>
          <strong>Description:</strong>{" "}
          {complaint.description || "No description provided"}
        </p>

        {complaint.latitude !== null &&
          complaint.longitude !== null && (
            <p>
              <strong>GPS:</strong>{" "}
              {complaint.latitude.toFixed(5)},{" "}
              {complaint.longitude.toFixed(5)}
            </p>
          )}

        <p>
          <strong>Reported:</strong>{" "}
          {new Date(complaint.created_at).toLocaleString()}
        </p>

        {complaint.authority_response && (
          <div className="authority-response">
            <strong>Authority Response</strong>
            <p>{complaint.authority_response}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ComplaintCard;
