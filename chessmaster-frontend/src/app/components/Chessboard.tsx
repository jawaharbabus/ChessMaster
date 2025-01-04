"use client";

import React, {
  FC,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Chess, Square, Piece } from "chess.js";
import dynamic from "next/dynamic";
import { Chessboard } from "react-chessboard";
import ChessTimer from "./ChessTimer";
import Modal from "react-modal";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import "../css/ChessBoard.css";

type SquareStyles = Record<
  string,
  { background: string; borderRadius?: string }
>;

interface ChessBoardProps {
  userName: string;
  roomName: string;
  color: BoardOrientation;
  fen: string;
  isTurn: boolean;
  time: 10 | 15 | 20 | 30 | null;
  setFen: React.Dispatch<React.SetStateAction<string>>;
  setIsTurn: React.Dispatch<React.SetStateAction<boolean>>;
  sendMessage: (
    room: string,
    sourceSquare: string,
    targetSquare: string
  ) => void;
}

// Modal styling (optional)
// const customStyles = {
//   content: {
//     top: "50%",
//     left: "50%",
//     right: "auto",
//     bottom: "auto",
//     marginRight: "-50%",
//     transform: "translate(-50%, -50%)",
//     textAlign: "center",
//     backgroundColor: "#2c3e50", // Dark background
//     color: "#ecf0f1", // Light text
//     borderRadius: "10px",
//     border: "none",
//     boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
//   },
//   overlay: {
//     backgroundColor: "rgba(0, 0, 0, 0.75)", // Dimmed overlay
//   },
// };

const ChessBoard: FC<ChessBoardProps> = forwardRef(
  (
    {
      userName,
      roomName,
      color,
      fen,
      isTurn,
      time,
      setFen,
      setIsTurn,
      sendMessage,
    },
    ref
  ) => {
    const [game, setGame] = useState(new Chess());
    const [highlightedSquares, setHighlightedSquares] = useState<SquareStyles>(
      {}
    );
    const [gameOverMessage, setGameOverMessage] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      movePiece,
    }));

    useEffect(() => {
      console.log("FEN", fen);
      game.load(fen);
    }, [fen]);

    const movePiece = (sourceSquare: string, targetSquare: string) => {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
      });

      if (move === null) return false;
      setHighlightedSquares({});
      setFen(game.fen());
      // Check for game over conditions
      if (game.isCheckmate()) {
        const winner = game.turn() === "w" ? "Black" : "White"; // The current turn's opponent wins
        setGameOverMessage(`${winner} wins by checkmate!`);
      } else if (game.isDraw()) {
        setGameOverMessage("The game is a draw!");
      }
      setIsTurn((prevTurn) => !prevTurn);
      console.log(isTurn);
      return true;
    };

    const handlePieceClick = (piece: Piece, square: Square): any => {
      const moves = game.moves({ square, verbose: true });

      if (moves.length === 0) {
        setHighlightedSquares({}); // No moves to highlight
        return;
      }

      const highlights: SquareStyles = {};
      moves.forEach((move) => {
        highlights[move.to] = {
          background: "rgba(255, 255, 0, 0.5)",
          borderRadius: "50%",
        };
      });

      setHighlightedSquares(highlights);
    };

    const onDrop = (sourceSquare: string, targetSquare: string) => {
      if (isTurn) {
        let res = movePiece(sourceSquare, targetSquare);
        if (res) {
          sendMessage(roomName, sourceSquare, targetSquare);
        }
        return res;
      }
      return false;
    };

    const restartGame = () => {
      const newGame = new Chess();
      setGame(newGame);
      setFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
      setHighlightedSquares({});
      setGameOverMessage(null);
    };

    // return (
    //   <div>
    //     <ChessTimer timeInMinutes={time || 10} position="top" />
    //     <Chessboard
    //       position={fen}
    //       onPieceDrop={onDrop}
    //       boardOrientation={color}
    //       arePiecesDraggable={true}
    //       customSquareStyles={highlightedSquares}
    //       boardWidth={700}
    //       onPieceClick={handlePieceClick}
    //     />
    //     <ChessTimer timeInMinutes={time || 10} position="bottom" />
    //     {gameOverMessage && (
    //       <Modal
    //         isOpen={!!gameOverMessage}
    //         onRequestClose={() => setGameOverMessage(null)}
    //         style={customStyles}
    //         contentLabel="Game Over"
    //       >
    //         <h2>{gameOverMessage}</h2>
    //         <button onClick={restartGame} style={{ marginTop: "1rem" }}>
    //           Restart Game
    //         </button>
    //       </Modal>
    //     )}
    //   </div>
    // );
    return (
      <div className="chess-layout">
        {/* Left Panel: Timers and future game information */}
        <div className="left-panel">
          <div className="top-timer">
            <ChessTimer timeInMinutes={time || 10} position="top" />
          </div>
          <div className="game-info">
            <p>Game Info / Captured Pieces / Hints</p>
            {/* Placeholder for future game-related information */}
          </div>
          <div className="bottom-timer">
            <ChessTimer timeInMinutes={time || 10} position="bottom" />
          </div>
        </div>

        {/* Center Panel: Chessboard */}
        <div className="center-panel">
          <Chessboard
            position={fen}
            onPieceDrop={onDrop}
            boardOrientation={color}
            arePiecesDraggable={true}
            customSquareStyles={highlightedSquares}
            boardWidth={700}
            onPieceClick={handlePieceClick}
          />
        </div>

        {/* Right Panel: Video Stream */}
        <div className="right-panel">
          <div className="video-stream">
            <video autoPlay muted playsInline className="video-element" />
          </div>
        </div>

        {/* Game Over Modal */}
        {gameOverMessage && (
          <Modal
            isOpen={!!gameOverMessage}
            onRequestClose={() => setGameOverMessage(null)}
            style={customStyles}
            contentLabel="Game Over"
          >
            <h2>{gameOverMessage}</h2>
            <button onClick={restartGame} style={{ marginTop: "1rem" }}>
              Restart Game
            </button>
          </Modal>
        )}
      </div>
    );
  }
);

export default ChessBoard;
