import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../slices/authSlice";

function Navbar() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function handleLogout() {
    dispatch(logout());
    navigate("/login");
  }

  return (
    <>
      <div className="w-full px-6 py-3 flex justify-between items-center
        bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-md">

        <Link className="text-xl font-bold text-white tracking-wide" to="/lobby">
          ♟️ Chess Arena
        </Link>

        <div className="flex items-center gap-4">

          {user ? (
            <>
              <Link className="bg-white/20 px-3 py-1 rounded-full text-white text-sm cursor-pointer" to="/profile">
                👤 {user.name}
              </Link>

              <Link to="/leaderboard">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg shadow cursor-pointer">
                  🏆 Leaderboard
                </button>
              </Link>

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg shadow cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white hover:underline cursor-pointer">
                Login
              </Link>
              <Link to="/signup" className="text-white hover:underline cursor-pointer">
                Signup
              </Link>
            </>
          )}
        </div>
      </div>

      <div>
        <Outlet />
      </div>
    </>
  );
}

export default Navbar;