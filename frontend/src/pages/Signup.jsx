import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMe, signup } from "../slices/authSlice";
import { toast } from "react-toastify";


function Signup() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const name = formData.get("name");
        const email = formData.get("email");
        const password = formData.get("password");
        const confirmPassword = formData.get("confirmPassword");

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            await dispatch(signup({ name, email, password })).unwrap();
            await dispatch(fetchMe()).unwrap();

            navigate("/lobby");
            toast.success("Account created successfully");
        } catch (err) {
            const errorMessage = err || "Signup failed. Please try again.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex items-start justify-center min-h-screen px-4 py-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 sm:p-10 w-full max-w-[350px] mt-4 sm:mt-10">

                <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">♟️ Signup</h1>

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        name="name" 
                        placeholder="Full Name" 
                        required
                        className="p-2 sm:p-3 rounded bg-white/20 border border-white/30 outline-none text-white"
                    />
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
                        minLength="6"
                        className="p-2 sm:p-3 rounded bg-white/20 border border-white/30 outline-none text-white"
                    />
                    <input 
                        type="password" 
                        name="confirmPassword" 
                        placeholder="Confirm Password" 
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
                                Signing up...
                            </>
                        ) : (
                            "Signup"
                        )}
                    </button>
                </form>

                <p className="text-center text-white/70 mt-6 text-sm sm:text-base">
                    Already have an account?{" "}
                    <span
                        onClick={() => navigate("/login")}
                        className="text-blue-400 hover:underline cursor-pointer"
                    >
                        Login
                    </span>
                </p>

            </div>
        </div>
    )
}

export default Signup;