import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { fetchMe, login } from "../slices/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const email = formData.get("email");
        const password = formData.get("password");

        setLoading(true);

        try {
            await dispatch(login({ email, password })).unwrap();
            await dispatch(fetchMe()).unwrap();

            navigate("/lobby");
            toast.success("Login successful");
        } catch (err) {
            const errorMessage = err.message || "Login failed. Please try again.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex items-start justify-center min-h-screen px-4 py-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 sm:p-10 w-full max-w-[350px] mt-4 sm:mt-10">

                <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-white/80">♟️ Login</h1>

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="Email" 
                        required
                        className="p-2 sm:p-3 rounded bg-white/20 border border-white/30 outline-none text-white"
                    />
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="Password" 
                        required
                        className="p-2 sm:p-3 rounded bg-white/20 border border-white/30 outline-none text-white"
                    />
                    <button 
                        type="submit"
                        disabled={loading}
                        className="bg-blue-500 hover:bg-blue-600 p-2 sm:p-3 rounded font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Logging in...
                            </>
                        ) : (
                            "Login"
                        )}
                    </button>
                </form>

                <p className="text-center text-white/70 mt-6 text-sm sm:text-base">
                    Don't have an account?{" "}
                    <span
                        onClick={() => navigate("/signup")}
                        className="text-blue-400 hover:underline cursor-pointer"
                    >
                        Sign up
                    </span>
                </p>
            </div>
        </div>
    )
}

export default Login;