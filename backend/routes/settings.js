const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const Settings = require("../models/Settings");

const router = express.Router();

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

router.get("/schedule", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: "standup" });

    if (!settings) {
      settings = await Settings.create({ key: "standup" });
    }

    res.json({
      message: "Schedule fetched successfully",
      dailyTime: settings.dailyTime,
      days: settings.days,
      timezone: settings.timezone,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.put("/schedule", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { dailyTime, days } = req.body;

    if (!dailyTime || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(dailyTime)) {
      return res.status(400).json({
        message: "dailyTime must be in 24-hour HH:mm format, e.g. 09:00",
      });
    }

    if (days !== undefined) {
      if (typeof days !== "object" || days === null || Array.isArray(days)) {
        return res.status(400).json({
          message: "days must be an object of weekday booleans",
        });
      }

      const invalidKey = Object.keys(days).find(
        (key) => !DAY_KEYS.includes(key)
      );
      if (invalidKey) {
        return res.status(400).json({
          message: `Unknown day "${invalidKey}"`,
        });
      }

      const hasAtLeastOneDay = DAY_KEYS.some((key) => days[key]);
      if (!hasAtLeastOneDay) {
        return res.status(400).json({
          message: "Select at least one day to send the standup on",
        });
      }
    }

    const update = { dailyTime };
    if (days !== undefined) {
      DAY_KEYS.forEach((key) => {
        if (days[key] !== undefined) {
          update[`days.${key}`] = !!days[key];
        }
      });
    }

    const settings = await Settings.findOneAndUpdate(
      { key: "standup" },
      update,
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      message: "Schedule updated successfully",
      dailyTime: settings.dailyTime,
      days: settings.days,
      timezone: settings.timezone,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
