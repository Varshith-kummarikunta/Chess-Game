import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { connectSocket, socket } from "../socket";
import { useSelector } from "react-redux";
import { Chessboard } from "@gustavotoyota/react-chessboard";

export const Room = () => {
  const { roomCode } = useParams();
  const [room, setRoom] = useState(null);
  const [color, setColor] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [fen, setFen] = useState(null);
  const [turn, setTurn] = useState(null);
  const isMyTurn =
    (turn === "w" && color === "white") || (turn === "b" && color === "black");

  console.log("turn:", turn);
  console.log("color:", color);
  console.log("isMyTurn:", isMyTurn);

  useEffect(() => {
    connectSocket();

    socket.emit("room:join", roomCode, (response) => {
      if (!response?.ok)
        return alert(response?.message || "Failed to join room");
      setRoom(response.room);
      setColor(
        user._id.toString() === response.room.whiteId?.toString()
          ? "white"
          : "black",
      );
    });

    socket.emit("game:state", roomCode, (response) => {
      if (!response?.ok)
        return alert(response?.message || "Failed  to fetch game");
      setFen(response?.state?.fen);
      setTurn(response?.state?.turn);
    });

    const onPresence = (data) => {
      console.log("room:presence", data);
      setRoom(data);
    };

    socket.on("room:presence", onPresence);
    const onUpdate = (state) => {
      setFen(state.fen);
      setTurn(state.turn);
    };

    socket.on("game:update", onUpdate);

    return () => {
      socket.off("room:presence", onPresence);
      socket.off("game:update", onUpdate);
    };
  }, [roomCode, user]);

  function leaveRoom() {
    connectSocket();
    socket.emit("room:leave", roomCode, (response) => {
      if (!response?.ok)
        return alert(response?.message || "Failed to leave room");

      setRoom(response?.room);
      navigate("/lobby");
    });
  }

  function onDrop(sourceSquare, targetSquare) {
  if (!fen) return false;

  socket.emit(
    "game:move",
    roomCode,
    sourceSquare,
    targetSquare,
    "q",
    (response) => {
      if (!response?.ok) {
        alert(response?.message || "Invalid move");
      }
    }
  );

  return true;
}

  function startGame() {
    connectSocket();
    socket.emit("game:start", roomCode, (res) => {
      if (!res?.ok) alert(res.message);
    });
  }

  return (
    <div>
      <h1 className="text-3xl">Room: {roomCode}</h1>
      <p>Status: {room?.status}</p>
      <ul>
        {room?.players.map((p) => (
          <li key={p.userId}>
            {p.userId === user?._id ? p.name + "(Me)" : p.name}
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        {room?.status === "ready" && (
          <button onClick={startGame} className="bg-green-400 p-2 rounded">
            Start Game
          </button>
        )}
        <button onClick={leaveRoom} className="bg-red-400 p-2 rounded">
          Leave
        </button>
      </div>
      {room?.status !== "waiting" && (
        <div className="w-[480px]">
          <p>{turn === "w" ? "White's Turn" : "Black's Turn"}</p>
          <div>
            <Chessboard position={fen || "start"} onPieceDrop={onDrop} />
          </div>
        </div>
      )}
    </div>
  );
};
