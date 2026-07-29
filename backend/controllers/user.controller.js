const { User } = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const match = await bcrypt.compare(password, user.passwordHash);

        if (!match) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const accessToken = jwt.sign(
            { sub: user._id, role: user.role },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: "15m" },
        );

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 15 * 60 * 1000
        })

        const refreshToken = jwt.sign(
            { sub: user._id, role: user.role, type: "refresh" },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/api/v1/auth/refresh",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(200).json({ message: "OK" });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
}

const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Full name, email, and password are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ message: "Email already registered" });
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const user = new User({ name, email, passwordHash });
        const savedUser = await user.save();

        if (!savedUser) {
            return res.status(500).json({ message: "Unable to create account" });
        }
        
        const accessToken = jwt.sign(
            { sub: savedUser._id, role: savedUser.role },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: "15m" },
        );

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 15 * 60 * 1000
        })

        const refreshToken = jwt.sign(
            { sub: savedUser._id, role: savedUser.role, type: "refresh" },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/api/v1/auth/refresh",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(201).json({ message: "Account created successfully" });
    } catch (err) {
        console.error("Signup error:", err);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
}

const fetchMe = async (req, res) => {
    try {
        const user = req.user;

        res.status(200).json({ user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const logout = (req, res) => {
    try {
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "None",
        });

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/api/v1/auth/refresh",
            sameSite: "None",
        });

        return res.status(200).json({ message: "OK" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(400).json({ message: "Refresh token missing" });
        }

        const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        if (payload.type !== "refresh") {
            return res.status(400).json({ message: "Token type not refresh" });
        }

        const id = payload.sub;
        const user = await User.findById(id);

        if (!user) {
            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                path: "/api/v1/auth/refresh",
                sameSite: "None",
            });

            return res.status(400).json({ message: "User not found" });
        }

        const accessToken = jwt.sign(
            { sub: user._id, role: user.role },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: "15m" },
        );

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 15 * 60 * 1000
        });

        return res.status(200).json({ message: "OK" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = { login, signup, fetchMe, logout, refresh }

