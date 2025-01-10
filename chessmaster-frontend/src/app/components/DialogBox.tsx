"use client";
import React, { FC, useState } from "react";
import { FaChessKing } from "react-icons/fa"; // King icons
import "../css/DialogBox.css";

type typeColor = "white" | "black";
type typeTime = 10 | 15 | 20 | 30 | null;

interface DialogBoxProps {
  createRoom: (
    userName: string,
    roomName: string,
    color: typeColor,
    time: typeTime
  ) => void;
  joinRoom: (userName: string, roomName: string) => void;
}

const DialogBox: FC<DialogBoxProps> = ({ createRoom, joinRoom }) => {
  const [activeTab, setActiveTab] = useState("create");
  const [userName, setUserName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [color, setColor] = useState<typeColor>("white");
  const [time, setTime] = useState<typeTime>(null);

  const handleCreateRoom = () => {
    if (userName && roomName) {
      createRoom(userName, roomName, color, time);
    } else {
      alert("Please fill in all fields.");
    }
  };

  const handleJoinRoom = () => {
    if (userName && roomName) {
      joinRoom(userName, roomName);
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
      <div className="tab-header">
        <button
          className={`tab-button ${activeTab === "create" ? "active" : ""}`}
          onClick={() => setActiveTab("create")}
        >
          Create Room
        </button>
        <button
          className={`tab-button ${activeTab === "join" ? "active" : ""}`}
          onClick={() => setActiveTab("join")}
        >
          Join Room
        </button>
      </div>

      {activeTab === "create" && (
        <div className="tab-content">
          <h2 className="dialog-title">Create Room</h2>
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
                className={`color-option color-option-white ${
                  color === "white" ? "selected" : ""
                }`}
                onClick={() => setColor("white")}
              >
                <FaChessKing size={24} className="white-king-icon" />
                <span>White</span>
              </div>
              <div
                className={`color-option color-option-black ${
                  color === "black" ? "selected" : ""
                }`}
                onClick={() => setColor("black")}
              >
                <FaChessKing size={24} className="black-king-icon" />
                <span>Black</span>
              </div>
              <div
                className={`color-slider ${
                  color === "white" ? "left" : "right"
                }`}
              />
            </div>
          </div>
          <div className="dialog-field">
            <label>Time (minutes):</label>
            <select
              className="dialog-input"
              value={time ?? ""}
              onChange={(e) => setTime(Number(e.target.value) as typeTime)}
            >
              <option value="">Select Time</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>
          </div>
          <button onClick={handleCreateRoom} className="dialog-button">
            Create Room
          </button>
        </div>
      )}

      {activeTab === "join" && (
        <div className="tab-content">
          <h2 className="dialog-title">Join Room</h2>
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
          <button onClick={handleJoinRoom} className="dialog-button">
            Join Room
          </button>
        </div>
      )}
    </div>
  );
};

export default DialogBox;
