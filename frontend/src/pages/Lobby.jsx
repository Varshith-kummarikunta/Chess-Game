import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { connectSocket, socket } from "../socket";

export const Lobby = () => {
  const [roomCode, setRoomCode] = useState("");
  const navigate = useNavigate();

  function createRoom() {
    const s = connectSocket(); // 🔥 use returned socket

    s.emit("room:create", (response) => {
      if (!response?.ok) return alert(response.message);
      navigate(`/rooms/${response.room.roomCode}`);
    });
  }

  function joinRoom() {
    if (!roomCode.trim()) {
      return alert("Enter room code");
    }

    const s = connectSocket();

    s.emit("room:join", roomCode, (response) => {
      if (!response?.ok)
        return alert(response.message || "failed to join room");
      navigate(`/rooms/${response.room.roomCode}`);
    });
  }
  
  const Click = () => {
    console.log("Create room clicked");
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <button onClick={createRoom} className="bg-blue-400 p-4 rounded">
        Create room
      </button>

      <p>OR</p>
      <div className="flex gap-2">
        <input
          className="p-2 border rounded"
          type="text"
          placeholder="Enter room code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
        />

        <button onClick={joinRoom} className="bg-blue-400 p-2 rounded">
          Join room
        </button>
      </div>
    </div>
  );
};
