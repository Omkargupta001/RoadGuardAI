
import { useEffect, useState } from "react";
import ComplaintForm from "./ComplaintForm";
import ComplaintCard from "./ComplaintCard";
import AdminDashboard from "./AdminDashboard";
import AuthPanel from "./AuthPanel";
import {
  getComplaints,
  getCurrentUser,
  logoutUser
} from "./CommunityApi";
import "./Community.css";

function Community() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(() => getCurrentUser());

  async function loadComplaints() {
    try {
      setError("");
      const data = await getComplaints();
      setComplaints(data);
    } catch (err) {
      setError("Unable to load complaints. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComplaints();
    const interval = setInterval(loadComplaints, 15000);
    return () => clearInterval(interval);
  }, []);

  function handleLogout() {
    logoutUser();
    setUser(null);
  }

  function handleNewComplaint() {
    loadComplaints();
  }

  return (
    <main className="community-page">
      <header className="community-header">
        <h1>RoadGuard Community</h1>
        <p>Report road hazards. Track repairs. Build safer roads together.</p>

        {user ? (
          <div className="auth-user-bar">
            <span>
              Welcome, <strong>{user.name}</strong> ({user.role})
            </span>
            <button onClick={handleLogout}>Sign Out</button>
          </div>
        ) : (
          <p className="public-note">
            You are viewing public community reports. Sign in to participate.
          </p>
        )}
      </header>

      {!user ? (
        <AuthPanel onAuth={setUser} />
      ) : (
        <ComplaintForm onComplaintSubmitted={handleNewComplaint} />
      )}

      <section className="public-complaints">
        <div className="section-heading">
          <h2>Community Reports</h2>
          <span>{complaints.length} Reports</span>
        </div>

        {loading && <p>Loading complaints...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && complaints.length === 0 && (
          <p>No complaints reported yet. Be the first to report a road hazard!</p>
        )}

        <div className="complaint-list">
          {complaints.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))}
        </div>
      </section>

      {user?.role === "admin" && (
        <AdminDashboard
          complaints={complaints}
          onUpdated={loadComplaints}
        />
      )}
    </main>
  );
}

export default Community;
