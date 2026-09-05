const express = require("express");
const connectDB = require("../config/db");
const runDailyStandup = require("../utils/runDailyStandup");

const router = express.Router();

router.get("/send-daily-standup", async (req, res) => {
  try {
    await connectDB();
    const message = await runDailyStandup();
    res.json({ message });
  } catch (error) {
    console.error("Scheduler error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;