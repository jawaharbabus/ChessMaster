import React, { FC } from "react";
import ChessBoard from "./components/Chessboard";

interface Props {
  // Define the props the component accepts here
  title?: string; // Example optional prop
}

const Homepage: FC<Props> = ({ title = "Default Title" }) => {
  return (
    <div style={{ width: "auto", height: "100%", margin: "0 auto" }}>
      <ChessBoard />
    </div>
  );
};

export default Homepage;
