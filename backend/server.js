import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import { Chess } from "chess.js";

import prisma from "./lib/prisma.js";
import authRoutes from "./routes/authRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// ================= ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/games", gameRoutes);

app.get("/", (req, res) => {
  res.send("Chess backend running");
});

// ================= SERVER =================
const server = http.createServer(app);

// ================= SOCKET =================
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// ================= JWT AUTH =================
io.use((socket, next) => {
  try {
    const token =
      socket.handshake.auth.token;

    if (!token) {
      return next(
        new Error("No token")
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    socket.user = decoded;

    next();

  } catch (err) {

    console.log(err);

    next(
      new Error("Invalid token")
    );
  }
});

// ================= ROOMS =================
const rooms = {};

// ================= CONNECTION =================
io.on("connection", (socket) => {

  console.log(
    "✅ Connected:",
    socket.user.username
  );

  // ================= AUTO JOIN =================
  socket.on(
    "auto_join",
    async (cb) => {

      try {

        let roomId =
          Object.keys(rooms).find(
            (id) =>
              rooms[id].players.length < 2
          );

        if (!roomId) {
          roomId =
            `room_${Date.now()}`;
        }

        if (!rooms[roomId]) {

          rooms[roomId] = {
            players: [],
            chess: new Chess(),
            gameId: null,
          };
        }

        const room =
          rooms[roomId];

        // prevent duplicate user
        const exists =
          room.players.find(
            (p) =>
              p.userId ===
              socket.user.userId
          );

        if (exists) {

          return cb({
            status: "error",
            msg:
              "Already joined",
          });
        }

        const color =
          room.players.length === 0
            ? "w"
            : "b";

        room.players.push({
          id: socket.id,
          userId:
            socket.user.userId,
          username:
            socket.user.username,
          color,
        });

        socket.join(roomId);

        io.to(roomId).emit(
          "status",
          {
            msg:
              `${socket.user.username} joined as ${
                color === "w"
                  ? "White"
                  : "Black"
              }`,
          }
        );

        // CREATE GAME
        if (
          room.players.length === 2 &&
          !room.gameId
        ) {

          const white =
            room.players.find(
              (p) =>
                p.color === "w"
            );

          const black =
            room.players.find(
              (p) =>
                p.color === "b"
            );

          const game =
            await prisma.game.create({
              data: {
                roomId,

                whiteId:
                  white.userId,

                blackId:
                  black.userId,

                fen:
                  room.chess.fen(),
              },
            });

          room.gameId =
            game.id;

          io.to(roomId).emit(
            "match_start",
            {
              fen:
                room.chess.fen(),

              turn:
                room.chess.turn(),
            }
          );
        }

        cb({
          status: "ok",

          roomId,

          color,

          fen:
            room.chess.fen(),

          turn:
            room.chess.turn(),
        });

      } catch (err) {

        console.log(err);

        cb({
          status: "error",
          msg:
            "Join failed",
        });
      }
    }
  );

  // ================= MAKE MOVE =================
  socket.on(
    "make_move",
    async (
      { roomId, move },
      cb
    ) => {

      try {

        const room =
          rooms[roomId];

        if (!room) {

          return cb({
            status: "error",
            msg:
              "Room not found",
          });
        }

        const player =
          room.players.find(
            (p) =>
              p.id === socket.id
          );

        if (!player) {

          return cb({
            status: "error",
            msg:
              "Player not found",
          });
        }

        // TURN VALIDATION
        if (
          room.chess.turn() !==
          player.color
        ) {

          return cb({
            status: "error",
            msg:
              "Not your turn",
          });
        }

        // MAKE MOVE
        const result =
          room.chess.move(move);

        if (!result) {

          return cb({
            status: "error",
            msg:
              "Illegal move",
          });
        }

        // SAVE MOVE
        if (room.gameId) {

          await prisma.move.create({
            data: {

              gameId:
                room.gameId,

              moveNumber:
                room.chess
                  .history().length,

              san:
                result.san,

              fromSq:
                result.from,

              toSq:
                result.to,

              fenAfter:
                room.chess.fen(),
            },
          });

          await prisma.game.update({
            where: {
              id:
                room.gameId,
            },

            data: {
              fen:
                room.chess.fen(),
            },
          });
        }

        // SEND MOVE
        io.to(roomId).emit(
          "move_made",
          {
            fen:
              room.chess.fen(),

            turn:
              room.chess.turn(),

            history:
              room.chess.history({
                verbose: true,
              }),
          }
        );

        // ================= GAME OVER =================
        if (
          room.chess.isGameOver()
        ) {

          let resultText =
            "DRAW";

          let winnerId =
            null;

          let winnerName =
            null;

          // CHECKMATE
          if (
            room.chess.isCheckmate()
          ) {

            resultText =
              "CHECKMATE";

            const loserColor =
              room.chess.turn();

            const winnerColor =
              loserColor === "w"
                ? "b"
                : "w";

            const winner =
              room.players.find(
                (p) =>
                  p.color ===
                  winnerColor
              );

            winnerId =
              winner.userId;

            winnerName =
              winner.username;
          }

          // UPDATE GAME
          if (room.gameId) {

            await prisma.game.update({
              where: {
                id:
                  room.gameId,
              },

              data: {

                status:
                  "FINISHED",

                result:
                  resultText,

                winnerId,

                endedAt:
                  new Date(),
              },
            });
          }

          // SEND GAME OVER
          io.to(roomId).emit(
            "game_over",
            {
              result:
                resultText,

              winner:
                winnerName,
            }
          );
        }

        cb({
          status: "ok",
        });

      } catch (err) {

        console.log(err);

        cb({
          status: "error",
          msg:
            "Move failed",
        });
      }
    }
  );

  // ================= DISCONNECT =================
  socket.on(
    "disconnect",
    () => {

      console.log(
        "❌ Disconnected:",
        socket.user.username
      );

      for (
        const roomId of
        Object.keys(rooms)
      ) {

        const room =
          rooms[roomId];

        const idx =
          room.players.findIndex(
            (p) =>
              p.id === socket.id
          );

        if (idx !== -1) {

          room.players.splice(
            idx,
            1
          );

          socket.to(roomId).emit(
            "status",
            {
              msg:
                socket.user.username +
                " disconnected",
            }
          );

          if (
            room.players.length === 0
          ) {

            delete rooms[roomId];
          }
        }
      }
    }
  );
});

const PORT =
  process.env.PORT || 4000;

server.listen(PORT, () => {

  console.log(
    `🚀 Backend running on ${PORT}`
  );
});