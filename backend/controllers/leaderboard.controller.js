const { User } = require("../models/user.model");

const leaderboard = async (req, res) => {
  try {
    const user = await User.find()
      .select("-passwordHash")
      .sort({ "stats.wins": -1 })
      .limit(50)
      .lean();

    const data = user.map((u, idx) => ({ ...u, rank: idx + 1 }));
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { leaderboard };
