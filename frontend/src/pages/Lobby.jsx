import React, { useState } from "react";
import { connectSocket, socket } from "../socket";
import { useNavigate } from "react-router-dom";
import { MdLogin } from "react-icons/md";
import { FaLightbulb } from "react-icons/fa";
import { toast } from "react-toastify";

function Lobby() {
    const [roomCode, setRoomCode] = useState("");
    const navigate = useNavigate();

    function createRoom() {
        connectSocket();
        socket.emit("room:create", (response) => {
            if (!response?.ok) return toast.error(response.message || "Failed to create room");
            navigate(`/rooms/${response.room.roomCode}`);
        });
    }

    function joinRoom() {
        connectSocket();
        socket.emit("room:join", roomCode, (response) => {
            if (!response?.ok)
                return toast.error(response.message || "Failed to join room");
            navigate(`/rooms/${response.room.roomCode}`);
        });
    }

    return (
    <div className="min-h-screen overflow-y-auto flex flex-col items-center justify-start py-10 px-4 sm:px-6">

            <div className="flex flex-col text-center gap-2 max-w-4xl">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                    Welcome to Chess Arena ♟️
                </h1>
                <p className="text-base sm:text-lg text-white/80">
                    Create a room or join an existing one to start playing
                </p>
            </div>

            <div className="flex flex-col items-center justify-center sm:flex-row items-center gap-6 sm:gap-8 mt-8 sm:mt-12 w-full max-w-5xl">

                <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.35)] rounded-2xl p-6 sm:p-8 w-full max-w-[380px] min-h-[320px] sm:h-[350px] flex flex-col items-center gap-5 transition-all duration-300 hover:scale-[1.03]">

                    <div className="bg-white/20 text-blue-400 h-10 w-10 p-8 text-3xl flex justify-center items-center rounded-full shadow-lg">
                        +
                    </div>

                    <div className="text-center">
                        <p className="text-2xl sm:text-3xl text-blue-400 font-bold">Create Room</p>
                        <p className="text-sm sm:text-base text-white/70 mt-2">
                            Start a new game and share the room code with your opponent.
                        </p>
                    </div>

                    <button
                        onClick={createRoom}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white p-3 rounded-xl shadow-lg transition-all cursor-pointer mt-5"
                    >
                        + Create Room
                    </button>
                </div>

                <p className="text-white/60 font-semibold text-lg sm:hidden">OR</p>
                <p className="text-white/60 font-semibold hidden sm:block">OR</p>

                <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.35)] rounded-2xl p-6 sm:p-8 w-full max-w-[380px] min-h-[320px] sm:h-[350px] flex flex-col items-center gap-4 transition-all duration-300 hover:scale-[1.03]">

                    <div className="bg-white/20 p-5 rounded-full shadow-lg text-green-400">
                        <MdLogin size={30} />
                    </div>

                    <div className="text-center">
                        <p className="text-2xl sm:text-3xl text-green-400 font-bold">Join Room</p>
                        <p className="text-sm sm:text-base text-white/70 mt-2">
                            Enter a room code to join existing game.
                        </p>
                    </div>

                    <input
                        type="text"
                        placeholder="# Enter Room Code"
                        className="w-full bg-white/20 border border-white/20 text-white px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-green-400 placeholder-white/60"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    />

                    <button
                        onClick={joinRoom}
                        className="w-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white p-3 rounded-xl shadow-lg flex justify-center gap-2 transition-all cursor-pointer"
                    >
                        <MdLogin size={22} /> Join Room
                    </button>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center w-full max-w-4xl mt-8 sm:mt-16 bg-white/10 backdrop-blur-xl border border-white/20 p-4 sm:p-6 rounded-2xl text-white shadow-xl">

                <p className="flex gap-1 text-lg sm:text-xl mb-4 ml-0 sm:ml-12 items-center">
                    <FaLightbulb /> How it Works ?
                </p>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-8">

                    <div className="flex items-center gap-2">
                        <div className="bg-blue-500 w-8 h-8 flex items-center justify-center rounded-full font-bold shrink-0">
                            1
                        </div>
                        <span className="text-sm sm:text-base">Create or join the room</span>
                    </div>

                    <p className="text-2xl sm:text-3xl text-white/30 hidden sm:block">|</p>

                    <div className="flex items-center gap-2">
                        <div className="bg-green-500 w-8 h-8 flex items-center justify-center rounded-full font-bold shrink-0">
                            2
                        </div>
                        <span className="text-sm sm:text-base">Wait for an opponent</span>
                    </div>

                    <p className="text-2xl sm:text-3xl text-white/30 hidden sm:block">|</p>

                    <div className="flex items-center gap-2">
                        <div className="bg-violet-500 w-8 h-8 flex items-center justify-center rounded-full font-bold shrink-0">
                            3
                        </div>
                        <span className="text-sm sm:text-base">Play chess in real time</span>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Lobby;