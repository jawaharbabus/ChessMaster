"use client";
import React, { FC, useState, useEffect, useRef } from "react";
import ChessBoard from "./components/Chessboard";
import DialogBox from "./components/DialogBox";
import socketService from "./lib/socketService";

interface Props {
  title?: string; // Optional prop for title
}

const Homepage: FC<Props> = ({ title = "Default Title" }) => {
  const chessBoardRef = useRef<{
    movePiece: (sourceSquare: string, targetSquare: string) => boolean;
  }>(null);
  const [userName, setUserName] = useState<string>("");
  const [roomName, setRoomName] = useState<string>("");
  const [color, setColor] = useState<"white" | "black">("white");
  const [fen, setFen] = useState(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  );
  const [isTurn, setIsTurn] = useState<boolean>(color === "white");
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);

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
    selectedColor: "white" | "black"
  ) => {
    setUserName(name);
    setRoomName(room);
    setColor(selectedColor);
    setIsTurn(selectedColor === "white");
    setIsGameStarted(true);

    // Connect to the WebSocket server and join the room
    socketService.connect(`http://${window.location.hostname}:4000`);
    socketService.joinRoom(room, name, selectedColor);
  };

  useEffect(() => {
    if (isGameStarted) {
      socketService.onMessageReceived(
        (msg) => {
          console.log("onMessageReceived", msg);
          const parsedMessage = JSON.parse(msg.message);
          const { sourceSquare, targetSquare } = parsedMessage;
          if (chessBoardRef.current) {
            chessBoardRef.current.movePiece(sourceSquare, targetSquare);
          }
        },
        (error) => {
          alert(`Error joining room: ${error}`);
        }
      );

      socketService.onError((error) => {
        console.error("Socket error:", error);
      });

      // Clean up on unmount
      return () => {
        socketService.disconnect();
      };
    }
  }, [isGameStarted]);

  return (
    <div style={{ width: "auto", height: "100%", margin: "0 auto" }}>
      {!isGameStarted ? (
        <DialogBox onSubmit={handleGameStart} />
      ) : (
        <ChessBoard
          ref={chessBoardRef}
          userName={userName}
          roomName={roomName}
          color={color}
          fen={fen}
          isTurn={isTurn}
          setFen={setFen}
          setIsTurn={setIsTurn}
          sendMessage={sendMessage}
        />
      )}
    </div>
  );
};

export default Homepage;
