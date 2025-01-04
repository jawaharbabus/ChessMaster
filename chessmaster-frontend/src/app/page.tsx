"use client";

import React, { FC, useState, useEffect, useRef } from "react";
import ChessBoard from "./components/Chessboard";
import DialogBox from "./components/DialogBox";
import VideoStream from "./components/VideoStream";
import socketService from "./lib/socketService";
import "./css/Homepage.css"; // Import the external CSS file

interface Props {
  title?: string; // Optional prop for title
}

const Homepage: FC<Props> = ({ title = "Default Title" }) => {
  const chessBoardRef = useRef<{
    movePiece: (sourceSquare: string, targetSquare: string) => boolean;
  }>(null);
  const VideoStreamRef = useRef<{
    handleCall: (idToCall: string) => void;
  }>(null);
  const [userName, setUserName] = useState<string>("");
  const [roomName, setRoomName] = useState<string>("");
  const [color, setColor] = useState<"white" | "black">("white");
  const [fen, setFen] = useState(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  );
  const [isTurn, setIsTurn] = useState<boolean>(color === "white");
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [callerId, setCallerId] = useState<string>("");
  const [time, setTime] = useState<10 | 15 | 20 | 30 | null>(null);
  const generateRandomString = () => Math.random().toString(36).substring(2);

  const sendMessage = (
    roomName: string,
    sourceSquare: string,
    targetSquare: string
  ) => {
    socketService.sendMessage(
      roomName,
      JSON.stringify({
        sourceSquare: sourceSquare,
        targetSquare: targetSquare,
      })
    );
  };

  const handleGameStart = (
    name: string,
    room: string,
    selectedColor: "white" | "black",
    selectedTime: 10 | 15 | 20 | 30 | null
  ) => {
    setUserName(name);
    setRoomName(room);
    setColor(selectedColor);
    setIsTurn(selectedColor === "white");
    setTime(selectedTime);

    // Connect to the WebSocket server and join the room
    socketService.joinRoom(room, name, selectedColor, callerId);
  };

  useEffect(() => {
    setCallerId(generateRandomString);
    socketService.connect(`https://${window.location.hostname}:4000`);

    socketService.onMessageReceived(
      (msg) => {
        const parsedMessage = JSON.parse(msg.message);
        const { sourceSquare, targetSquare } = parsedMessage;
        if (chessBoardRef.current) {
          chessBoardRef.current.movePiece(sourceSquare, targetSquare);
        }
      },
      (msg) => {
        setIsGameStarted(true);
      },
      (msg) => {
        const parsed = JSON.parse(msg);
        if (VideoStreamRef.current) {
          setTimeout(() => {
            if (VideoStreamRef.current) {
              VideoStreamRef.current.handleCall(parsed.callerId);
            }
          }, 5000);
        }
      },
      (error) => {
        alert(`Error: ${error}`);
      }
    );

    socketService.onError((error) => {
      console.error("Socket error:", error);
    });

    // Clean up on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <div className="homepage-container">
      {!isGameStarted ? (
        <DialogBox onSubmit={handleGameStart} />
      ) : (
        <div className="game-container">
          <div className="chessboard-container">
            <ChessBoard
              ref={chessBoardRef}
              userName={userName}
              roomName={roomName}
              color={color}
              fen={fen}
              time={time}
              isTurn={isTurn}
              setFen={setFen}
              setIsTurn={setIsTurn}
              sendMessage={sendMessage}
            />
          </div>
          <div className="videostream-container">
            <VideoStream ref={VideoStreamRef} myUniqueId={callerId} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Homepage;
