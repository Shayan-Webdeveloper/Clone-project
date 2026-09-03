          const express = require("express");
          const mongoose = require("mongoose");
          const Settings = require("../models/Settings");
          const SchedulerLog = require("../models/SchedulerLog");
          const Question = require("../models/Question");
          const User = require("../models/User");
          const connectDB = require("../config/db");
          const transporter = require("../utils/sendEmail");
          const router = express.Router();

          router.get("/send-daily-standup", async (req, res) => {
          try {
               await connectDB();
          

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

     const [scheduledHour, scheduledMinute] = settings.dailyTime
     .split(":")
     .map(Number);

     const [currentHour, currentMinute] = currentTime
     .split(":")
     .map(Number);

     const scheduledTotalMinutes = scheduledHour * 60 + scheduledMinute;
     const currentTotalMinutes = currentHour * 60 + currentMinute;

     if (
     currentTotalMinutes < scheduledTotalMinutes ||
     currentTotalMinutes > scheduledTotalMinutes + 5
     ) {
     return res.json({
     message: "Not the scheduled time yet",
     });
     }
     const todayDate = new Date().toISOString().split("T")[0];

     const existingLog = await SchedulerLog.findOne({
     date: todayDate,
     });

     if (existingLog) {
     return res.json({
     message: "Today's standup emails have already been sent",
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

Submit your report here:
${process.env.FRONTEND_URL}/report
                    
Regards,
Team Pulse`,
               });
          }
await SchedulerLog.create({
  date: todayDate,
});
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