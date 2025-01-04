"use client";
import React, { FC, useState } from "react";
import { FaChessKing } from "react-icons/fa"; // King icons
import "../css/DialogBox.css";

type typeColor = "white" | "black";
type typeTime = 10 | 15 | 20 | 30 | null;

interface DialogBoxProps {
  onSubmit: (
    userName: string,
    roomName: string,
    color: typeColor,
    time: typeTime
  ) => void;
}

const DialogBox: FC<DialogBoxProps> = ({ onSubmit }) => {
  const [userName, setUserName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [color, setColor] = useState<typeColor>("white");
  const [time, setTime] = useState<typeTime>(null);

  const handleSubmit = () => {
    if (userName && roomName) {
      onSubmit(userName, roomName, color, time);
    } else {
      alert("Please fill in all fields.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTime(val === "" ? null : (Number(val) as typeTime));
  };

  return (
    <div className="dialog-box">
      <h2 className="dialog-title">Enter Game Details</h2>
      <div className="dialog-field">
        <input
          type="text"
          placeholder="Your Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="dialog-input"
        />
      </div>
      <div className="dialog-field">
        <input
          type="text"
          placeholder="Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="dialog-input"
        />
      </div>
      <div className="dialog-field">
        <label>Choose Color:</label>
        <div className="color-selector">
          <div
            className={`color-option ${color === "white" ? "selected" : ""}`}
            onClick={() => setColor("white")}
          >
            <FaChessKing size={24} className="white-king-icon" />
            <span>White</span>
          </div>
          <div
            className={`color-option ${color === "black" ? "selected" : ""}`}
            onClick={() => setColor("black")}
          >
            <FaChessKing size={24} className="black-king-icon" />
            <span>Black</span>
          </div>
          <div
            className={`color-slider ${color === "white" ? "left" : "right"}`}
          />
        </div>
        <div className="dialog-field">
          <label>Time (minutes)</label>
          <input
            className="dialog-input time-input"
            type="number"
            min="10"
            max="30"
            step="5"
            placeholder="No time"
            value={time ?? ""}
            onChange={handleChange}
          />
        </div>
      </div>
      <button onClick={handleSubmit} className="dialog-button">
        Start Game
      </button>
    </div>
  );
};

export default DialogBox;
