import React from "react";
import { login } from "../slices/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");
    dispatch(login({ email, password }));
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="p-10 border border-black rounded">
        <form className="flex flex-col gap-10">
          <label className="flex flex-col">
            Email
            <input
              className="border rounded p-2"
              type="email"
              name="email"
              placeholder="enter email"
              autoComplete="email"
            />
          </label>

          <label className="flex flex-col">
            Password
            <input
              className="border rounded p-2"
              type="password"
              name="password"
              placeholder="enter password"
              autoComplete="current-password"
            />
          </label>

          <button className="bg-blue-500 text-white rounded p-2 hover:bg-blue-600">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};
