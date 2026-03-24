const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const { authRouter } = require("./routes/auth.routes");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { User } = require("./models/user.model");
const { Chess } = require("chess.js");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  }),
);

app.use("/api/v1/auth", authRouter);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

io.use(async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie || "";
    const cookieArray = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => {
        let idx = c.indexOf("=");
        return [c.slice(0, idx), decodeURIComponent(c.slice(idx + 1))];
      });

    const cookies = Object.fromEntries(cookieArray);
    let { accessToken } = cookies;
    if (!accessToken) {
      return next(new Error("Missing accessToken"));
    }
    const payload = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) return next(new Error("User not found"));

    socket.user = user;
    next();
  } catch (err) {
    return next(new Error("Unauthorized"));
  }
});

function getPublicRoom(room) {
  return {
    roomCode: room.roomCode,
    players: room.players.map((p) => ({ userId: p.userId, name: p.name })),
    status: room.status,
    createdAt: room.createdAt,
    fen: room.fen,
    whiteId: room.whiteId,
    blackId: room.blackId,
    lastMove: room.lastMove,
  };
}

function getPublicState(room) {
  return {
    roomCode: room.roomCode,
    fen: room.game.fen(),
    turn: room.game.turn(),
    whiteId: room.whiteId,
    blackId: room.blackId,
    lastMove: room.lastMove,
  };
}

function getRoomCode(len = 6) {
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < len; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

const rooms = new Map();

io.on("connection", (socket) => {
  console.log(`a user connected on socket ${socket.id}`);

  socket.on("room:create", (ack) => {
    try {
      let roomCode = getRoomCode();
      while (rooms.has(roomCode)) {
        roomCode = getRoomCode();
      }
      const newRoom = {
        roomCode,
        players: [],
        status: "waiting",
        createdAt: Date.now(),
        game: new Chess(),
        fen: new Chess().fen(),
        whiteId: null,
        blackId: null,
        lastMove: null,
      };
      socket.join(roomCode);
      newRoom.players.push({
        name: socket.user.name,
        socketId: socket.id,
        userId: socket.user._id,
      });
      rooms.set(roomCode, newRoom);
      io.to(roomCode).emit("room:presence", getPublicRoom(newRoom));
      return ack?.({ ok: true, room: getPublicRoom(newRoom) });
    } catch (err) {
      return ack?.({ ok: false, message: err.message || "create room failed" });
    }
  });

  socket.on("room:join", (roomCode, ack) => {
    try {
      console.log(`user tried to join using ${roomCode}`);
      const existingRoom = rooms.get(roomCode);
      if (!existingRoom) {
        return ack?.({ ok: false, message: "room do not exist" });
      }

      const already = existingRoom.players.some(
        (p) => p.userId.toString() === socket.user._id.toString(),
      );
      if (!already) {
        if (existingRoom.players.length === 2) {
          return ack?.({ ok: false, message: "Room is full" });
        }
        existingRoom.players.push({
          userId: socket.user._id,
          name: socket.user.name,
          socketId: socket.id,
        });
      } else {
        existingRoom.players = existingRoom.players.map((p) => {
          if (p.userId.toString() == socket.user._id.toString()) {
            return { ...p, socketId: socket.id };
          }
          return p;
        });
      }
      // existingRoom.status =
      //   existingRoom.players.length === 2 ? "ready" : "waiting";
      if (existingRoom.players.length === 2) {
        existingRoom.status = "ready";
        existingRoom.whiteId = existingRoom.players[0].userId;
        existingRoom.blackId = existingRoom.players[1].userId;
      }
      socket.join(roomCode);
      io.to(roomCode).emit("room:presence", getPublicRoom(existingRoom));
      return ack?.({ ok: true, room: getPublicRoom(existingRoom) });
    } catch (err) {
      return ack?.({
        ok: false,
        message: err.message || "Failed to join the room",
      });
    }
  });

  socket.on("room:leave", (roomCode, ack) => {
    try {
      // Goal: remove the current user from the room
      // If room does not exist return with error: { ok: false, message: "Room does not exist" }
      const room = rooms.get(roomCode);
      if (!room) {
        return ack?.({ ok: false, message: "Room does not exist" });
      }
      // Remove the user by filtering out the player from the room.players
      room.players = room.players.filter(
        (p) => p.userId.toString() !== socket.user._id.toString(),
      );
      // Update the status of the room
      room.status = room.players.length === 2 ? "ready" : "waiting";
      // If room is empty rooms.delete(roomCode)
      socket.leave(roomCode);
      io.to(roomCode).emit("room:presence", get(room));
      if (room.players.length === 0) {
        rooms.delete(roomCode);
        return ack?.({ ok: true });
      }
      return ack?.({ ok: true, room: getPublicRoom(room) });
    } catch (err) {
      return ack?.({ ok: false, message: "Failed to leave room" });
    }
  });

  socket.on("game:move", (roomCode, from, to, promotion, ack) => {
    try {
      const room = rooms.get(roomCode);
      if (!room) return ack?.({ ok: false, message: "Room does not exist" });
      let player = "none";
      if (socket.user._id.toString() === room.whiteId.toString()) {
        player = "w";
      } else if (socket.user._id.toString() === room.blackId.toString()) {
        player = "b";
      }
      if (player === "none") {
        return ack?.({ ok: false, message: "Invalid user" });
      }
      const turn = room.game.turn();
      if (player !== turn) {
        return ack?.({ ok: false, message: "Not your turn" });
      }
      const move = room.game.move({
        from,
        to,
        promotion: "q",
      });
      if (!move) {
        return ack?.({ ok: false, message: "Invalid move" });
      }
      room.lastMove = { from, to };
      ack?.({ok:true});
      io.to(roomCode).emit("game:update", getPublicState(room));

      if (room.game.isGameOver()) {
        let result = "gameover";
        if (room.game.isCheckmate()) {
          result = turn === "w" ? "white" : "black";
        }
        if (room.game.isDraw()) {
          result = "draw";
        }
        io.to(roomCode).emit("game:over", result);
      }
    } catch (err) {
      return ack?.({
        ok: false,
        message: err.message || "Unable to make the move",
      });
    }
  });
});

server.listen(PORT, () => console.log("Server is listening on port", PORT));
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Successfully connected to DB"))
  .catch((err) => console.log("Failed to connect to DB", err.message));
