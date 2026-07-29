import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoutes() {

    const user = useSelector(state => state.auth.user);
    const guest = JSON.parse(localStorage.getItem("guest"));
    const isAuthChecked = useSelector(state => state.auth.isAuthChecked);

    if(!isAuthChecked && !guest) {
        return <div>Loading...</div>
    }

    if(!user && !guest) {
        return <Navigate to="/login" replace={true} />
    }

    return <Outlet />
}

export default ProtectedRoutes;