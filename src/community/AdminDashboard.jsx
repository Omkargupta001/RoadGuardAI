
import { useState } from "react";
import { updateComplaintStatus } from "./CommunityApi";

function AdminDashboard({ complaints, onUpdated }) {
  const [responses, setResponses] = useState({});
  const [loadingId, setLoadingId] = useState(null);
  const [message, setMessage] = useState("");

  async function handleUpdate(id) {
    const item = complaints.find((c) => c.id === id);
    if (!item) return;

    try {
      setLoadingId(id);
      setMessage("");

      await updateComplaintStatus(
        id,
        responses[id]?.status || item.status,
        responses[id]?.response ?? item.authority_response ?? ""
      );

      setMessage(`Complaint ${item.complaint_id} updated successfully.`);
      await onUpdated();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <section className="admin-dashboard">
      <h2>Authority Dashboard</h2>
      <p>Review community complaints and update their progress.</p>

      {message && <p>{message}</p>}

      {complaints.length === 0 && <p>No complaints available.</p>}

      {complaints.map((item) => (
        <div className="admin-complaint" key={item.id}>
          <h3>{item.complaint_id} — {item.hazard_type}</h3>

          <p>Current status: {item.status}</p>

          <label>Update Status</label>
          <select
            value={responses[item.id]?.status || item.status}
            onChange={(e) =>
              setResponses((prev) => ({
                ...prev,
                [item.id]: {
                  ...prev[item.id],
                  status: e.target.value
                }
              }))
            }
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <label>Authority Response</label>
          <textarea
            rows="3"
            value={
              responses[item.id]?.response ??
              item.authority_response ??
              ""
            }
            placeholder="Enter an update for the citizen..."
            onChange={(e) =>
              setResponses((prev) => ({
                ...prev,
                [item.id]: {
                  ...prev[item.id],
                  response: e.target.value
                }
              }))
            }
          />

          <button
            onClick={() => handleUpdate(item.id)}
            disabled={loadingId === item.id}
          >
            {loadingId === item.id ? "Updating..." : "Save Update"}
          </button>
        </div>
      ))}
    </section>
  );
}

export default AdminDashboard;
