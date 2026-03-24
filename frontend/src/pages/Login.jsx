import React from "react";
import { fetchMe, login } from "../slices/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");
    // dispatch(login({ email, password }));
    try {
      await dispatch(login({ email, password })).unwrap();
      await dispatch(fetchMe());
      // notification using notistack
      // redirect to the /lobby page
      navigate("/lobby");
    } catch (err) {
      // do something
      console.log(err);
    }
  }
    
  

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="p-10 border border-black rounded">
        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
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

          <button
            type="submit"
            className="bg-blue-500 text-white rounded p-2 hover:bg-blue-600"
            
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}