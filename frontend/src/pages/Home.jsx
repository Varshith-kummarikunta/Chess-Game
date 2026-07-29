import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen text-white overflow-hidden">

      <div className="absolute inset-0 bg-[url('/chess-bg.jpg')] bg-cover bg-center"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80 "></div>

      <div className="relative z-10 flex flex-col justify-center items-center text-center px-4 pt-20">

        <h1 className="text-6xl font-extrabold mb-6 leading-tight">
          Play Chess <br />
          <span className="text-blue-400">Like a Pro ♟️</span>
        </h1>

        <p className="text-lg text-white/80 mb-10 max-w-xl">
          Challenge players worldwide, track your ranking, and experience real-time multiplayer chess.
        </p>

        <div className="flex gap-6 mb-12">
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-500 hover:bg-blue-600 px-8 py-3 rounded-xl text-lg shadow-lg transition cursor-pointer"
          >
            Login to Play
          </button>

          <button
            onClick={() => navigate("/guest")}
            className="bg-white/10 hover:bg-white/20 px-8 py-3 rounded-xl text-lg backdrop-blur-lg transition cursor-pointer"
          >
            Play as Guest
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mt-10">

          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-semibold mb-2">⚡ Real-time Play</h3>
            <p className="text-white/70 text-sm">
              Play live games with instant moves and smooth gameplay.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-semibold mb-2">🏆 Leaderboard</h3>
            <p className="text-white/70 text-sm">
              Compete and climb ranks against global players.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-semibold mb-2">👥 Play with Friends</h3>
            <p className="text-white/70 text-sm">
              Create rooms and challenge your friends instantly.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Home;