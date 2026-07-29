import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { connectSocket, socket } from "../socket";
import { useSelector } from "react-redux";
import { Chessboard } from "@gustavotoyota/react-chessboard";
import { FaArrowLeftLong } from "react-icons/fa6";
import { IoPeopleCircleOutline } from "react-icons/io5";
import { IoExitOutline } from "react-icons/io5";
import { FaRegCopy } from "react-icons/fa6";
import { IoMdTime } from "react-icons/io";
import { MdPeople } from "react-icons/md";
import { IoPerson } from "react-icons/io5";
import { CiCircleAlert } from "react-icons/ci";
import { SlCalender } from "react-icons/sl";
import { FaChess } from "react-icons/fa";
import { FaRegLightbulb } from "react-icons/fa";
import { FaRegCircle } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { toast } from "react-toastify";

function Room() {
    const { roomCode } = useParams();

    const [room, setRoom] = useState(null);
    const [fen, setFen] = useState(null);
    const [turn, setTurn] = useState(null);
    const [color, setColor] = useState(null);
    const [whiteMs, setWhiteMs] = useState(null);
    const [blackMs, setBlackMs] = useState(null);
    const [showReady, setShowReady] = useState(false);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const [gameResult, setGameResult] = useState(null);
    const messagesEndRef = useRef(null);

    const guest = JSON.parse(localStorage.getItem("guest"));
    const user = useSelector((state) => state.auth.user) || { _id: guest?.id, name: guest?.name };
    const currentUserId = user?._id || guest?.id;
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;

        setLoading(true);
        setRoom(null);
        setFen(null);
        setTurn(null);
        setMessages([]);
        setText("");
        setGameResult(null);

        connectSocket();

        socket.emit("room:join", roomCode, (response) => {
            if (!isMounted) return;

            if (!response?.ok) {
                toast(response?.message || "Room not found");
                navigate("/lobby");
                return;
            }

            setRoom(response.room);

            socket.emit("game:state", roomCode, (res) => {
                if (!isMounted) return;

                if (!res?.ok) return;

                setFen(res.state.fen);
                setTurn(res.state.turn);
                setWhiteMs(res.clock?.whiteMs);
                setBlackMs(res.clock?.blackMs);

                setLoading(false);
            });
        });

        const onPresence = (data) => {
            setRoom(data);
        };

        socket.on("room:presence", onPresence);

        const onUpdate = (state) => {
            setFen(state.fen);
            setTurn(state.turn);
        };

        socket.on("game:update", onUpdate);

        const onEnd = (result) => {
            const normalizedResult = typeof result === "string" ? { result } : result;
            setGameResult(normalizedResult);
            toast.success(getResultTitle(normalizedResult), { autoClose: 5000 });
        };

        socket.on("game:over", onEnd);

        function onClock(c) {
            if (roomCode != c.roomCode) return;

            setWhiteMs(c.whiteMs);
            setBlackMs(c.blackMs);
        }

        socket.on("clock:update", onClock);

        socket.emit("chat:history", roomCode, (response) => {
            if (!response?.ok) {
                toast.error(response?.message || "Failed to fetch chat");
                return;
            }
            setMessages(response.messages);
        });

        const onMessage = (message) => {
            setMessages((prev) => [...prev, message]);
        };

        socket.on("chat:message", onMessage);

        return () => {
            socket.off("room:presence", onPresence);
            socket.off("game:update", onUpdate);
            socket.off("game:over", onEnd);
            socket.off("clock:update", onClock);
            socket.off("chat:message", onMessage);
            isMounted = false;
        };
    }, [roomCode]);

    function leaveRoom() {
        socket.emit("room:leave", roomCode, (response) => {
            if (!response?.ok)
                return toast.error(response?.message || "Failed to leave room");

            setRoom(response?.room);
            navigate("/lobby");
        });
    }

    function startGame() {
        socket.emit("game:start", roomCode, (response) => {
            if (!response?.ok)
                return toast.error(response?.message || "Failed to start game");
        });
    }

    function getMoveErrorMessage(message) {
        if (!message) return "Invalid move";
        
        const msg = String(message).toLowerCase();
        
        if (msg.includes("check") || msg.includes("king")) {
            return "Move not allowed. Your king would be in check.";
        }
        if (msg.includes("turn") || msg.includes("not your")) {
            return "It's not your turn.";
        }
        if (msg.includes("pawn") && (msg.includes("forward") || msg.includes("empty"))) {
            return "Invalid move. Pawns can only move forward to an empty square.";
        }
        if (msg.includes("piece") || msg.includes("cannot")) {
            return "This piece cannot move to the selected square.";
        }
        if (msg.includes("select") || msg.includes("own")) {
            return "Please select one of your own pieces.";
        }
        if (msg.includes("{") && msg.includes("}")) {
            return "Invalid move. Please try again.";
        }
        
        return "Invalid move. Please try again.";
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
                    const userMessage = getMoveErrorMessage(response?.message);
                    toast.error(userMessage);
                }
            },
        );

        return true;
    }

    function convertTime(ms) {
        if (!ms) return "--:--";
        const total = Math.floor(ms / 1000);
        const m = String(Math.floor(total / 60)).padStart(2, "0");
        const s = String(Math.floor(total % 60)).padStart(2, "0");
        return `${m}:${s}`;
    }

    async function copyText(text) {
        try {
            await navigator.clipboard.writeText(text);
            toast.success("Text copied to clipboard");
        } catch (err) {
            toast.error(err.message || "Failed to copy text");
        }
    }

    function onSend() {
        if (!text.trim()) return;

        socket.emit("chat:send", roomCode, text, (response) => {
            if (!response?.ok) {
                toast.error(response.message || "Failed to send message");
                return;
            }
            setText("");
        });
    }

    function getResultTitle(result) {
        if (!result) return "Game over";
        if (result.result === "draw") return "Game drawn";
        if (result.winnerName) return `${result.winnerName} won the game`;
        if (result.winnerColor) return `${result.winnerColor} won the game`;
        if (typeof result.result === "string") return `${result.result} won the game`;
        return "Game over";
    }

    function handleMessageKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    }

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (room?.status === "ready") {
            setShowReady(true);
            const timer = setTimeout(() => {
                setShowReady(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [room?.status]);

    useEffect(() => {
        let timer;

        if (room?.status === "active" || (fen && room?.status !== "waiting")) {
            timer = setInterval(() => {
                if (turn === "w") {
                    setWhiteMs((prev) => (prev > 0 ? prev - 1000 : 0));
                } else if (turn === "b") {
                    setBlackMs((prev) => (prev > 0 ? prev - 1000 : 0));
                }
            }, 1000);
        }

        return () => clearInterval(timer);
    }, [turn, room?.status, fen]);

    function gameStatus() {
        if (showReady) {
            return (
                <p className="text-green-900 w-full max-w-[300px] mb-4 flex gap-1 items-center justify-center bg-green-400 font-bold p-1 rounded-xl animate-pulse">
                    ✓ Ready to Play
                </p>
            );
        } else {
            return (
                <button className="text-white w-full max-w-[200px] mb-4 flex gap-1 items-center justify-center bg-red-500/80 font-bold p-1 rounded-xl hover:bg-red-600 cursor-pointer" onClick={leaveRoom}><IoExitOutline size={20} />Leave Room</button>
            );
        }
    }

    if (!room) {
        return (
            <div className="flex justify-center items-center h-screen text-white text-2xl">
                Loading room...
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center w-full min-h-[90vh] px-3 py-4 text-white sm:px-6">
            <div className="w-full max-w-7xl">
                <button className="flex gap-2 items-center text-white/80 hover:text-white cursor-pointer" onClick={leaveRoom}><FaArrowLeftLong />Back to lobby</button>


                {room?.status === "waiting" ?
                    <>
                        <div className="flex justify-between w-full">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <IoPeopleCircleOutline className="text-6xl sm:text-7xl lg:text-[90px]" />
                                <div className="mt-2">
                                    <h1 className={`${room?.status === "waiting" ? `text-2xl sm:text-3xl` : `text-xl sm:text-2xl`} font-bold mb-2`}>Room Code: {roomCode}</h1>
                                    {room?.status === "waiting" ? <p className="text-orange-900 w-full max-w-[300px] mb-4 flex gap-1 items-center justify-center bg-orange-300/90 font-bold p-1 rounded-xl"><IoMdTime size={30} /> Waiting for opponent</p> : gameStatus()}
                                </div>

                                {room?.status === "waiting" ? <p className="flex items-center gap-1 p-3 bg-white/10 rounded-xl cursor-pointer hover:bg-white/30 sm:ml-5" onClick={() => copyText(roomCode)}><FaRegCopy size={20} />Copy Code</p> : null}
                            </div>
                        </div>

                        <hr className="p-1 w-full text-white/50 rounded-xl" />

                        <div className="flex flex-col gap-4 lg:flex-row">
                            <div className="flex w-full flex-col gap-5 lg:w-full lg:max-w-[400px] lg:shrink-0">
                                <div className="border bg-white/10 backdrop-blur-sm border-white/50 rounded-xl w-full p-4 sm:p-6">
                                    <p className="flex items-center gap-1 text-xl font-bold m-2"><MdPeople size={30} />Players {room?.players.length === 1 ? "(1/2)" : "(2/2)"}</p>
                                    <ul className="space-y-2">
                                        {room?.players.map((p) => (
                                            <>
                                                <div className="bg-white/20 p-2 flex items-center text-white/80 gap-2 rounded-xl pl-5 flex">
                                                    <IoPerson size={40} />
                                                    <li key={p.userId}>
                                                        <div className="flex gap-1">
                                                            <p className="font-bold text-lg">{p.name}</p>
                                                            <p>{p.userId?.toString() === user?._id?.toString() ? "(You)" : ""}</p>
                                                        </div>
                                                        <p>color : {p.userId === room?.whiteId ? "White" : "Black"}</p>
                                                    </li>
                                                </div>

                                                {room?.players.length === 1 ?
                                                    <div className="bg-white/20 p-2 flex items-center text-white/80 gap-2 rounded-xl pl-5 flex border border-dashed border-gray-400">
                                                        <IoPerson size={40} />
                                                        <li key={p.userId}>
                                                            <p className="font-bold text-lg">wating for opponent...</p>
                                                            <p className="text-sm text-white/60">share the room code to invite the friend</p>
                                                        </li>
                                                    </div>
                                                    : null
                                                }
                                            </>
                                        ))}
                                    </ul>
                                </div>

                                <div className="border bg-white/10 backdrop-blur-sm border-white/50 rounded-xl w-full p-6">
                                    <p className="flex gap-2 items-center font-bold text-white/80 text-xl"><CiCircleAlert size={30} /> Room Info</p>
                                    <span className="flex justify-between items-center mt-2 text-lg text-white/80">
                                        <p className="pl-2"># Room Code</p>
                                        <p className="p-2 bg-white/20 rounded-xl text-sm pr-2 cursor-pointer hover:bg-white/30" onClick={() => copyText(roomCode)}>{roomCode}</p>
                                    </span>

                                    <hr className="mt-2 mb-2 w-full text-white/20 " />

                                    <span className="flex justify-between items-center mt-2 text-lg text-white/80">
                                        <p className="flex items-center gap-2"><IoMdTime size={25} />Time Control</p>
                                        <p className="text-sm pr-2">5:00 + 0</p>
                                    </span>

                                    <hr className="mt-3 mb-3 w-full text-white/20 " />

                                    <span className="flex justify-between items-center mt-2 text-lg text-white/80">
                                        <p className="pl-1 flex items-center gap-3"><SlCalender size={20} />Created</p>
                                        <p className="text-sm pr-2">Junt now</p>
                                    </span>
                                </div>
                            </div>

                            <div className="w-full flex flex-col gap-2 items-center justify-center bg-white/10 backdrop-blur-sm border border-white/50 rounded-xl p-4 text-center min-h-[320px]">
                                <FaChess className="text-6xl sm:text-8xl" />
                                <p className="text-2xl text-white sm:text-4xl">Wating for opponent</p>
                                <p className="text-base text-white/80 sm:text-lg">Share the room with your friend to start the game.</p>

                                <div className="flex items-center justify-center gap-5">
                                    <hr className="border w-[100px] border-white/50" />
                                    <p className="text-lg">Room Code</p>
                                    <hr className="border w-[100px] border-white/50" />
                                </div>

                                <p className="text-2xl p-2 bg-white/20 rounded-xl pl-10 pr-10 border border-white/50 cursor-pointer hover:bg-white/30" onClick={() => copyText(roomCode)}>{roomCode}</p>

                                <p className="bg-white/20 mt-4 p-4 sm:p-5 rounded-xl border border-white/50 flex items-center gap-2"><FaRegLightbulb size={20} /> Tip: Once another player joins, the game will automatically start and you'll be assigned a color.</p>
                            </div>
                        </div>
                    </>
                    :
                    <div className="flex flex-col gap-4 lg:gap-6 xl:grid xl:grid-cols-[280px_minmax(320px,600px)_minmax(280px,1fr)] xl:items-center">
                        <div className="flex flex-col gap-5 xl:order-1">
                            <div className="flex justify-between w-full">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center xl:flex-col xl:items-start">
                                    <IoPeopleCircleOutline className="text-6xl sm:text-7xl lg:text-[90px]" />
                                    <div className="mt-2">
                                        <h1 className={`${room?.status === "waiting" ? `text-2xl sm:text-3xl` : `text-xl sm:text-2xl`} font-bold mb-2`}>Room Code: {roomCode}</h1>
                                        {room?.status === "waiting" ? <p className="text-orange-900 w-full max-w-[300px] mb-4 flex gap-1 items-center justify-center bg-orange-300/90 font-bold p-1 rounded-xl"><IoMdTime size={30} /> Waiting for opponent</p> : gameStatus()}
                                    </div>

                                    {room?.status === "waiting" ? <p className="flex items-center gap-1 p-3 bg-white/10 rounded-xl cursor-pointer hover:bg-white/30 sm:ml-5 xl:ml-0" onClick={() => copyText(roomCode)}><FaRegCopy size={20} />Copy Code</p> : null}
                                </div>
                            </div>

                            <hr className="p-1 w-full text-white/50 rounded-xl" />

                            <div className="flex flex-col gap-5">
                                <div className="border bg-white/10 backdrop-blur-sm border-white/50 rounded-xl w-full p-4 sm:p-6">
                                    <p className="flex items-center gap-1 text-xl font-bold m-2"><MdPeople size={30} />Players {room?.players.length === 1 ? "(1/2)" : "(2/2)"}</p>
                                    <ul className="space-y-2">
                                        {room?.players.map((p) => (
                                            <>
                                                <div className="bg-white/20 p-2 flex items-center text-white/80 gap-2 rounded-xl pl-5 flex">
                                                    <IoPerson size={40} />
                                                    <li key={p.userId}>
                                                        <div className="flex gap-1">
                                                            <p className="font-bold text-lg">{p.name}</p>
                                                            <p>{p.userId?.toString() === user?._id?.toString() ? "(You)" : ""}</p>
                                                        </div>
                                                        <p>color : {p.userId === room?.whiteId ? "White" : "Black"}</p>
                                                    </li>
                                                </div>

                                                {room?.players.length === 1 ?
                                                    <div className="bg-white/20 p-2 flex items-center text-white/80 gap-2 rounded-xl pl-5 flex border border-dashed border-gray-400">
                                                        <IoPerson size={40} />
                                                        <li key={p.userId}>
                                                            <p className="font-bold text-lg">wating for opponent...</p>
                                                            <p className="text-sm text-white/60">share the room code to invite the friend</p>
                                                        </li>
                                                    </div>
                                                    : null
                                                }
                                            </>
                                        ))}
                                    </ul>
                                </div>

                                <div className="border bg-white/10 backdrop-blur-sm border-white/50 rounded-xl p-6 xl:mb-10">
                                    <p className="flex gap-2 items-center font-bold text-white/80 text-xl"><CiCircleAlert size={30} /> Room Info</p>
                                    <span className="flex justify-between items-center mt-2 text-lg text-white/80">
                                        <p className="pl-2"># Room Code</p>
                                        <p className="p-2 bg-white/20 rounded-xl text-sm pr-2 cursor-pointer hover:bg-white/30" onClick={() => copyText(roomCode)}>{roomCode}</p>
                                    </span>

                                    <hr className="mt-2 mb-2 w-full text-white/20 " />

                                    <span className="flex justify-between items-center mt-2 text-lg text-white/80">
                                        <p className="flex items-center gap-2"><IoMdTime size={25} />Time Control</p>
                                        <p className="text-sm pr-2">5:00 + 0</p>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full bg-white/10 p-2 rounded-xl shadow-xl border border-white/50 xl:order-2">
                            <div className="flex flex-col gap-3 justify-between p-2 sm:flex-row sm:items-center">
                                <div className={`flex justify-center items-center gap-1 font-bold text-white text-base ${turn === "w" ? "bg-white/10 p-2 rounded": "bg-black/40 p-2 rounded"}`}><FaRegCircle size={20} />Turn:{" "}
                                    {turn
                                        ? turn === "w"
                                            ? "White"
                                            : "Black"
                                        : "Loading..."}
                                </div>

                                <div className="flex flex-wrap gap-3 text-sm">
                                    <div className="flex gap-2 justify-center items-center bg-white/30 p-1 rounded shadow-xl pl-3 pr-3">
                                        <IoMdTime size={25} />
                                        <p className="flex items-center flex-col">
                                            White Time
                                            <span>{convertTime(whiteMs)}</span>
                                        </p>
                                    </div>

                                    <div className="flex gap-2 justify-center items-center bg-black/30 p-1 rounded shadow-xl pl-3 pr-3">
                                        <IoMdTime size={25} />
                                        <p className="flex items-center flex-col">
                                            Black Time
                                            <span>{convertTime(blackMs)}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mx-auto w-full max-w-[600px] aspect-square">
                                <Chessboard id="room-board" position={fen || "start"} onPieceDrop={onDrop} />
                            </div>

                        </div>

                        <div className="bg-white/10 backdrop-blur-lg p-4 flex flex-col items-center shadow-xl border border-white/50 rounded-xl w-full min-h-[420px] xl:h-[500px] xl:order-3">
                            <div className="flex flex-col justify-center items-center w-full">
                                <p className="text-lg font-bold text-white/85">Chat box</p>
                                <hr className="border w-full border-white/30 m-2" />
                            </div>
                            <div className="flex-1 w-full overflow-y-auto py-2 space-y-2">
                                {messages.length === 0 ? (
                                    <p className="text-center text-sm text-white/60 mt-8">No messages yet</p>
                                ) : (
                                    messages.map((message) => {
                                        const isMine = message.userId?.toString() === currentUserId?.toString();

                                        return (
                                            <div key={message.id || `${message.userId}-${message.createdAt}`} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                                                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${isMine ? "bg-blue-500/80 text-white" : "bg-white/20 text-white/90"}`}>
                                                    <p className="text-xs font-semibold text-white/70">{isMine ? "You" : message.name}</p>
                                                    <p className="break-words">{message.text}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef}></div>
                            </div>
                            <div className="flex gap-2 justify-center items-center w-full pt-3">

                                <input
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    onKeyDown={handleMessageKeyDown}
                                    className="border border-white/30 rounded-lg p-2 pl-3 bg-white/10 text-white outline-none placeholder-white/60 min-w-0 flex-1"
                                    placeholder="Send message..."
                                />
                                <button onClick={onSend} className="cursor-pointer bg-blue-500/80 p-1 pl-2 pr-2 rounded-lg hover:bg-blue-500 text-white/80"><IoSend size={25} /></button>
                            </div>
                        </div>
                    </div>
                }

                <div>
                    {gameResult && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
                            <div className="w-full max-w-md rounded-2xl border border-white/30 bg-slate-950/95 p-6 text-center shadow-2xl">
                                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">Game Over</p>
                                <h2 className="mt-3 text-3xl font-bold text-white">{getResultTitle(gameResult)}</h2>
                                <p className="mt-2 text-white/70">
                                    {gameResult.result === "draw"
                                        ? "Both players shared the point."
                                        : `${gameResult.winnerName || gameResult.winnerColor || "Winner"} won by ${gameResult.reason || "game result"}.`}
                                </p>
                                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                    <button onClick={leaveRoom} className="flex-1 rounded-xl bg-white/10 px-4 py-3 font-semibold text-white transition hover:bg-white/20 cursor-pointer">
                                        Exit Game
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>

    );
}

export default Room;
