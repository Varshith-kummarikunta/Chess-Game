import { use, useEffect, useState } from "react";
import { api } from "../api/client";
import { useSelector } from "react-redux";

export const Leaderboard = () => {
  const [data, setData] = useState([]);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get("/leaderboard");
        console.log(res.data);
        setData(res.data);
      } catch (err) {
        console.log(err.message);
      }
    }
    loadData();
  }, []);

  return (
    <div>
      <h1 className="text-3xl">Leaderboard</h1>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Wins</th>
            <th>Losses</th>
            <th>Game Played</th>
            <th>Streak</th>
          </tr>
        </thead>
        <tbody>
          {data.map((u) => (
            <tr
              key={u._id}
              className={
                user._id.toString() === u._id.toString() ? "bg-yellow-20" : ""
              }
            >
              <td>{u.rank}</td>
              <td>{u.name}</td>
              <td>{u.stats?.wins ?? 0}</td>
              <td>{u.stats?.losses ?? 0}</td>
              <td>{u.stats?.gamesPlayed ?? 0}</td>
              <td>{u.stats?.currentStreak ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
