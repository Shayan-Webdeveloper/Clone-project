const Settings = require("../models/Settings");
const SchedulerLog = require("../models/SchedulerLog");
const Question = require("../models/Question");
const Team = require("../models/Team");
const Employee = require("../models/Employee");
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

  const teams = await Team.find({ isActive: true });
  let totalSent = 0;

  for (const team of teams) {
    const questions = await Question.find({
      team: team._id,
      isActive: true,
    }).sort({ createdAt: 1 });

    if (questions.length === 0) continue;

    const employees = await Employee.find({ team: team._id }).populate(
      "user"
    );
    const activeEmployees = employees.filter((e) => e.user?.isActive);

    if (activeEmployees.length === 0) continue;

    const questionList = questions
      .map((question, index) => `${index + 1}. ${question.questionText}`)
      .join("\n");

    console.log("DEBUG FRONTEND_URL raw value:", JSON.stringify(process.env.FRONTEND_URL));
    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

    for (const employee of activeEmployees) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: employee.user.email,
        subject: `Daily Standup Report — ${team.name}`,
        text: `Hi ${employee.user.name},

Please complete your daily standup report for ${team.name}.

Today's questions:

${questionList}

Submit your report here:
${frontendUrl}/report

Regards,
Team Pulse`,
      });
      totalSent++;
    }
  }

  await SchedulerLog.create({ date: scheduleTime.date });
  return `Standup emails sent to ${totalSent} employees across ${teams.length} teams`;
};

module.exports = runDailyStandup;