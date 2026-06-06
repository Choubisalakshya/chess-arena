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