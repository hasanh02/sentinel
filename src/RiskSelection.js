import React, { useEffect, useRef, useState } from "react";
import "./RiskSelection.css";
import axios from "axios";

function RiskSelection() {
  const [fadeIn, setFadeIn] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setFadeIn(true);
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // State for dropdowns
  const [windows, setWindows] = useState("1");
  const [doors, setDoors] = useState("1");
  const [entries, setEntries] = useState("1");
  const [city, setCity] = useState("");

  // Handle the report request
  const handleReport = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/generate-report",
        {
          windows,
          doors,
          entries: entries,
          city,
        },
        {
          // This is crucial to get the PDF file properly
          responseType: "blob",
        }
      );
  
      // Convert the blob to a URL
      const file = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
  
      // Option A: Open in a new tab
      window.open(fileURL);
  
      // Option B: Automatically download:
      // const link = document.createElement('a');
      // link.href = fileURL;
      // link.download = 'SecurityReport.pdf';
      // link.click();
  
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      alert("Failed to fetch recommendations. Please try again.");
    }
  };

  return (
    <div className="risk-container">
      {/* Parallax-like background */}
      <div className="parallax-bg"></div>

      <div className="risk-content">
        <h1 className="risk-title">Risk Selection</h1>

        <div
          className={`risk-selection-grid ${fadeIn ? "fade-in" : ""}`}
          ref={sectionRef}
        >
          {/* Windows */}
          <div className="risk-box">
            <label htmlFor="windows">Windows</label>
            <select
              id="windows"
              value={windows}
              onChange={(e) => setWindows(e.target.value)}
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
              <option value="10+">10+</option>
            </select>
          </div>

          {/* Doors */}
          <div className="risk-box">
            <label htmlFor="doors">Doors</label>
            <select
              id="doors"
              value={doors}
              onChange={(e) => setDoors(e.target.value)}
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
              <option value="10+">10+</option>
            </select>
          </div>

          {/* Entry Points */}
          <div className="risk-box">
            <label htmlFor="entries">Entry Points</label>
            <select
              id="entries"
              value={entries}
              onChange={(e) => setEntries(e.target.value)}
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
              <option value="10+">10+</option>
            </select>
          </div>

          {/* City */}
          <div className="risk-box">
            <label htmlFor="city">City</label>
            <input
              id="city"
              type="text"
              placeholder="Enter your city..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          {/* Button */}
          <div className="report-button-container">
            <button className="report-button" onClick={handleReport}>
              Get Report
            </button>
          </div>
        </div>

        {/* We removed the PDF download section */}

        {/* Cursive quote / Guarantee section */}
        <div className={`guarantee-section ${fadeIn ? "fade-in" : ""}`}>
          <p className="guarantee-text">
            100% Protection Guarantee by <span className="company-name">Sentinel</span>
          </p>
          <div className="lock-icon">
            {/* Lock SVG or icon can stay here */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RiskSelection;
