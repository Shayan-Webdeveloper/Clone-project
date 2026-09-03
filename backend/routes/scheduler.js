     const express = require("express");
     const mongoose = require("mongoose");
     const Settings = require("../models/Settings");
     const Question = require("../models/Question");
     const User = require("../models/User");
     const connectDB = require("../config/db");
     const transporter = require("../utils/sendEmail");
     const router = express.Router();

     router.get("/send-daily-standup", async (req, res) => {
     try {
          await connectDB();
     if (mongoose.connection.readyState !== 1) {
          return res.status(500).json({
          message: "Database is not connected",
          });
     }

     const settings = await Settings.findOne({ key: "standup" });

     if (!settings) {
          return res.status(404).json({
          message: "Standup schedule not configured",
          });
     }

     const now = new Date();

     const dayNames = [
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
     ];

     const today = dayNames[now.getDay()];

     if (!settings.days[today]) {
          return res.json({
          message: `Standup is not scheduled for ${today}`,
          });
     }

     const currentTime = now.toLocaleTimeString("en-GB", {
          timeZone: settings.timezone,
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
     });

     if (currentTime !== settings.dailyTime) {
          return res.json({
          message: "Not the scheduled time yet",
          });
     }

     const questions = await Question.find({ isActive: true }).sort({
          createdAt: 1,
     });

     if (questions.length === 0) {
          return res.json({
          message: "No active questions found",
          });
     }

     const employees = await User.find({
          role: "employee",
          isActive: true,
     });

     for (const employee of employees) {
          const questionList = questions
          .map((question, index) => `${index + 1}. ${question.questionText}`)
          .join("\n");

          await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: employee.email,
          subject: "Daily Standup Report",
          text: `Hi ${employee.name},

     Please complete your daily standup report.

     Today's questions:

     ${questionList}

     Please log in to Team Pulse to submit your answers.

     Regards,
     Team Pulse`,
          });
     }

     res.json({
          message: `Standup emails sent to ${employees.length} employees`,
     });
     } catch (error) {
     console.error("Scheduler error:", error);

     res.status(500).json({
          message: error.message,
     });
     }
     });

     module.exports = router;