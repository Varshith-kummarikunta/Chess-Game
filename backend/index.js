const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const { authRouter } = require("./routes/auth.router");
const { Server } = require("socket.io");
const http = require("http");
const jwt = require("jsonwebtoken");
const { User } = require("./models/user.model");
const { Chess } = require("chess.js");
const { Game } = require("./models/game.model");
const { leaderboardRouter } = require("./routes/leaderboard.routes");
const { verifyAuth } = require("./middlewares/verifyAuth");
const parser = require("./utilities/upload");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: [process.env.CLIENT_URL || "http://localhost:5173"],
  credentials: true,
  methods: ['POST', 'GET', 'DELETE', 'PUT', 'PATCH', 'OPTIONS']
}));
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/leaderboard", leaderboardRouter);
app.post("/api/v1/upload", verifyAuth, parser.single("file"), async (req, res) => {
  try {
    console.log(req.file.originalname);
    console.log(req.file.size);
    const url = req.file.path;
    const userId = req.user._id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    user.avatar = url;
    await user.save();
    
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.passwordHash;
    
    return res.status(200).json({ user: userWithoutPassword });
  } catch (err) {
  console.error("Upload Error:", err);
console.error("Message:", err.message);
console.error("Stack:", err.stack);
  return res.status(500).json({ message: err.message });
}
});

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL || "http://localhost:5173"],
    credentials: true,
    transports: ['polling'],
    methods: ['POST', 'GET', 'DELETE', 'PUT', 'PATCH', 'OPTIONS']
  }
});

io.use(async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie || "";

    const cookiesArray = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => {
        let idx = c.indexOf("=");

        return [c.slice(0, idx), decodeURIComponent(c.slice(idx + 1))];
      });

    const cookies = Object.fromEntries(cookiesArray);

    let { accessToken } = cookies;
    let { guestId, guestName } = socket.handshake.auth;

    if (accessToken) {

      const payload = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);

      const user = await User.findById(payload.sub).select("-passwordHash");
      if (!user) {
        return next(new Error("Unbale to find user"));
      }

      socket.user = user;
      return next();
    }

    if (guestId && guestName) {
      socket.user = {
        _id: guestId,
        name: guestName,
        role: "guest"
      }

      return next();
    }
  } catch (err) {
    return next(new Error("Unauthorized"));
  }
})

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

function getPubliClock(room) {
  return {
    ...room.clock,
    roomCode: room.roomCode
  };
}

function getGameOverPayload(room, result, reason) {
  const winnerColor = result === "white" || result === "black" ? result : null;
  const winnerId = winnerColor === "white" ? room.whiteId : winnerColor === "black" ? room.blackId : null;
  const winner = winnerId
    ? room.players.find((p) => p.userId.toString() === winnerId.toString())
    : null;

  return {
    result,
    reason,
    winnerColor,
    winnerId,
    winnerName: winner?.name || null,
  };
}

function getRoomCode(len = 6) {
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";

  for (let i = 0; i < len; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }

  return code;
}

function getExpectedScore(r1, r2) {
  return 1 / (1 + Math.pow(10, (r2 - r1) / 400));
}

const rooms = new Map();

async function saveGameDetailsToUser(room, result, reason) {
  const whiteId = room.whiteId;
  const blackId = room.blackId;
  const white = await User.findById(whiteId);
  const black = await User.findById(blackId);
  let k = 32;
  let eW = getExpectedScore(white.stats.rating, black.stats.rating);
  let eB = 1 - eW;

  let sW, sB;

  if (result === "white") {
    sW = 1;
    sB = 0;
  } else if (result === "black") {
    sW = 0;
    sB = 1;
  } else {
    sW = 0.5;
    sB = 0.5;
  }
  if (result === "draw") {
    white.stats.draws += 1;
    white.stats.gamesPlayed += 1;
    white.stats.currentStreak = 0;
    black.stats.draws += 1;
    black.stats.gamesPlayed += 1;
    black.stats.currentStreak = 0;
  } else if (result === "white") {
    white.stats.wins += 1;
    white.stats.gamesPlayed += 1;
    white.stats.currentStreak += 1;
    white.stats.bestStreak = Math.max(
      white.stats.bestStreak,
      white.stats.currentStreak,
    );
    black.stats.losses += 1;
    black.stats.gamesPlayed += 1;
    black.stats.currentStreak = 0;
  } else if (result === "black") {
    black.stats.wins += 1;
    black.stats.gamesPlayed += 1;
    black.stats.currentStreak += 1;
    black.stats.bestStreak = Math.max(
      black.stats.bestStreak,
      black.stats.currentStreak,
    );
    white.stats.losses += 1;
    white.stats.gamesPlayed += 1;
    white.stats.currentStreak = 0;
  }
  white.stats.rating = white.stats.rating + k * (sW - eW);
  black.stats.rating = black.stats.rating + k * (sB - eB);
  await white.save();
  await black.save();
}

io.on("connection", (socket) => {
  console.log(`A user connected on socket ${socket.id}`);

  // handler for the event -> "room:create"
  socket.on("room:create", (ack) => {
    try {
      let roomCode = getRoomCode();
      // Creating new room code until we get to a unique code
      // Find a better approach for scaling
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
        messages: [],
      };
      socket.join(roomCode);
      newRoom.players.push({
        name: socket.user.name,
        socketId: socket.id,
        userId: socket.user._id,
        role: socket.user.role
      });
      const baseMs = 5 * 60 * 1000;
      const incrementMs = 0;
      newRoom.timeControl = { baseMs, incrementMs };
      newRoom.clock = {
        whiteMs: baseMs,
        blackMs: baseMs,
        active: "w",
        lastSwtichAt: null,
        running: false
      }
      rooms.set(roomCode, newRoom);
      io.to(roomCode).emit("room:presence", getPublicRoom(newRoom));
      return ack?.({ ok: true, room: getPublicRoom(newRoom) });
    } catch (err) {
      return ack?.({ ok: false, message: err.message || "Create room failed" });
    }
  });

  socket.on("room:join", (roomCode, ack) => {
    try {
      console.log(`A user tried to join the room ${roomCode}`);
      const existingRoom = rooms.get(roomCode);
      if (!existingRoom) {
        return ack?.({ ok: false, message: "Room does not exist" });
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
          if (p.userId.toString() === socket.user._id.toString()) {
            return { ...p, socketId: socket.id };
          }
          return p;
        });
      }
      if (existingRoom.players.length === 2) {
        existingRoom.status = "ready";
        existingRoom.whiteId = existingRoom.players[0].userId;
        existingRoom.blackId = existingRoom.players[1].userId;
        existingRoom.clock.running = true;
        existingRoom.clock.lastSwtichAt = Date.now();
        existingRoom.clock.active = "w";
      }
      socket.join(roomCode);
      io.to(roomCode).emit("clock:update", getPubliClock(existingRoom));
      io.to(roomCode).emit("room:presence", getPublicRoom(existingRoom));
      return ack?.({ ok: true, room: getPublicRoom(existingRoom) });
    } catch (err) {
      return ack?.(console.log({
        ok: false,
        message: err.message || "Failed to join the room",
      }));
    }
  });

  // "room:leave" - event handler
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
      io.to(roomCode).emit("room:presence", getPublicRoom(room));
      if (room.players.length === 0) {
        rooms.delete(roomCode);
        return ack?.({ ok: true });
      }
      return ack?.({ ok: true, room: getPublicRoom(room) });
    } catch (err) {
      return ack?.({ ok: false, message: "Failed to leave room" });
    }
  });

  // "disconnect"

  // Game related events
  socket.on("game:state", (roomCode, ack) => {
    const room = rooms.get(roomCode);
    if (!room) return ack?.({ ok: false, message: "Room does not exist" });
    return ack?.({ ok: true, state: getPublicState(room), clock: getPubliClock(room) });
  });

  socket.on("chat:history", (roomCode, ack) => {
    try {
      const room = rooms.get(roomCode);
      if (!room) return ack?.({ ok: false, message: "Room does not exist" });

      return ack?.({ ok: true, messages: room.messages || [] });
    } catch (err) {
      return ack?.({ ok: false, message: err.message || "Failed to fetch chat" });
    }
  });

  socket.on("chat:send", (roomCode, text, ack) => {
    try {
      const room = rooms.get(roomCode);
      if (!room) return ack?.({ ok: false, message: "Room does not exist" });

      const isPlayer = room.players.some(
        (p) => p.userId.toString() === socket.user._id.toString(),
      );

      if (!isPlayer) {
        return ack?.({ ok: false, message: "Join the room to send messages" });
      }

      const messageText = String(text || "").trim();
      if (!messageText) {
        return ack?.({ ok: false, message: "Message cannot be empty" });
      }

      const message = {
        id: `${Date.now()}-${socket.id}`,
        userId: socket.user._id,
        name: socket.user.name,
        text: messageText,
        createdAt: Date.now(),
      };

      room.messages = [...(room.messages || []), message].slice(-100);
      io.to(roomCode).emit("chat:message", message);

      return ack?.({ ok: true, message });
    } catch (err) {
      return ack?.({ ok: false, message: err.message || "Failed to send message" });
    }
  });

  socket.on("game:move", async (roomCode, from, to, promotion, ack) => {
    try {
      const room = rooms.get(roomCode);
      if (!room) return ack?.({ ok: false, message: "Room does not exist" });
      if (!room.whiteId || !room.blackId) {
        return ack?.({ ok: false, message: "Wait for other player to join" });
      }
      let player = "none";
      if (socket.user._id.toString() === room.whiteId.toString()) {
        player = "w";
      } else if (socket.user._id.toString() === room.blackId.toString()) {
        player = "b";
      }
      if (player === "none") {
        return ack?.({ ok: false, message: "Invalid user" });
      }
      const turn = room.game.turn(); // 'w' or 'b'
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
      room.lastMove = { from, to, san: move.san };

      const now = Date.now();
      const elapsed = now - room.clock.lastSwtichAt;
      if (player === "w") {
        room.clock.whiteMs -= elapsed;
        room.clock.whiteMs += room.timeControl.incrementMs;
        room.clock.active = "b";
      } else {
        room.clock.blackMs -= elapsed;
        room.clock.blackMs += room.timeControl.incrementMs;
        room.clock.active = "w";
      }

      room.clock.whiteMs = Math.max(0, room.clock.whiteMs);
      room.clock.blackMs = Math.max(0, room.clock.blackMs);
      room.clock.lastSwtichAt = now;
      io.to(roomCode).emit("clock:update", getPubliClock(room));
      if (room.clock.whiteMs === 0 || room.clock.blackMs === 0) {
        room.clock.running = false;
        const result = room.clock.whiteMs === 0 ? "black" : "white";
        const reason = "timeout";
        io.to(roomCode).emit("game:over", getGameOverPayload(room, result, reason));

        const guest = room.players.some((p) => p.role === "guest");
        if (guest) {
          return;
        }

        const game = new Game({
          roomCode,
          whiteId: room.whiteId,
          blackId: room.blackId,
          reason,
          result,
          startedAt: new Date(room.createdAt),
          endedAt: Date.now(),
          duration: Date.now() - room.createdAt,
        });
        await game.save();
        await saveGameDetailsToUser(room, result, reason);
      }

      io.to(roomCode).emit("game:update", getPublicState(room));
      // check if the game is over or not
      if (room.game.isGameOver()) {
        let reason = "other";
        let result = "draw";
        if (room.game.isCheckmate()) {
          reason = "checkmate";
          result = turn === "w" ? "white" : "black";
        } else if (room.game.isDraw()) {
          result = "draw";
          reason = "draw";
        }
        io.to(roomCode).emit("game:over", getGameOverPayload(room, result, reason));

        if (socket.user.role === "guest") {
          return;
        }

        const game = new Game({
          roomCode,
          whiteId: room.whiteId,
          blackId: room.blackId,
          reason,
          result,
          startedAt: new Date(room.createdAt),
          endedAt: Date.now(),
          duration: Date.now() - room.createdAt,
        });
        await game.save();
        await saveGameDetailsToUser(room, result, reason);
      }
    } catch (err) {
      return ack?.({
        ok: false,
        message: err.message || "Unable to make the move",
      });
    }
  });
});

mongoose.connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("DB Connected");
    server.listen(process.env.PORT, () => console.log("Server running at", process.env.PORT));
  })
  .catch((err) => console.log("Failed to connect DB", err))
