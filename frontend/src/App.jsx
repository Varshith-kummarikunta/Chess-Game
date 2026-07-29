import React, { useEffect } from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Lobby from "./pages/Lobby";
import Navbar from "./components/Navbar";
import ProtectedRoutes from "./components/ProtectedRoutes";
import { SnackbarProvider } from "notistack";
import { useDispatch } from "react-redux";
import { fetchMe } from "./slices/authSlice";
import Room from "./pages/Room";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Guest from "./pages/Guest";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return (
    <SnackbarProvider maxSnack={3}>
      <div
        className="min-h-screen w-screen relative bg-cover bg-center bg-fixed"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1606594914767-d6bfbde9a0e9?q=80&w=1332&auto=format&fit=crop')",
        }}
      >
        <div
          className="absolute inset-0
bg-gradient-to-br
from-black/85
via-black/65
to-amber-900/20
backdrop-blur-[2px]"
        ></div>
        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<Navbar />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/guest" element={<Guest />} />

              <Route element={<ProtectedRoutes />}>
                <Route path="/lobby" element={<Lobby />} />
                <Route path="rooms/:roomCode" element={<Room />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>
          </Routes>
        </div>

        <ToastContainer
          position="top-right"
          autoClose={2500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover
          theme="dark"
        />
      </div>
    </SnackbarProvider>
  );
}

export default App;
