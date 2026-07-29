import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import { useSelector } from "react-redux";
import { TfiCup } from "react-icons/tfi";
import { IoShield } from "react-icons/io5";
import { FaGamepad } from "react-icons/fa";
import { FaFire } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import { toast } from "react-toastify";

function Leaderboard() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const user = useSelector(state => state.auth.user);

    async function loadData() {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get("/leaderboard");
            setData(res.data);
        } catch (err) {
            setError(err.message || "Failed to load leaderboard");
            toast.error(err.message || "Failed to load leaderboard");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <p>Loading leaderboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen text-white">
                <div className="text-center">
                    <p className="text-red-400 mb-4">Failed to load leaderboard</p>
                    <button 
                        onClick={loadData}
                        className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg cursor-pointer"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen text-white">
                <p>No leaderboard data available</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col mx-auto shadow-xl rounded-2xl p-4 sm:p-6 w-full max-w-6xl mt-8 sm:mt-10 max-h-[80vh]">
            <div className="flex flex-col sm:flex-row gap-4 items-center shrink-0">
                <p className="bg-blue-500/50 p-3 sm:p-4 rounded-xl backdrop-blur-sm"><TfiCup size={40} sm:size={50}/></p>
                <div className="text-center sm:text-left"> 
                    <p className="text-3xl sm:text-4xl text-white/90">Leaderboard</p>
                    <p className="text-base sm:text-xl text-white/90">Top players ranked by performance</p>
                </div>
            </div>
            <div className="rounded-xl overflow-hidden mt-6 flex-1 overflow-y-auto">
                <div className="overflow-x-auto">
                    <table className="text-center text-sm sm:text-lg w-full min-w-[600px]">
                        <thead>
                            <tr className="bg-blue-500/50">
                                <th className="p-2 sm:p-4 flex justify-center items-center">#</th>
                                <th className="p-2 sm:p-4">Player</th>
                                <th className="p-2 sm:p-4"><div className="flex justify-center items-center gap-2"><TfiCup />Wins</div></th>
                                <th className="p-2 sm:p-4"><div className="flex justify-center items-center gap-2"><IoShield />Losses</div></th>
                                <th className="p-2 sm:p-4"><div className="flex justify-center items-center gap-2"><FaGamepad/>Games</div></th>
                                <th className="p-2 sm:p-4"><div className="flex justify-center items-center gap-2"><FaFire />Streak</div></th>
                                <th className="p-2 sm:p-4 pr-2 sm:pr-6"><div className="flex justify-center items-center gap-2"><FaStar />Rating</div></th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(u => (
                                <tr key={u._id} className={`${user?._id?.toString() === u._id.toString() ? `bg-yellow-500/50` : "bg-white/20 backdrop-blur-lg"} hover:bg-white/30 transition-colors`}>
                                    <td className="p-2 sm:p-4 font-bold">{u.rank}</td>
                                    <td className="p-2 sm:p-4">{u.name}</td>
                                    <td className="p-2 sm:p-4">{u.stats?.wins || 0}</td>
                                    <td className="p-2 sm:p-4">{u.stats?.losses || 0}</td>
                                    <td className="p-2 sm:p-4">{u.stats?.gamesPlayed || 0}</td>
                                    <td className="p-2 sm:p-4">{u.stats?.bestStreak || 0}</td>
                                    <td className="p-2 sm:p-4 font-bold">{Math.floor(u.stats?.rating) || 1200}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Leaderboard;