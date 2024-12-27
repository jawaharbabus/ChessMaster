"use client";
import React, { FC, useState } from "react";

interface DialogBoxProps {
  onSubmit: (
    userName: string,
    roomName: string,
    color: "white" | "black"
  ) => void;
}
type typeColor = "white" | "black";

const DialogBox: FC<DialogBoxProps> = ({ onSubmit }) => {
  const [userName, setUserName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [color, setColor] = useState<typeColor>("white");

  const handleSubmit = () => {
    if (userName && roomName) {
      onSubmit(userName, roomName, color);
    } else {
      alert("Please fill in all fields.");
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        textAlign: "center",
      }}
    >
      <h2>Enter Game Details</h2>
      <div>
        <input
          type="text"
          placeholder="Your Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          style={{ marginBottom: "10px", width: "100%" }}
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          style={{ marginBottom: "10px", width: "100%" }}
        />
      </div>
      <div>
        <label>
          Choose Color:
          <select
            value={color}
            onChange={(e) => setColor(e.target.value as typeColor)}
            style={{ marginLeft: "10px" }}
          >
            <option value="white">White</option>
            <option value="black">Black</option>
          </select>
        </label>
      </div>
      <button
        onClick={handleSubmit}
        style={{ marginTop: "10px", padding: "10px", width: "100%" }}
      >
        Start Game
      </button>
    </div>
  );
};

export default DialogBox;
