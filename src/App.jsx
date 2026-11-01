import { useState, useEffect } from "react";
import { useLocation } from "./hooks/useLocation";
import RoadMap from "./components/RoadMap";

const API = "http://127.0.0.1:5000";

export default function App() {
  const { pos, error } = useLocation();
  const [reports, setReports] = useState([]);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    fetch(`${API}/reports`)
      .then((r) => r.json())
      .then(setReports)
      .catch(() => setApiError("Backend not reachable"));
  }, []);

  const addReport = async (type) => {
    if (!pos) return;
    try {
      const res = await fetch(`${API}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, lat: pos.lat, lng: pos.lng }),
      });
      if (!res.ok) throw new Error("Save failed");
      const saved = await res.json();
      setReports((prev) => [...prev, saved]);
      setApiError(null);
    } catch {
      setApiError("Could not save report");
    }
  };

  if (error) return <p>Location error: {error}</p>;

  return (
    <div style={{ position: "relative" }}>
      <RoadMap pos={pos} reports={reports} />
      <div style={{ position: "absolute", top: 12, right: 12, zIndex: 1000, display: "flex", gap: 8 }}>
        <button onClick={() => addReport("pothole")}>Report pothole</button>
        <button onClick={() => addReport("accident")}>Report accident</button>
      </div>
      {apiError && (
        <div style={{ position: "absolute", bottom: 12, left: 12, zIndex: 1000, background: "#fff", padding: 8 }}>
          {apiError}
        </div>
      )}
    </div>
  );
}