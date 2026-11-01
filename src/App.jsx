
import { useState, useEffect } from "react";
import "./App.css";
import Community from "./community/Community";
import RoadMap from "./components/RoadMap";
import { useLocation } from "./hooks/useLocation";

const API = "http://127.0.0.1:5000";

function RoadGuardLogo() {
  return (
    <div className="brand">
      <div className="logo-mark">
        <svg width="30" height="30" viewBox="0 0 40 40" fill="none">
          <path
            d="M20 3L34 8V18C34 27 28 33 20 37C12 33 6 27 6 18V8L20 3Z"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <path
            d="M14 27L17 14H23L26 27"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M18 20H22"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="brand-text">
        <strong>ROADGUARD</strong>
        <span>AI</span>
      </div>
    </div>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [activePage, setActivePage] = useState("home");

  // AI analysis states
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // GPS and reporting states
  const { pos, error } = useLocation();
  const [reports, setReports] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(false);

  // Fetch existing reports
  useEffect(() => {
    fetch(`${API}/reports`)
      .then((response) => {
        if (!response.ok) throw new Error("Backend error");
        return response.json();
      })
      .then(setReports)
      .catch(() => setApiError("Backend not reachable"));
  }, []);

  // AI image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      const imageURL = URL.createObjectURL(file);

      setSelectedImage(imageURL);
      setSelectedFile(file);
      setAnalysisResult(null);
    }

    event.target.value = "";
  };

  // AI analysis
  const handleAnalyze = async () => {
    if (!selectedFile || isAnalyzing) return;

    const formData = new FormData();
    formData.append("image", selectedFile);

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const response = await fetch(`${API}/analyze`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setAnalysisResult(data);
    } catch (error) {
      setAnalysisResult({
        status: "error",
        message: error.message || "Could not connect to backend.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Submit pothole or accident report
  const addReport = async (type) => {
    if (!pos || busy) return;

    setBusy(true);

    try {
      let severity = null;
      let photoName = null;

      if (photo) {
        const form = new FormData();
        form.append("image", photo);

        const analyzeRes = await fetch(`${API}/analyze`, {
          method: "POST",
          body: form,
        });

        if (!analyzeRes.ok) {
          throw new Error("Analysis failed");
        }

        const result = await analyzeRes.json();
        severity = result.severity ?? null;
        photoName = result.filename ?? null;
      }

      const response = await fetch(`${API}/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          lat: pos.lat,
          lng: pos.lng,
          severity,
          photo: photoName,
        }),
      });

      if (!response.ok) {
        throw new Error("Report save failed");
      }

      const saved = await response.json();

      setReports((previous) => [...previous, saved]);
      setPhoto(null);
      setApiError(null);
    } catch {
      setApiError("Could not analyze or save the report");
    } finally {
      setBusy(false);
    }
  };

  // AI detection results
  const detections = analysisResult?.detections ?? [];

  const topDetection = detections.length
    ? detections.reduce((a, b) =>
        b.confidence > a.confidence ? b : a
      )
    : null;

  const hasError = analysisResult?.status === "error";

  const noHazard =
    analysisResult?.status === "success" &&
    detections.length === 0;

  return (
    <div className={darkMode ? "app dark" : "app light"}>

      {/* Navbar */}
      <nav className="navbar">
        <button
          className="logo-button"
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Change theme"
        >
          <RoadGuardLogo />
        </button>

        <div className="nav-links">
          <button onClick={() => setActivePage("home")}>
            Home
          </button>

          <button onClick={() => setActivePage("community")}>
            Community
          </button>

          <button
            onClick={() => {
              setActivePage("home");
              setTimeout(() => {
                document
                  .getElementById("how-it-works")
                  ?.scrollIntoView({ behavior: "smooth" });
              }, 0);
            }}
          >
            How It Works
          </button>
        </div>

        <button
          className="theme-indicator"
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Toggle theme"
        >
          {darkMode ? "☀" : "☾"}
        </button>
      </nav>

      {activePage === "community" ? (
        <Community />
      ) : (
        <>
          {/* Hero */}
          <main id="home" className="hero">

            <section className="hero-content">
              <div className="status-badge">
                <span className="status-dot"></span>
                AI-powered road monitoring
              </div>

              <h1>
                Smarter roads.
                <br />
                <span>Safer cities.</span>
              </h1>

              <p className="hero-description">
                RoadGuard AI helps identify potholes and road hazards
                from images, estimate their severity, and map their
                locations for smarter civic decision-making.
              </p>

              {/* Image Upload */}
              <div className="upload-area">
                <input
                  type="file"
                  id="road-image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  hidden
                />

                <label htmlFor="road-image" className="primary-btn">
                  {selectedImage
                    ? "Change Road Image"
                    : "Upload Road Image"}
                  <span>→</span>
                </label>

                {selectedImage && (
                  <button
                    className="analyze-btn"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze Road"}
                    <span>↗</span>
                  </button>
                )}
              </div>

              {/* Process */}
              <div className="trust-row">
                <div>
                  <strong>01</strong>
                  <span>Upload</span>
                </div>

                <div className="trust-line"></div>

                <div>
                  <strong>02</strong>
                  <span>Detect</span>
                </div>

                <div className="trust-line"></div>

                <div>
                  <strong>03</strong>
                  <span>Map</span>
                </div>
              </div>
            </section>

            {/* AI Preview */}
            <section className="preview-section">
              <div className="preview-label">
                <span>ROAD ANALYSIS</span>
                <span className="live-dot">●</span>
              </div>

              <div className="road-card">

                {selectedImage ? (
                  <div className="detection-image-container">
                    <img
                      src={selectedImage}
                      alt="Uploaded road"
                      className="detection-image"
                    />

                    {analysisResult?.status === "success" && (
                      <div className="detection-overlay">
                        {detections.map((detection, index) => {
                          const [x1, y1, x2, y2] =
                            detection.bbox ?? [];

                          const imageWidth = detection.image_width;
                          const imageHeight = detection.image_height;

                          if (
                            !imageWidth ||
                            !imageHeight ||
                            x1 == null ||
                            y1 == null ||
                            x2 == null ||
                            y2 == null
                          ) {
                            return null;
                          }

                          const left = (x1 / imageWidth) * 100;
                          const top = (y1 / imageHeight) * 100;
                          const width =
                            ((x2 - x1) / imageWidth) * 100;
                          const height =
                            ((y2 - y1) / imageHeight) * 100;

                          return (
                            <div
                              key={`${detection.class}-${index}`}
                              className="detection-box-ai"
                              style={{
                                left: `${left}%`,
                                top: `${top}%`,
                                width: `${width}%`,
                                height: `${height}%`,
                              }}
                            >
                              <span className="detection-label-ai">
                                {detection.class} - {detection.confidence}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {isAnalyzing && (
                      <div className="image-status">
                        Analyzing road...
                      </div>
                    )}

                    {!analysisResult && !isAnalyzing && (
                      <div className="image-status">
                        Image ready for analysis
                      </div>
                    )}

                    {noHazard && (
                      <div className="image-status">
                        No hazards detected
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="road-image">
                    <div className="image-overlay"></div>

                    <div className="detection-box">
                      <div className="box-label">
                        POTHOLE DETECTED
                      </div>
                    </div>

                    <div className="scan-line"></div>
                  </div>
                )}

                {/* Analysis Panel */}
                <div className="analysis-panel">
                  <div className="analysis-header">
                    <div>
                      <small>DETECTION RESULT</small>

                      <h3>
                        {isAnalyzing
                          ? "Analyzing..."
                          : hasError
                          ? "Analysis failed"
                          : noHazard
                          ? "No hazard detected"
                          : topDetection
                          ? topDetection.class
                          : selectedImage
                          ? "Ready to analyze"
                          : "Waiting for image"}
                      </h3>
                    </div>

                    <div className="confidence">
                      <span>Confidence</span>
                      <strong>
                        {topDetection
                          ? `${topDetection.confidence}%`
                          : "--"}
                      </strong>
                    </div>
                  </div>

                  <div className="analysis-details">
                    <div className="detail">
                      <span>Severity</span>
                      <strong className="severity">
                        {analysisResult?.severity
                          ? `${analysisResult.severity.level} - ${analysisResult.severity.priority}`
                          : hasError
                          ? analysisResult.message
                          : "Awaiting scan"}
                      </strong>
                    </div>

                    <div className="detail">
                      <span>Detected hazards</span>
                      <strong>
                        {analysisResult?.status === "success"
                          ? detections.length
                          : "--"}
                      </strong>
                    </div>

                    <div className="detail">
                      <span>Location</span>
                      <strong>
                        {pos
                          ? `${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`
                          : "GPS data pending"}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              <p className="preview-note">
                {selectedImage
                  ? analysisResult?.status === "success"
                    ? "Detection boxes show the hazards identified by the AI model."
                    : "Your image is ready. Start analysis when you're ready."
                  : "Upload a road image to begin analysis."}
              </p>
            </section>
          </main>

          {/* Road Map and Reporting */}
          <section className="info-section">
            <div className="section-heading">
              <span>ROAD MONITORING</span>
              <h2>Report and locate road hazards.</h2>
            </div>

            {error && <p>Location error: {error}</p>}

            <div style={{ position: "relative" }}>
              {pos ? (
                <RoadMap pos={pos} reports={reports} />
              ) : (
                <p>Waiting for your location...</p>
              )}

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  marginTop: 15,
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setPhoto(e.target.files[0] || null)
                  }
                />

                <button
                  disabled={busy || !pos}
                  onClick={() => addReport("pothole")}
                >
                  {busy ? "Working..." : "Report pothole"}
                </button>

                <button
                  disabled={busy || !pos}
                  onClick={() => addReport("accident")}
                >
                  Report accident
                </button>
              </div>

              {apiError && <p>{apiError}</p>}
            </div>
          </section>

          {/* How It Works */}
          <section id="how-it-works" className="info-section">
            <div className="section-heading">
              <span>HOW IT WORKS</span>
              <h2>From road image to actionable insight.</h2>
            </div>

            <div className="steps">
              <div className="step-card">
                <span>01</span>
                <h3>Capture</h3>
                <p>
                  Upload an image of a road from a phone, dashcam,
                  or existing road survey.
                </p>
              </div>

              <div className="step-card">
                <span>02</span>
                <h3>Detect</h3>
                <p>
                  AI analyzes the image and identifies visible
                  potholes and road hazards.
                </p>
              </div>

              <div className="step-card">
                <span>03</span>
                <h3>Prioritize</h3>
                <p>
                  The system estimates severity and prepares the
                  hazard for location-based mapping.
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
