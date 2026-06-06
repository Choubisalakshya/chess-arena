"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

export default function HistoryPage() {

  const router = useRouter();

  const [games, setGames] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const token =
      localStorage.getItem("token");

    if (!token) {

      router.push("/signin");

      return;
    }

    fetch(
      "http://localhost:4000/api/games/history",
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    )
      .then(async (res) => {

        const data =
          await res.json();

        console.log(
          "HISTORY DATA:",
          data
        );

        // SAFE ARRAY CHECK
        if (
          Array.isArray(data)
        ) {

          setGames(data);

        } else {

          console.log(
            "API ERROR:",
            data
          );

          setGames([]);
        }

        setLoading(false);
      })

      .catch((err) => {

        console.log(err);

        setLoading(false);
      });

  }, []);


  return (

    <div
      style={{
        padding: 30,
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
      }}
    >

      <h1
        style={{
          fontSize: 36,
          marginBottom: 30,
          fontWeight: 800,
        }}
      >
        ♟ Match History
      </h1>

      {/* LOADING */}
      {loading && (

        <div>
          Loading history...
        </div>
      )}

      {/* NO GAMES */}
      {!loading &&
        games.length === 0 && (

          <div
            style={{
              background: "#1e293b",
              padding: 30,
              borderRadius: 12,
              textAlign: "center",
            }}
          >
            No matches found
          </div>
        )}

      {/* GAMES */}
      {games.map((game) => (

        <div
          key={game.id}

          style={{
            background: "#1e293b",

            padding: 20,

            borderRadius: 12,

            marginBottom: 20,

            border:
              "1px solid #334155",
          }}
        >

          <h2
            style={{
              marginBottom: 10,
            }}
          >
            {game.white?.username}
            {" vs "}
            {game.black?.username || "Waiting"}
          </h2>

          <p>
            <b>Result:</b>
            {" "}
            {game.result || "ONGOING"}
          </p>

          <p>
            <b>Winner:</b>
            {" "}
            {game.winner
              ?.username || "-"}
          </p>

          <p>
            <b>Total Moves:</b>
            {" "}
            {game.moves?.length || 0}
          </p>

          {/* REPLAY BUTTON */}
          <button

            onClick={() =>
              router.push(
                `/history/${game.id}`
              )
            }

            style={{
              marginTop: 20,

              padding:
                "12px 18px",

              borderRadius: 10,

              border: "none",

              cursor: "pointer",

              background:
                "#2563eb",

              color: "white",

              fontWeight: 700,

              fontSize: 15,
            }}
          >
            ▶ View Replay
          </button>

          {/* MOVES */}
          <div
            style={{
              marginTop: 18,

              display: "flex",

              flexWrap: "wrap",

              gap: 8,
            }}
          >

            {game.moves?.map(
              (move) => (

                <div
                  key={move.id}

                  style={{
                    background:
                      "#334155",

                    padding:
                      "6px 10px",

                    borderRadius: 6,

                    fontSize: 14,
                  }}
                >
                  {move.moveNumber}.
                  {" "}
                  {move.san}
                </div>
              )
            )}

          </div>

        </div>
      ))}

    </div>
  );
}