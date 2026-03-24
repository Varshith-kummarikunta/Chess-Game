import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoutes = () => {
  const user = useSelector((state) => state.auth.user);
  const isAuthChecked = useSelector((state) => state.auth.isAuthChecked)

  if (!isAuthChecked) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace={true} />;
  }

  return <Outlet />;
};
