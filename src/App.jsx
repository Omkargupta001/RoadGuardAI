
import { useState } from "react";
import "./App.css";
import Community from "./community/Community";
function RoadGuardLogo() {
  return (
    <div className="brand">
      <div className="logo-mark">
        <svg
          width="30"
          height="30"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
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

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [activePage, setActivePage] = useState("home");

  const handleImageUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      const imageURL = URL.createObjectURL(file);

      setSelectedImage(imageURL);
      setSelectedFile(file);
      setAnalysisResult(null);
    }

    // Allows selecting the same file again.
    event.target.value = "";
  };

  const handleAnalyze = async () => {
    if (!selectedFile || isAnalyzing) return;

    const formData = new FormData();
    formData.append("image", selectedFile);

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/analyze",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      console.log("Backend response:", data);
      setAnalysisResult(data);
    } catch (error) {
      console.error("Analysis failed:", error);

      setAnalysisResult({
        status: "error",
        message:
          error.message || "Could not connect to the backend.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

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
        document.getElementById("how-it-works")?.scrollIntoView({
          behavior: "smooth"
        });
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
      

      {/* Hero */}
      {activePage === "community" ? (
  <Community />
) : (
  <>
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

          {/* Upload */}
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

        {/* Preview */}
        <section className="preview-section">
          <div className="preview-label">
            <span>ROAD ANALYSIS</span>
            <span className="live-dot">●</span>
          </div>

          <div className="road-card">
            {selectedImage ? (
              /* Uploaded image with detection overlay */
              <div className="detection-image-container">
                <img
                  src={selectedImage}
                  alt="Uploaded road for AI analysis"
                  className="detection-image"
                />

                {analysisResult?.status === "success" && (
                  <div className="detection-overlay">
                    {detections.map((detection, index) => {
                      const [x1, y1, x2, y2] =
                        detection.bbox ?? [];

                      const imageWidth =
                        detection.image_width;
                      const imageHeight =
                        detection.image_height;

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
                            {detection.class} ·{" "}
                            {detection.confidence}%
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
              /* Default preview before upload */
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

            {/* Analysis panel */}
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
                      ? `${analysisResult.severity.level} · ${analysisResult.severity.priority}`
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
                  <strong>GPS data pending</strong>
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

export default App;
