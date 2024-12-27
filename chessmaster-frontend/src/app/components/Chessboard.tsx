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
import Modal from "react-modal";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";

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
  setFen: React.Dispatch<React.SetStateAction<string>>;
  setIsTurn: React.Dispatch<React.SetStateAction<boolean>>;
  sendMessage: (
    room: string,
    sourceSquare: string,
    targetSquare: string
  ) => void;
}

// Modal styling (optional)
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    textAlign: "center",
    backgroundColor: "#2c3e50", // Dark background
    color: "#ecf0f1", // Light text
    borderRadius: "10px",
    border: "none",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.75)", // Dimmed overlay
  },
};
const ChessBoard: FC<ChessBoardProps> = forwardRef(
  (
    { userName, roomName, color, fen, isTurn, setFen, setIsTurn, sendMessage },
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
      setFen("start");
      setHighlightedSquares({});
      setGameOverMessage(null);
    };

    return (
      <div>
        <Chessboard
          position={fen}
          onPieceDrop={onDrop}
          boardOrientation={color}
          arePiecesDraggable={true}
          customSquareStyles={highlightedSquares}
          boardWidth={700}
          onPieceClick={handlePieceClick}
        />
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
