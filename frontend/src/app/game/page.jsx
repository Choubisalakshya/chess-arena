// "use client";

// import React, { useEffect, useState } from "react";
// import { Chess } from "chess.js";
// import { io } from "socket.io-client";

// const PIECES = {
//   w: { p: "♙", r: "♖", n: "♘", b: "♗", q: "♕", k: "♔" },
//   b: { p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚" },
// };

// const SQUARE_COLORS = ["#f0d9b5", "#b58863"];

// let socket;

// export default function GamePage() {
//   const [board, setBoard] = useState([]);
//   const [chess, setChess] = useState(new Chess());
//   const [selected, setSelected] = useState(null);
//   const [color, setColor] = useState(null);
//   const [roomId, setRoomId] = useState(null);
//   const [status, setStatus] = useState("Connecting...");
//   const [history, setHistory] = useState([]);
//   const [gameOver, setGameOver] = useState(null); // 🆕 to show winner/loser message

//   // 🔁 Update board display based on FEN
//   const updateBoard = (fen) => {
//     const tempChess = new Chess(fen);
//     let boardArr = tempChess.board();

//     // Flip board for black player
//     if (color === "b") {
//       boardArr = boardArr.slice().reverse().map((row) => row.slice().reverse());
//     }

//     const squares = boardArr.map((row) =>
//       row.map((sq) => (sq ? { piece: sq.type, color: sq.color } : null))
//     );

//     setBoard(squares);
//   };

//   // ⚡ Initialize Socket Connection
//   useEffect(() => {
//     socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000");

//     socket.on("connect", () => setStatus("Connected to server"));

//     socket.emit("auto_join", (data) => {
//       setRoomId(data.roomId);
//       setColor(data.color);
//       setStatus(`Joined room as ${data.color === "w" ? "White" : "Black"}`);
//     });

//     socket.on("status", ({ msg }) => setStatus(msg));

//     socket.on("match_start", ({ msg }) => {
//       setStatus(msg);
//       chess.reset();
//       setGameOver(null);
//       updateBoard(chess.fen());
//       setHistory([]);
//     });

//     socket.on("opponent_move", ({ move }) => {
//       chess.move(move);
//       updateBoard(chess.fen());
//       setHistory([...chess.history({ verbose: true })]);
//       checkGameOver(chess);
//     });

//     return () => socket.disconnect();
//   }, [color]);

//   // ♟️ Handle Board Click
//   const handleClick = (row, col) => {
//     if (gameOver) return; // Stop moves if game is over

//     const square = board[row][col];

//     // 🟨 If piece already selected → try move OR change selection
//     if (selected) {
//       const from = selected;
//       const to = { row, col };

//       // If clicked again on same square, deselect
//       if (from.row === to.row && from.col === to.col) {
//         setSelected(null);
//         return;
//       }

//       // If clicked on another own piece → change selection
//       if (square && square.color === color) {
//         setSelected({ row, col });
//         return;
//       }

//       // Try to make the move
//       const move = chess.move({
//         from: squareName(from.row, from.col),
//         to: squareName(to.row, to.col),
//         promotion: "q",
//       });

//       if (move) {
//         updateBoard(chess.fen());
//         setHistory([...chess.history({ verbose: true })]);
//         setSelected(null);

//         // Notify opponent
//         socket.emit("make_move", {
//           roomId,
//           move: { from: move.from, to: move.to, promotion: move.promotion },
//         });

//         checkGameOver(chess);
//       } else {
//         // Invalid move, just deselect
//         setSelected(null);
//       }
//     } else {
//       // 🧠 No piece selected → only select if your own piece
//       if (square && square.color === color) setSelected({ row, col });
//     }
//   };

//   // 🔤 Convert row, col to square name
//   const squareName = (row, col) => {
//     const files = "abcdefgh";
//     const ranks = "87654321";
//     if (color === "b") {
//       // Flip coordinates back for chess.js
//       return files[7 - col] + ranks[7 - row];
//     }
//     return files[col] + ranks[row];
//   };

//   // 🧠 Check for Checkmate / Draw
//   const checkGameOver = (chessInstance) => {
//     if (chessInstance.isGameOver()) {
//       if (chessInstance.isCheckmate()) {
//         if (chessInstance.turn() !== color) {
//           setGameOver("win");
//           setStatus("🏆 Checkmate! You won!");
//         } else {
//           setGameOver("lose");
//           setStatus("💀 Checkmate! You lost!");
//         }
//       } else if (chessInstance.isDraw()) {
//         setGameOver("draw");
//         setStatus("🤝 It's a draw!");
//       }
//     }
//   };

//   // 🎨 Render Board
//   const renderBoard = () => (
//     <div
//       style={{
//         display: "grid",
//         gridTemplateColumns: "repeat(8, 60px)",
//         width: 8 * 60,
//         border: "3px solid #333",
//         boxShadow: "0 0 20px rgba(0,0,0,0.4)",
//         borderRadius: 8,
//         margin: "20px auto",
//       }}
//     >
//       {board.map((row, r) =>
//         row.map((sq, c) => {
//           const bgColor =
//             (r + c) % 2 === 0 ? SQUARE_COLORS[0] : SQUARE_COLORS[1];
//           const isSelected = selected && selected.row === r && selected.col === c;
//           return (
//             <div
//               key={`${r}-${c}`}
//               onClick={() => handleClick(r, c)}
//               style={{
//                 width: 60,
//                 height: 60,
//                 backgroundColor: isSelected ? "gold" : bgColor,
//                 display: "flex",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 fontSize: 36,
//                 cursor: gameOver ? "not-allowed" : "pointer",
//                 userSelect: "none",
//                 transition: "all 0.2s ease",
//               }}
//             >
//               {sq ? PIECES[sq.color][sq.piece] : ""}
//             </div>
//           );
//         })
//       )}
//     </div>
//   );

//   // 🏁 Winner / Loser Message
//   const renderGameOver = () => {
//     if (!gameOver) return null;
//     return (
//       <div
//         style={{
//           marginTop: 20,
//           fontSize: 24,
//           fontWeight: "bold",
//           padding: "12px 20px",
//           borderRadius: 8,
//           background: gameOver === "win" ? "#4caf50" : gameOver === "lose" ? "#f44336" : "#607d8b",
//           color: "white",
//           display: "inline-block",
//           boxShadow: "0 0 10px rgba(0,0,0,0.3)",
//           animation: "pop 0.5s ease",
//         }}
//       >
//         {gameOver === "win" && "🏆 Congratulations! You Won!"}
//         {gameOver === "lose" && "💀 Checkmate! You Lost!"}
//         {gameOver === "draw" && "🤝 It's a Draw!"}
//       </div>
//     );
//   };

//   return (
//     <div style={{ padding: 20, fontFamily: "system-ui, sans-serif", textAlign: "center" }}>
//       <h2>♟️ Real-Time Chess Arena</h2>
//       <p style={{ color: "blue" }}>{status}</p>

//       {renderBoard()}

//       {renderGameOver()}

//       {/* <h4 style={{ marginTop: 30 }}>Move History</h4>
//       <ol style={{ maxWidth: 300, margin: "10px auto", textAlign: "left" }}>
//         {Array.from({ length: Math.ceil(history.length / 2) }).map((_, idx) => {
//           const w = history[2 * idx];
//           const b = history[2 * idx + 1];
//           return (
//             <li key={idx}>
//               {w?.san} {b?.san || ""}
//             </li>
//           );
//         })}
//       </ol> */}
//       <h3 style={{ marginTop: 30, fontSize: 20, fontWeight: "600" }}>Move History</h3>

// <div
//   style={{
//     maxWidth: 340,
//     margin: "16px auto",
//     background: "#1e293b", // Slate background
//     borderRadius: 10,
//     boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
//     overflow: "hidden",
//     border: "1px solid #334155",
//   }}
// >
//   {/* Header */}
//   <div
//     style={{
//       display: "grid",
//       gridTemplateColumns: "60px 1fr 1fr",
//       background: "#0f172a",
//       color: "#e2e8f0",
//       fontWeight: "600",
//       fontSize: 14,
//       padding: "10px 0",
//       textAlign: "center",
//       borderBottom: "1px solid #334155",
//     }}
//   >
//     <div>#</div>
//     <div>White</div>
//     <div>Black</div>
//   </div>

//   {/* Moves */}
//   <div
//     style={{
//       maxHeight: 200,
//       overflowY: "auto",
//       scrollbarWidth: "thin",
//       scrollbarColor: "#94a3b8 #1e293b",
//     }}
//   >
//     {Array.from({ length: Math.ceil(history.length / 2) }).map((_, idx) => {
//       const w = history[2 * idx];
//       const b = history[2 * idx + 1];

//       return (
//         <div
//           key={idx}
//           style={{
//             display: "grid",
//             gridTemplateColumns: "60px 1fr 1fr",
//             textAlign: "center",
//             padding: "8px 0",
//             fontSize: 15,
//             background: idx % 2 === 0 ? "#334155" : "#1e293b",
//             color: "#f1f5f9",
//             transition: "background 0.2s",
//           }}
//         >
//           <div style={{ opacity: 0.7 }}>{idx + 1}.</div>
//           <div style={{ fontWeight: 500 }}>{w?.san || "-"}</div>
//           <div style={{ fontWeight: 500 }}>{b?.san || "-"}</div>
//         </div>
//       );
//     })}
//   </div>
// </div>


//       <style jsx>{`
//         @keyframes pop {
//           from {
//             transform: scale(0.8);
//             opacity: 0;
//           }
//           to {
//             transform: scale(1);
//             opacity: 1;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }

// "use client";

// import React, {
//   useEffect,
//   useState,
//   useRef,
// } from "react";

// import { Chess } from "chess.js";

// import { io } from "socket.io-client";

// const PIECES = {
//   w: {
//     p: "♙",
//     r: "♖",
//     n: "♘",
//     b: "♗",
//     q: "♕",
//     k: "♔",
//   },

//   b: {
//     p: "♟",
//     r: "♜",
//     n: "♞",
//     b: "♝",
//     q: "♛",
//     k: "♚",
//   },
// };

// let socket;

// export default function GamePage() {
//   const chessRef = useRef(
//     new Chess()
//   );

//   const [board, setBoard] =
//     useState([]);

//   const [selected, setSelected] =
//     useState(null);

//   const [roomId, setRoomId] =
//     useState(null);

//   const [color, setColor] =
//     useState(null);

//   const [turn, setTurn] =
//     useState("w");

//   const [history, setHistory] =
//     useState([]);

//   const [status, setStatus] =
//     useState("Connecting...");

//   // ================= UPDATE BOARD =================
//   const updateBoard = () => {
//     let boardData =
//       chessRef.current.board();

//     // flip for black
//     if (color === "b") {
//       boardData = boardData
//         .slice()
//         .reverse()
//         .map((r) =>
//           r.slice().reverse()
//         );
//     }

//     setBoard(boardData);
//   };

//   // ================= SOCKET =================
//   useEffect(() => {
//     const token =
//       localStorage.getItem("token");

//     socket = io(
//       "http://localhost:4000",
//       {
//         auth: {
//           token,
//         },
//       }
//     );

//     socket.on("connect", () => {
//       socket.emit(
//         "auto_join",
//         (data) => {
//           if (
//             data.status === "error"
//           ) {
//             alert(data.msg);
//             return;
//           }

//           setRoomId(data.roomId);
//           setColor(data.color);

//           chessRef.current =
//             new Chess(data.fen);

//           setTurn(data.turn);

//           setTimeout(() => {
//             updateBoard();
//           }, 100);
//         }
//       );
//     });

//     socket.on(
//       "match_start",
//       ({ fen, turn }) => {
//         chessRef.current =
//           new Chess(fen);

//         setTurn(turn);

//         updateBoard();

//         setStatus(
//           "Match Started"
//         );
//       }
//     );

//     socket.on(
//       "move_made",
//       ({
//         fen,
//         turn,
//         history,
//       }) => {
//         chessRef.current =
//           new Chess(fen);

//         setTurn(turn);

//         setHistory(history);

//         updateBoard();
//       }
//     );

//     socket.on(
//       "status",
//       ({ msg }) => {
//         setStatus(msg);
//       }
//     );

//     socket.on(
//       "game_over",
//       ({ result }) => {
//         setStatus(
//           "Game Over: " + result
//         );
//       }
//     );

//     return () => {
//       socket.disconnect();
//     };
//   }, [color]);

//   // ================= SQUARE NAME =================
//   const getSquareName = (
//     row,
//     col
//   ) => {
//     const files =
//       "abcdefgh";

//     const ranks =
//       "87654321";

//     if (color === "b") {
//       return (
//         files[7 - col] +
//         ranks[7 - row]
//       );
//     }

//     return (
//       files[col] +
//       ranks[row]
//     );
//   };

//   // ================= CLICK =================
//   const handleClick = (
//     row,
//     col
//   ) => {
//     if (turn !== color) {
//       setStatus(
//         "Wait for your turn"
//       );

//       return;
//     }

//     const square =
//       board[row][col];

//     if (selected) {
//       const move = {
//         from: getSquareName(
//           selected.row,
//           selected.col
//         ),

//         to: getSquareName(
//           row,
//           col
//         ),

//         promotion: "q",
//       };

//       socket.emit(
//         "make_move",
//         {
//           roomId,
//           move,
//         },
//         (res) => {
//           if (
//             res.status === "error"
//           ) {
//             alert(res.msg);
//           }
//         }
//       );

//       setSelected(null);

//     } else {
//       if (
//         square &&
//         square.color === color
//       ) {
//         setSelected({
//           row,
//           col,
//         });
//       }
//     }
//   };

//   // ================= RENDER =================
//   return (
//     <div
//       style={{
//         textAlign: "center",
//         padding: 20,
//       }}
//     >
//       <h1>♟ Chess Arena</h1>

//       <p>{status}</p>

//       <p>
//         You are:{" "}
//         {color === "w"
//           ? "White"
//           : "Black"}
//       </p>

//       <p>
//         Turn:{" "}
//         {turn === "w"
//           ? "White"
//           : "Black"}
//       </p>

//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns:
//             "repeat(8,70px)",
//           width: 560,
//           margin: "auto",
//         }}
//       >
//         {board.map((row, r) =>
//           row.map((sq, c) => (
//             <div
//               key={`${r}-${c}`}
//               onClick={() =>
//                 handleClick(r, c)
//               }
//               style={{
//                 width: 70,
//                 height: 70,
//                 display: "flex",
//                 justifyContent:
//                   "center",
//                 alignItems:
//                   "center",
//                 fontSize: 42,
//                 cursor: "pointer",
//                 background:
//                   (r + c) % 2 === 0
//                     ? "#f0d9b5"
//                     : "#b58863",
//               }}
//             >
//               {sq
//                 ? PIECES[sq.color][
//                     sq.type
//                   ]
//                 : ""}
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import React, {
  useEffect,
  useState,
  useRef,
} from "react";

import { Chess } from "chess.js";

import { io } from "socket.io-client";

const PIECES = {
  w: {
    p: "♙",
    r: "♖",
    n: "♘",
    b: "♗",
    q: "♕",
    k: "♔",
  },

  b: {
    p: "♟",
    r: "♜",
    n: "♞",
    b: "♝",
    q: "♛",
    k: "♚",
  },
};

let socket;

export default function GamePage() {

  const chessRef = useRef(
    new Chess()
  );

  const [board, setBoard] =
    useState([]);

  const [selected, setSelected] =
    useState(null);

  const [roomId, setRoomId] =
    useState(null);

  const [color, setColor] =
    useState(null);

  const [turn, setTurn] =
    useState("w");

  const [history, setHistory] =
    useState([]);

  const [status, setStatus] =
    useState("Connecting...");

  const [gameResult, setGameResult] =
    useState(null);

  // ================= UPDATE BOARD =================
  const updateBoard = () => {

    let boardData =
      chessRef.current.board();

    // FLIP FOR BLACK
    if (color === "b") {

      boardData = boardData
        .slice()
        .reverse()
        .map((r) =>
          r.slice().reverse()
        );
    }

    setBoard(boardData);
  };

  // ================= SOCKET =================
  useEffect(() => {

    const token =
      localStorage.getItem(
        "token"
      );

    socket = io(
      "http://localhost:4000",
      {
        auth: {
          token,
        },
      }
    );

    // ================= CONNECT =================
    socket.on(
      "connect",
      () => {

        socket.emit(
          "auto_join",
          (data) => {

            if (
              data.status ===
              "error"
            ) {

              alert(data.msg);

              return;
            }

            setRoomId(
              data.roomId
            );

            setColor(
              data.color
            );

            chessRef.current =
              new Chess(
                data.fen
              );

            setTurn(
              data.turn
            );

            setTimeout(() => {
              updateBoard();
            }, 100);
          }
        );
      }
    );

    // ================= MATCH START =================
    socket.on(
      "match_start",
      ({
        fen,
        turn,
      }) => {

        chessRef.current =
          new Chess(fen);

        setTurn(turn);

        setGameResult(null);

        setHistory([]);

        updateBoard();

        setStatus(
          "🔥 Match Started"
        );
      }
    );

    // ================= MOVE MADE =================
    socket.on(
      "move_made",
      ({
        fen,
        turn,
      }) => {

        chessRef.current =
          new Chess(fen);

        setTurn(turn);

        setHistory(
          chessRef.current.history({
            verbose: true,
          })
        );

        updateBoard();
      }
    );

    // ================= STATUS =================
    socket.on(
      "status",
      ({ msg }) => {

        setStatus(msg);
      }
    );

    // ================= GAME OVER =================
    socket.on(
      "game_over",
      ({
        winner,
      }) => {

        const user =
          JSON.parse(
            localStorage.getItem(
              "user"
            )
          );

        if (
          winner ===
          user?.username
        ) {

          setGameResult(
            "win"
          );

          setStatus(
            "🏆 You Won!"
          );

        } else {

          setGameResult(
            "lose"
          );

          setStatus(
            "💀 You Lost!"
          );
        }
      }
    );

    return () => {

      socket.disconnect();
    };

  }, [color]);

  // ================= GET SQUARE NAME =================
  const getSquareName = (
    row,
    col
  ) => {

    const files =
      "abcdefgh";

    const ranks =
      "87654321";

    if (color === "b") {

      return (
        files[7 - col] +
        ranks[7 - row]
      );
    }

    return (
      files[col] +
      ranks[row]
    );
  };

  // ================= HANDLE CLICK =================
  const handleClick = (
    row,
    col
  ) => {

    if (
      gameResult
    ) return;

    // NOT YOUR TURN
    if (
      turn !== color
    ) {

      setStatus(
        "⏳ Wait for your turn"
      );

      return;
    }

    const square =
      board[row][col];

    // ================= MOVE =================
    if (selected) {

      // SAME SQUARE CLICK
      if (
        selected.row === row &&
        selected.col === col
      ) {

        setSelected(
          null
        );

        return;
      }

      // CHANGE SELECTED PIECE
      if (
        square &&
        square.color === color
      ) {

        setSelected({
          row,
          col,
        });

        return;
      }

      const move = {

        from: getSquareName(
          selected.row,
          selected.col
        ),

        to: getSquareName(
          row,
          col
        ),

        promotion: "q",
      };

      socket.emit(
        "make_move",
        {
          roomId,
          move,
        },

        (res) => {

          if (
            res.status ===
            "error"
          ) {

            alert(
              res.msg
            );
          }
        }
      );

      setSelected(
        null
      );

    } else {

      // SELECT ONLY OWN PIECE
      if (
        square &&
        square.color === color
      ) {

        setSelected({
          row,
          col,
        });
      }
    }
  };

  // ================= GAME RESULT MODAL =================
  const renderGameResult =
    () => {

      if (
        !gameResult
      ) return null;

      return (

        <div
          style={{
            position:
              "fixed",

            top: 0,
            left: 0,

            width: "100%",
            height: "100%",

            background:
              "rgba(0,0,0,0.7)",

            display:
              "flex",

            justifyContent:
              "center",

            alignItems:
              "center",

            zIndex: 999,
          }}
        >

          <div
            style={{
              background:
                gameResult ===
                "win"
                  ? "linear-gradient(135deg,#16a34a,#22c55e)"
                  : "linear-gradient(135deg,#991b1b,#ef4444)",

              padding:
                "50px 70px",

              borderRadius: 24,

              textAlign:
                "center",

              color: "white",

              animation:
                "popup 0.4s ease",

              boxShadow:
                "0 0 40px rgba(0,0,0,0.5)",
            }}
          >

            <div
              style={{
                fontSize: 90,
                marginBottom: 20,
              }}
            >
              {gameResult ===
              "win"
                ? "🏆"
                : "💀"}
            </div>

            <h1
              style={{
                fontSize: 42,
                marginBottom: 10,
              }}
            >
              {gameResult ===
              "win"
                ? "Victory!"
                : "Defeat!"}
            </h1>

            <p
              style={{
                fontSize: 20,
              }}
            >
              {gameResult ===
              "win"
                ? "Congratulations Champion!"
                : "Better luck next game!"}
            </p>

          </div>

        </div>
      );
    };

  return (

    <div
      style={{
        minHeight:
          "100vh",

        background:
          "linear-gradient(to bottom right,#0f172a,#111827,#020617)",

        color: "white",

        padding: 20,

        fontFamily:
          "system-ui",

        textAlign:
          "center",
      }}
    >

      {/* TITLE */}
      <h1
        style={{
          fontSize: 42,
          marginBottom: 10,
          fontWeight: 800,
        }}
      >
        ♟ Chess Arena
      </h1>

      {/* STATUS */}
      <div
        style={{
          color: "#93c5fd",

          fontSize: 18,

          marginBottom: 20,

          fontWeight: 600,
        }}
      >
        {status}
      </div>

      {/* PLAYER INFO */}
      <div
        style={{
          display: "flex",

          justifyContent:
            "center",

          gap: 20,

          marginBottom: 25,

          flexWrap: "wrap",
        }}
      >

        <div
          style={{
            background:
              "#1e293b",

            padding:
              "12px 20px",

            borderRadius: 12,

            border:
              "1px solid #334155",
          }}
        >
          You Are:{" "}
          <b>
            {color === "w"
              ? "White"
              : "Black"}
          </b>
        </div>

        <div
          style={{
            background:
              "#1e293b",

            padding:
              "12px 20px",

            borderRadius: 12,

            border:
              "1px solid #334155",
          }}
        >
          Current Turn:{" "}
          <b>
            {turn === "w"
              ? "White"
              : "Black"}
          </b>
        </div>

      </div>

      {/* BOARD */}
      <div
        style={{
          display: "grid",

          gridTemplateColumns:
            "repeat(8,70px)",

          width: 560,

          margin:
            "0 auto",

          border:
            "5px solid #1e293b",

          borderRadius: 14,

          overflow:
            "hidden",

          boxShadow:
            "0 0 35px rgba(0,0,0,0.45)",
        }}
      >

        {board.map(
          (row, r) =>

            row.map(
              (sq, c) => {

                const isSelected =
                  selected &&
                  selected.row ===
                    r &&
                  selected.col ===
                    c;

                return (

                  <div
                    key={`${r}-${c}`}

                    onClick={() =>
                      handleClick(
                        r,
                        c
                      )
                    }

                    style={{
                      width: 70,
                      height: 70,

                      display:
                        "flex",

                      justifyContent:
                        "center",

                      alignItems:
                        "center",

                      fontSize: 42,

                      cursor:
                        "pointer",

                      userSelect:
                        "none",

                      transition:
                        "0.2s",

                      background:
                        isSelected
                          ? "#fde68a"
                          : (r + c) %
                              2 ===
                            0
                          ? "#f0d9b5"
                          : "#b58863",

                      boxShadow:
                        isSelected
                          ? "inset 0 0 0 4px #facc15"
                          : "none",
                    }}
                  >

                    {sq
                      ? PIECES[
                          sq.color
                        ][
                          sq.type
                        ]
                      : ""}

                  </div>
                );
              }
            )
        )}

      </div>

      {/* MOVE HISTORY */}
      <div
        style={{
          maxWidth: 420,

          margin:
            "35px auto",

          background:
            "#1e293b",

          borderRadius: 14,

          overflow:
            "hidden",

          border:
            "1px solid #334155",
        }}
      >

        <div
          style={{
            background:
              "#0f172a",

            padding: 14,

            fontWeight:
              "bold",

            fontSize: 18,
          }}
        >
          Move History
        </div>

        <div
          style={{
            maxHeight: 260,
            overflowY: "auto",
          }}
        >

          {Array.from({
            length:
              Math.ceil(
                history.length /
                  2
              ),
          }).map(
            (_, idx) => {

              const white =
                history[
                  idx * 2
                ];

              const black =
                history[
                  idx * 2 + 1
                ];

              return (

                <div
                  key={idx}

                  style={{
                    display:
                      "grid",

                    gridTemplateColumns:
                      "60px 1fr 1fr",

                    padding:
                      "12px",

                    background:
                      idx % 2 ===
                      0
                        ? "#334155"
                        : "#1e293b",
                  }}
                >

                  <div>
                    {idx + 1}.
                  </div>

                  <div>
                    {white
                      ? white.san
                      : "-"}

                  </div>

                  <div>
                    {black
                      ? black.san
                      : "-"}

                  </div>

                </div>
              );
            }
          )}

        </div>

      </div>

      {/* RESULT POPUP */}
      {renderGameResult()}

      <style jsx>{`
        @keyframes popup {

          from {
            transform: scale(0.7);
            opacity: 0;
          }

          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>

    </div>
  );
}

// "use client";

// import React, { useEffect, useState } from "react";
// import { Chess } from "chess.js";
// import { io } from "socket.io-client";
// import { useRouter } from "next/navigation";

// const PIECES = {
//   w: { p: "♙", r: "♖", n: "♘", b: "♗", q: "♕", k: "♔" },
//   b: { p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚" },
// };

// const SQUARE_COLORS = ["#f0d9b5", "#b58863"];

// let socket;

// export default function GamePage() {

//   const router = useRouter();

//   const [board, setBoard] = useState([]);
//   const [chess] = useState(new Chess());

//   const [selected, setSelected] = useState(null);

//   const [color, setColor] = useState(null);

//   const [roomId, setRoomId] = useState(null);

//   const [status, setStatus] =
//     useState("Connecting...");

//   const [history, setHistory] =
//     useState([]);

//   const [gameOver, setGameOver] =
//     useState(null);


//   // =========================
//   // CHECK AUTH
//   // =========================
//   useEffect(() => {

//     const token =
//       localStorage.getItem("token");

//     if (!token) {
//       router.push("/signin");
//     }

//   }, [router]);


//   // =========================
//   // LOGOUT
//   // =========================
//   const logout = () => {

//     localStorage.removeItem("token");

//     localStorage.removeItem("user");

//     router.push("/signin");
//   };


//   // =========================
//   // UPDATE BOARD
//   // =========================
//   const updateBoard = (fen) => {

//     const tempChess = new Chess(fen);

//     let boardArr = tempChess.board();

//     // Flip for black
//     if (color === "b") {

//       boardArr = boardArr
//         .slice()
//         .reverse()
//         .map((row) => row.slice().reverse());

//     }

//     const squares = boardArr.map((row) =>
//       row.map((sq) =>
//         sq
//           ? {
//               piece: sq.type,
//               color: sq.color,
//             }
//           : null
//       )
//     );

//     setBoard(squares);
//   };


//   // =========================
//   // SOCKET CONNECTION
//   // =========================
//   useEffect(() => {

//     const token =
//       localStorage.getItem("token");

//     socket = io(
//       process.env.NEXT_PUBLIC_SOCKET_URL ||
//         "http://localhost:4000",
//       {
//         auth: {
//           token,
//         },
//       }
//     );


//     // ================= CONNECT =================
//     socket.on("connect", () => {

//       setStatus("Connected to server");

//       socket.emit("auto_join", (data) => {

//         setRoomId(data.roomId);

//         setColor(data.color);

//         setStatus(
//           `Joined room as ${
//             data.color === "w"
//               ? "White"
//               : "Black"
//           }`
//         );
//       });
//     });


//     // ================= STATUS =================
//     socket.on("status", ({ msg }) => {
//       setStatus(msg);
//     });


//     // ================= MATCH START =================
//     socket.on("match_start", ({ msg }) => {

//       setStatus(msg);

//       chess.reset();

//       setGameOver(null);

//       updateBoard(chess.fen());

//       setHistory([]);
//     });


//     // ================= OPPONENT MOVE =================
//     socket.on("opponent_move", ({ move }) => {

//       chess.move(move);

//       updateBoard(chess.fen());

//       setHistory([
//         ...chess.history({
//           verbose: true,
//         }),
//       ]);

//       checkGameOver(chess);
//     });


//     // ================= SOCKET ERROR =================
//     socket.on("connect_error", (err) => {

//       console.log(err.message);

//       alert("Authentication failed");

//       router.push("/signin");
//     });


//     return () => {
//       socket.disconnect();
//     };

//   }, [color]);


//   // =========================
//   // HANDLE CLICK
//   // =========================
//   const handleClick = (row, col) => {

//     if (gameOver) return;

//     const square = board[row]?.[col];

//     // ================= MOVE =================
//     if (selected) {

//       const from = selected;

//       const to = { row, col };

//       // Deselect same square
//       if (
//         from.row === to.row &&
//         from.col === to.col
//       ) {
//         setSelected(null);
//         return;
//       }

//       // Change selection
//       if (
//         square &&
//         square.color === color
//       ) {
//         setSelected({ row, col });
//         return;
//       }

//       // Try move
//       const move = chess.move({
//         from: squareName(
//           from.row,
//           from.col
//         ),

//         to: squareName(
//           to.row,
//           to.col
//         ),

//         promotion: "q",
//       });

//       if (move) {

//         updateBoard(chess.fen());

//         setHistory([
//           ...chess.history({
//             verbose: true,
//           }),
//         ]);

//         setSelected(null);

//         socket.emit(
//           "make_move",
//           {
//             roomId,

//             move: {
//               from: move.from,
//               to: move.to,
//               promotion:
//                 move.promotion,
//             },
//           }
//         );

//         checkGameOver(chess);

//       } else {

//         setSelected(null);

//       }

//     } else {

//       // Select own piece
//       if (
//         square &&
//         square.color === color
//       ) {
//         setSelected({ row, col });
//       }

//     }
//   };


//   // =========================
//   // SQUARE NAME
//   // =========================
//   const squareName = (row, col) => {

//     const files = "abcdefgh";

//     const ranks = "87654321";

//     if (color === "b") {

//       return (
//         files[7 - col] +
//         ranks[7 - row]
//       );

//     }

//     return files[col] + ranks[row];
//   };


//   // =========================
//   // GAME OVER
//   // =========================
//   const checkGameOver = (
//     chessInstance
//   ) => {

//     if (chessInstance.isGameOver()) {

//       if (
//         chessInstance.isCheckmate()
//       ) {

//         if (
//           chessInstance.turn() !== color
//         ) {

//           setGameOver("win");

//           setStatus(
//             "🏆 Checkmate! You won!"
//           );

//         } else {

//           setGameOver("lose");

//           setStatus(
//             "💀 Checkmate! You lost!"
//           );
//         }

//       } else if (
//         chessInstance.isDraw()
//       ) {

//         setGameOver("draw");

//         setStatus(
//           "🤝 It's a draw!"
//         );
//       }
//     }
//   };


//   // =========================
//   // RENDER BOARD
//   // =========================
//   const renderBoard = () => (

//     <div
//       style={{
//         display: "grid",

//         gridTemplateColumns:
//           "repeat(8, 60px)",

//         width: 8 * 60,

//         border: "3px solid #333",

//         boxShadow:
//           "0 0 20px rgba(0,0,0,0.4)",

//         borderRadius: 8,

//         margin: "20px auto",
//       }}
//     >

//       {board.map((row, r) =>

//         row.map((sq, c) => {

//           const bgColor =
//             (r + c) % 2 === 0
//               ? SQUARE_COLORS[0]
//               : SQUARE_COLORS[1];

//           const isSelected =
//             selected &&
//             selected.row === r &&
//             selected.col === c;

//           return (

//             <div
//               key={`${r}-${c}`}

//               onClick={() =>
//                 handleClick(r, c)
//               }

//               style={{
//                 width: 60,
//                 height: 60,

//                 backgroundColor:
//                   isSelected
//                     ? "gold"
//                     : bgColor,

//                 display: "flex",

//                 justifyContent:
//                   "center",

//                 alignItems: "center",

//                 fontSize: 36,

//                 cursor: gameOver
//                   ? "not-allowed"
//                   : "pointer",

//                 userSelect: "none",

//                 transition:
//                   "all 0.2s ease",
//               }}
//             >

//               {sq
//                 ? PIECES[sq.color][
//                     sq.piece
//                   ]
//                 : ""}

//             </div>
//           );
//         })
//       )}

//     </div>
//   );


//   // =========================
//   // GAME OVER UI
//   // =========================
//   const renderGameOver = () => {

//     if (!gameOver) return null;

//     return (

//       <div
//         style={{
//           marginTop: 20,

//           fontSize: 24,

//           fontWeight: "bold",

//           padding: "12px 20px",

//           borderRadius: 8,

//           background:
//             gameOver === "win"
//               ? "#4caf50"
//               : gameOver === "lose"
//               ? "#f44336"
//               : "#607d8b",

//           color: "white",

//           display: "inline-block",

//           boxShadow:
//             "0 0 10px rgba(0,0,0,0.3)",

//           animation:
//             "pop 0.5s ease",
//         }}
//       >

//         {gameOver === "win" &&
//           "🏆 Congratulations! You Won!"}

//         {gameOver === "lose" &&
//           "💀 Checkmate! You Lost!"}

//         {gameOver === "draw" &&
//           "🤝 It's a Draw!"}

//       </div>
//     );
//   };


//   return (

//     <div
//       style={{
//         padding: 20,

//         fontFamily:
//           "system-ui, sans-serif",

//         textAlign: "center",
//       }}
//     >

//       <h2>
//         ♟️ Real-Time Chess Arena
//       </h2>


//       {/* ================= LOGOUT BUTTON ================= */}
//       <button
//         onClick={logout}
//         style={{
//           padding: "8px 16px",

//           cursor: "pointer",

//           marginBottom: 10,

//           borderRadius: 6,

//           border: "none",

//           background: "#ef4444",

//           color: "white",

//           fontWeight: "bold",
//         }}
//       >
//         Logout
//       </button>


//       <p style={{ color: "blue" }}>
//         {status}
//       </p>


//       {renderBoard()}


//       {renderGameOver()}


//       {/* ================= MOVE HISTORY ================= */}
//       <h3
//         style={{
//           marginTop: 30,

//           fontSize: 20,

//           fontWeight: "600",
//         }}
//       >
//         Move History
//       </h3>


//       <div
//         style={{
//           maxWidth: 340,

//           margin: "16px auto",

//           background: "#1e293b",

//           borderRadius: 10,

//           boxShadow:
//             "0 4px 12px rgba(0,0,0,0.2)",

//           overflow: "hidden",

//           border:
//             "1px solid #334155",
//         }}
//       >

//         {/* HEADER */}
//         <div
//           style={{
//             display: "grid",

//             gridTemplateColumns:
//               "60px 1fr 1fr",

//             background: "#0f172a",

//             color: "#e2e8f0",

//             fontWeight: "600",

//             fontSize: 14,

//             padding: "10px 0",

//             textAlign: "center",

//             borderBottom:
//               "1px solid #334155",
//           }}
//         >

//           <div>#</div>

//           <div>White</div>

//           <div>Black</div>

//         </div>


//         {/* MOVES */}
//         <div
//           style={{
//             maxHeight: 200,

//             overflowY: "auto",

//             scrollbarWidth: "thin",

//             scrollbarColor:
//               "#94a3b8 #1e293b",
//           }}
//         >

//           {Array.from({
//             length: Math.ceil(
//               history.length / 2
//             ),
//           }).map((_, idx) => {

//             const w =
//               history[2 * idx];

//             const b =
//               history[2 * idx + 1];

//             return (

//               <div
//                 key={idx}

//                 style={{
//                   display: "grid",

//                   gridTemplateColumns:
//                     "60px 1fr 1fr",

//                   textAlign: "center",

//                   padding: "8px 0",

//                   fontSize: 15,

//                   background:
//                     idx % 2 === 0
//                       ? "#334155"
//                       : "#1e293b",

//                   color: "#f1f5f9",

//                   transition:
//                     "background 0.2s",
//                 }}
//               >

//                 <div
//                   style={{
//                     opacity: 0.7,
//                   }}
//                 >
//                   {idx + 1}.
//                 </div>

//                 <div
//                   style={{
//                     fontWeight: 500,
//                   }}
//                 >
//                   {w?.san || "-"}
//                 </div>

//                 <div
//                   style={{
//                     fontWeight: 500,
//                   }}
//                 >
//                   {b?.san || "-"}
//                 </div>

//               </div>
//             );
//           })}
//         </div>
//       </div>


//       <style jsx>{`
//         @keyframes pop {
//           from {
//             transform: scale(0.8);
//             opacity: 0;
//           }

//           to {
//             transform: scale(1);
//             opacity: 1;
//           }
//         }
//       `}</style>

//     </div>
//   );
// }