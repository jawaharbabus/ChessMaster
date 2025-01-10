"use client";

import React, { FC, useState, useEffect } from "react";
import "../css/ChessTimer.css";

interface ChessTimerProps {
  timeInMinutes: 10 | 15 | 20 | 30; // Time in minutes
  position: "top" | "bottom"; // Display position
  isTurn: boolean;
  gameOverCallback: () => void;
}

const ChessTimer: FC<ChessTimerProps> = ({
  timeInMinutes,
  position,
  isTurn,
  gameOverCallback,
}) => {
  const [timeLeft, setTimeLeft] = useState(timeInMinutes * 60); // Convert minutes to seconds
  // const [timeLeft, setTimeLeft] = useState(60);
  useEffect(() => {
    const timer = setInterval(() => {
      if (isTurn) setTimeLeft((prevTime) => Math.max(prevTime - 1, 0));
    }, 1000);

    return () => clearInterval(timer); // Cleanup interval on unmount
  }, [isTurn]);

  // Check if time has run out
  useEffect(() => {
    if (timeLeft === 0) {
      gameOverCallback();
    }
  }, [timeLeft, gameOverCallback]);

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
