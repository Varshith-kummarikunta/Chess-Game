import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signup, fetchMe } from "../slices/authSlice";
export const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      await dispatch(signup({ name, email, password })).unwrap();
      await dispatch(fetchMe());

      navigate("/lobby");
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="p-10 border border-black rounded">
        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
          <label className="flex flex-col">
            Name
            <input
              className="border rounded p-2"
              type="text"
              name="name"
              placeholder="enter name"
              autoComplete="name"
            />
          </label>
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
              autoComplete="new-password"
            />
          </label>

          <button
            type="submit"
            className="bg-blue-500 text-white rounded p-2 hover:bg-blue-600"
          >
            sign up
          </button>
        </form>
      </div>
    </div>
  );
};
