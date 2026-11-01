import { useState, useEffect } from "react";
import { useLocation } from "./hooks/useLocation";

import RoadMap from "./components/RoadMap";

const API = "http://127.0.0.1:5000";

export default function App() {
  const { pos, error } = useLocation();
  const [reports, setReports] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`${API}/reports`)
      .then((r) => r.json())
      .then(setReports)
      .catch(() => setApiError("Backend not reachable"));
  }, []);

  const addReport = async (type) => {
    if (!pos || busy) return;
    setBusy(true);
    try {
      let severity = null;
      let photoName = null;

      if (photo) {
        const form = new FormData();
        form.append("image", photo);
        const analyzeRes = await fetch(`${API}/analyze`, { method: "POST", body: form });
        if (!analyzeRes.ok) throw new Error("Analysis failed");
        const result = await analyzeRes.json();
        severity = result.severity ?? null;
        photoName = result.filename ?? null;
      }

      const res = await fetch(`${API}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, lat: pos.lat, lng: pos.lng, severity, photo: photoName }),
      });
      if (!res.ok) throw new Error("Save failed");
      const saved = await res.json();
      setReports((prev) => [...prev, saved]);
      setPhoto(null);
      setApiError(null);
    } catch {
      setApiError("Could not analyze or save the report");
    } finally {
      setBusy(false);
    }
  };

  if (error) return <p>Location error: {error}</p>;

  return (
    <div style={{ position: "relative" }}>
      <RoadMap pos={pos} reports={reports} />
      <div
        style={{
          position: "absolute", top: 12, right: 12, zIndex: 1000,
          display: "flex", flexDirection: "column", gap: 8,
          background: "#fff", padding: 10, borderRadius: 8,
        }}
      >
        <input
          key={photo ? photo.name : "no-photo"}
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files[0] || null)}
        />
        <button disabled={busy} onClick={() => addReport("pothole")}>
          {busy ? "Working…" : "Report pothole"}
        </button>
        <button disabled={busy} onClick={() => addReport("accident")}>
          Report accident
        </button>
      </div>
      {apiError && (
        <div style={{ position: "absolute", bottom: 12, left: 12, zIndex: 1000, background: "#fff", padding: 8 }}>
          {apiError}
        </div>
      )}
    </div>
  );
}
