"use client";

import React, { FC, useState, useEffect, useRef, useMemo } from "react";
import ChessBoard from "./components/Chessboard";
import DialogBox from "./components/DialogBox";
import VideoStream from "./components/VideoStream";
import socketService from "./lib/socketService";
import "./css/Homepage.css"; // Import the external CSS file
import Peer from "peerjs";

type typeColor = "white" | "black";
type typeTime = 10 | 15 | 20 | 30 | null;

interface Props {
  title?: string; // Optional prop for title
}

const Homepage: FC<Props> = ({ title = "Default Title" }) => {
  // variables
  // Replace the plain variables with state
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  let gameTime: typeTime = null;

  // Refs
  const chessBoardRef = useRef<{
    movePiece: (sourceSquare: string, targetSquare: string) => boolean;
  }>(null);
  const VideoStreamRef = useRef<{
    handleCall: (idToCall: string) => void;
  }>(null);

  // State
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [color, setColor] = useState<typeColor>("white");

  const generateRandomString = () => Math.random().toString(36).substring(2);
  const callerId = useMemo(() => generateRandomString(), []);

  // helpers
  const sendMessage = (
    roomName: string,
    sourceSquare: string,
    targetSquare: string
  ) => {
    console.log("Sending message", roomName, sourceSquare, targetSquare);
    socketService.sendMessage(
      roomName,
      JSON.stringify({
        sourceSquare: sourceSquare,
        targetSquare: targetSquare,
      })
    );
  };

  const handleCreateRoom = (
    userName: string,
    roomName: string,
    color: typeColor,
    time: typeTime
  ) => {
    userName = userName.trim();
    roomName = roomName.trim();
    setName(userName);
    setRoom(roomName);
    gameTime = time;
    socketService.createRoom(userName, roomName, color, time, callerId);
  };

  const handleJoinRoom = (userName: string, roomName: string) => {
    userName = userName.trim();
    roomName = roomName.trim();
    setName(userName);
    setRoom(roomName);
    socketService.joinRoom(userName, roomName, callerId);
  };

  //Event Listener callbacks
  const onChessMove = (msg: any) => {
    const parsedMessage = JSON.parse(msg.message);
    const { sourceSquare, targetSquare } = parsedMessage;
    if (chessBoardRef.current) {
      chessBoardRef.current.movePiece(sourceSquare, targetSquare);
    }
  };

  const onStartGame = (msg: any) => {
    setIsGameStarted(true);
  };

  const onRoomJoined = (msg: any) => {
    let parsed = JSON.parse(msg);
    setColor(parsed.color);
  };

  const onMemberJoined = (msg: any) => {
    let parsed = JSON.parse(msg);
    setTimeout(() => {
      console.log("memberJoined", parsed);
      if (VideoStreamRef.current) {
        VideoStreamRef.current.handleCall(parsed.callerId);
      }
    }, 5000);
  };

  const onError = (err: any) => {
    alert(`Error: ${err}`);
  };

  // ComponentDidMount
  useEffect(() => {
    socketService.connect(`https://${window.location.hostname}:4000`);
    //socketService.connect(`https://3.19.65.120:4000`);
    // new Peer(callerId, {
    //   host: `${window.location.hostname}`,
    //   //host: "localhost",
    //   //host: "3.19.65.120",
    //   port: 4001,
    //   path: "/peer",
    //   secure: true,
    // });

    socketService.onMessageReceived(
      onChessMove,
      onRoomJoined,
      onMemberJoined,
      onStartGame,
      onError
    );

    socketService.onError((error) => {
      console.error("Socket error:", error);
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <div className="homepage-container">
      {!isGameStarted ? (
        <DialogBox createRoom={handleCreateRoom} joinRoom={handleJoinRoom} />
      ) : (
        <div className="game-container">
          <div className="chessboard-container">
            <ChessBoard
              ref={chessBoardRef}
              userName={name}
              roomName={room}
              color={color}
              time={gameTime}
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
