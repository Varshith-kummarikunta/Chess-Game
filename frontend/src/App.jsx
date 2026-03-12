import { Route, Routes } from "react-router-dom";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Lobby } from "./pages/Lobby";
import { Navbar } from "./components/Navbar";
import { ProtectedRoutes } from "./components/ProtectedRoutes";

function App() {
  return (
    <Routes>
      <Route element={<Navbar />}>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<ProtectedRoutes />}>
          <Route path="/lobby" element={<Lobby />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
