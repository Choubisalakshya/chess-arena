import express from "express";

import jwt from "jsonwebtoken";

import prisma from "../lib/prisma.js";

const router = express.Router();


// ================= AUTH =================
const auth = (
  req,
  res,
  next
) => {

  try {

    const token =
      req.headers.authorization
        ?.split(" ")[1];

    if (!token) {

      return res.status(401).json({
        msg: "No token",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch {

    return res.status(401).json({
      msg: "Invalid token",
    });
  }
};


// ================= HISTORY =================
router.get(
  "/history",
  auth,
  async (req, res) => {

    try {

      const games =
        await prisma.game.findMany({

          where: {
            OR: [
              {
                whiteId:
                  req.user.userId,
              },

              {
                blackId:
                  req.user.userId,
              },
            ],
          },

          include: {

            white: true,

            black: true,

            winner: true,

            moves: {
              orderBy: {
                moveNumber: "asc",
              },
            },
          },

          orderBy: {
            createdAt: "desc",
          },
        });

      res.json(games);

    } catch (err) {

      console.log(err);

      res.status(500).json({
        msg: "Failed to fetch history",
      });
    }
  }
);


// ================= SINGLE GAME =================
router.get(
  "/:id",
  auth,
  async (req, res) => {

    try {

      const game =
        await prisma.game.findUnique({

          where: {
            id: Number(req.params.id),
          },

          include: {

            white: true,

            black: true,

            winner: true,

            moves: {
              orderBy: {
                moveNumber: "asc",
              },
            },
          },
        });

      if (!game) {

        return res.status(404).json({
          msg: "Game not found",
        });
      }

      res.json(game);

    } catch (err) {

      console.log(err);

      res.status(500).json({
        msg: "Failed to fetch game",
      });
    }
  }
);

export default router;