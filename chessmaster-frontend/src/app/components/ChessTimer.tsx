"use client";

import React, { FC, useState, useEffect } from "react";
import "../css/ChessTimer.css";

interface ChessTimerProps {
  timeInMinutes: 10 | 15 | 20 | 30; // Time in minutes
  position: "top" | "bottom"; // Display position
}

const ChessTimer: FC<ChessTimerProps> = ({ timeInMinutes, position }) => {
  const [timeLeft, setTimeLeft] = useState(timeInMinutes * 60); // Convert minutes to seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => Math.max(prevTime - 1, 0));
    }, 1000);

    return () => clearInterval(timer); // Cleanup interval on unmount
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`chess-timer chess-timer-${position}`}>
      {formatTime(timeLeft)}
    </div>
  );
};

export default ChessTimer;
