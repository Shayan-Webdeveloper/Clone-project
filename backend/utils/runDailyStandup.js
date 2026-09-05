const Settings = require("../models/Settings");
const SchedulerLog = require("../models/SchedulerLog");
const Question = require("../models/Question");
const User = require("../models/User");
const transporter = require("./sendEmail");

const getScheduleTime = (date, timezone) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, value]),
  );

  return {
    day: values.weekday.toLowerCase(),
    time: `${values.hour}:${values.minute}`,
    date: `${values.year}-${values.month}-${values.day}`,
  };
};

const runDailyStandup = async () => {
  const settings = await Settings.findOne({ key: "standup" });

  if (!settings) {
    return "Standup schedule not configured";
  }

  const scheduleTime = getScheduleTime(new Date(), settings.timezone);

  if (!settings.days[scheduleTime.day]) {
    return `Standup is not scheduled for ${scheduleTime.day}`;
  }

  const [scheduledHour, scheduledMinute] = settings.dailyTime
    .split(":")
    .map(Number);
  const [currentHour, currentMinute] = scheduleTime.time
    .split(":")
    .map(Number);
  const scheduledTotalMinutes = scheduledHour * 60 + scheduledMinute;
  const currentTotalMinutes = currentHour * 60 + currentMinute;

  if (
    currentTotalMinutes < scheduledTotalMinutes ||
    currentTotalMinutes > scheduledTotalMinutes + 5
  ) {
    return "Not the scheduled time yet";
  }

  const existingLog = await SchedulerLog.findOne({ date: scheduleTime.date });

  if (existingLog) {
    return "Today's standup emails have already been sent";
  }

  const questions = await Question.find({ isActive: true }).sort({
    createdAt: 1,
  });

  if (questions.length === 0) {
    return "No active questions found";
  }

  const employees = await User.find({
    role: "employee",
    isActive: true,
  });
  const questionList = questions
    .map((question, index) => `${index + 1}. ${question.questionText}`)
    .join("\n");

  for (const employee of employees) {
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

  await SchedulerLog.create({ date: scheduleTime.date });
  return `Standup emails sent to ${employees.length} employees`;
};

module.exports = runDailyStandup;