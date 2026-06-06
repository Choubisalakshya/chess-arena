"use client";

import {
  useEffect,
  useState,
} from "react";

import { Chess } from "chess.js";

import { useParams } from "next/navigation";

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

export default function ReplayPage() {

  const params = useParams();

  const [moves, setMoves] =
    useState([]);

  const [moveIndex, setMoveIndex] =
    useState(0);

  const [board, setBoard] =
    useState([]);

  const chess =
    new Chess();

  // ================= LOAD GAME =================
  useEffect(() => {

    const token =
      localStorage.getItem("token");

    fetch(
      `http://localhost:4000/api/games/${params.id}`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    )
      .then(res => res.json())
      .then(data => {

        setMoves(data.moves);

      });

  }, []);

  // ================= UPDATE BOARD =================
  useEffect(() => {

    chess.reset();

    for (
      let i = 0;
      i < moveIndex;
      i++
    ) {

      chess.move(moves[i].san);

    }

    setBoard(
      chess.board()
    );

  }, [moves, moveIndex]);

  return (

    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        padding: 30,
        textAlign: "center",
      }}
    >

      <h1
        style={{
          marginBottom: 30,
        }}
      >
        🎥 Match Replay
      </h1>

      {/* BOARD */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(8,70px)",
          width: 560,
          margin: "auto",
        }}
      >

        {board.map(
          (row, r) =>

            row.map(
              (sq, c) => (

                <div
                  key={`${r}-${c}`}

                  style={{
                    width: 70,
                    height: 70,

                    display: "flex",

                    justifyContent:
                      "center",

                    alignItems:
                      "center",

                    fontSize: 42,

                    background:
                      (r + c) % 2 === 0
                        ? "#f0d9b5"
                        : "#b58863",
                  }}
                >

                  {sq
                    ? PIECES[
                        sq.color
                      ][sq.type]
                    : ""}

                </div>
              )
            )
        )}

      </div>

      {/* CONTROLS */}
      <div
        style={{
          marginTop: 30,
          display: "flex",
          justifyContent: "center",
          gap: 20,
        }}
      >

        <button
          onClick={() =>
            setMoveIndex(
              Math.max(
                moveIndex - 1,
                0
              )
            )
          }
          style={{
            padding:
              "12px 20px",
            fontSize: 18,
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
          }}
        >
          ⬅ Previous
        </button>

        <button
          onClick={() =>
            setMoveIndex(
              Math.min(
                moveIndex + 1,
                moves.length
              )
            )
          }
          style={{
            padding:
              "12px 20px",
            fontSize: 18,
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
          }}
        >
          Next ➡
        </button>

      </div>

      <p
        style={{
          marginTop: 20,
          fontSize: 18,
        }}
      >
        Move:
        {" "}
        {moveIndex}
        {" / "}
        {moves.length}
      </p>

    </div>
  );
}