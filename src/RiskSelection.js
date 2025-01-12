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

  // State for the dropdowns and results
  const [windows, setWindows] = useState("1");
  const [doors, setDoors] = useState("1");
  const [entries, setEntries] = useState("1");
  const [city, setCity] = useState("");
  const [recommendations, setRecommendations] = useState(null);

  const handleReport = async () => {
    try {
      // Send a POST request to the backend API
      const response = await axios.post("http://127.0.0.1:5000/recommendations", {
        windows,
        doors,
        entries,
        city,
      });

      // Update the state with the recommendations received from the backend
      setRecommendations(response.data.recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      alert("An error occurred while fetching recommendations. Please try again.");
    }
  };

  return (
    <div className="risk-container">
      {/* Parallax-like background */}
      <div className="parallax-bg"></div>

      <div className="risk-content">
        <h1 className="risk-title">Risk Selection</h1>

        <div className={`risk-selection-grid ${fadeIn ? "fade-in" : ""}`} ref={sectionRef}>
          {/* Windows */}
          <div className="risk-box">
            <label htmlFor="windows">Windows</label>
            <select id="windows" value={windows} onChange={(e) => setWindows(e.target.value)}>
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
            <select id="doors" value={doors} onChange={(e) => setDoors(e.target.value)}>
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
            <select id="entries" value={entries} onChange={(e) => setEntries(e.target.value)}>
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

        {/* Display Recommendations */}
        {recommendations && (
          <div className="recommendations">
            <h2>Recommendations</h2>
            <p>Windows: {recommendations.windows}</p>
            <p>Doors: {recommendations.doors}</p>
            <p>City: {recommendations.city}</p>
          </div>
        )}

        {/* Cursive quote */}
        <div className={`guarantee-section ${fadeIn ? "fade-in" : ""}`}>
          <p className="guarantee-text">
            100% Protection Guarantee by <span className="company-name">Sentinel</span>
          </p>
          <div className="lock-icon">
            <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M32 16c-4.418 0-8 3.582-8 8v6H16v24h32V30H40v-6c0-4.418-3.582-8-8-8z
                 m0 4c2.21 0 4 1.79 4 4v6H28v-6c0-2.21 1.79-4 4-4z"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RiskSelection;
