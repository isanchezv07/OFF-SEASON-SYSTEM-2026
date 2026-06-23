import React, { useState, useEffect } from "react";
import PythonDetection from "../server/Python_detection/detection_score.json";

const ScoreDisplay = () => {
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    if (Array.isArray(PythonDetection) && PythonDetection.length > 0) {
      setScore(PythonDetection[0].score);
    }
  }, []);

  if (score === null) return <div>Cargando score...</div>;

  return (
    <div style={{ fontSize: "2rem", fontWeight: "bold" }}>
      Score: {score}
    </div>
  );
};

export default ScoreDisplay;