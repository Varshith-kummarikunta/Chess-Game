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

  useEffect(() => {
    connectSocket();

    socket.emit("room:join", roomCode, (response) => {
      if (!response?.ok)
        return alert(response?.message || "Failed to join room");
      setRoom(response.room);
      setColor(
        user._id.toString() === room?.whileId?.toString() ? "White" : "Black",
      )
    });

    socket.emit("game:state", roomCode, (response) => {
      if (!response?.ok) return alert(response?.message || "Failed  to fetch game");
      setFen(response?.state?.fen);
      setTurn(response?.state?.turn)
    });

    const onPresence = (data) => {
      console.log("room:presence", data)
      setRoom(data);
    };

    socket.on("room:presence", onPresence);
    const onUpdate = (state) => {
      setFen(state.fen);
      setTurn(state.turn)
      
    }

    socket.on("game:update", onUpdate)

    return () => {
      socket.off("room:presence", onPresence);
      socket.off("game:update", onUpdate)
    };
  }, [roomCode]);

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
    connectSocket();
    if (!fen) return false;
    socket.emit("game:move", roomCode, sourceSquare, targetSquare, "q", (response) => {
      if(!response?.ok) return alert(response?.message || "invalid message")
    });
  return true;
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
          <button className="bg-green-400 p-2 rounded">Start Game</button>
        )}
        <button onClick={leaveRoom} className="bg-red-400 p-2 rounded">
          Leave
        </button>
      </div>
      {room?.status === "ready" && (
        <div className="w-[480px]">
          <div></div>
          <Chessboard fen={fen} onPieceDrop={onDrop} />
        </div>
      )}
    </div>
  );
};
