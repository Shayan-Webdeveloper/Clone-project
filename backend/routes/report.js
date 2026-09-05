const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const requireTeamRole = require("../middleware/teamRoleMiddleware");
const Report = require("../models/Report");
const Employee = require("../models/Employee");

const router = express.Router();

router.post("/:teamId", authMiddleware, async (req, res) => {
  try {
    const { answers } = req.body;
    const { teamId } = req.params;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        message: "Answers are required",
      });
    }

    const today = new Date().toISOString().split("T")[0];

    const existingReport = await Report.findOne({
      employee: req.user.id,
      team: teamId,
      date: today,
    });

    if (existingReport) {
      return res.status(409).json({
        message: "You have already submitted today's report",
      });
    }

    const report = await Report.create({
      employee: req.user.id,
      team: teamId,
      date: today,
      answers,
    });

    res.status(201).json({
      message: "Report submitted successfully",
      report,
    });
  } catch (error) {
    console.error("Report submission error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

router.get("/:teamId", authMiddleware, requireTeamRole("admin"), async (req, res) => {
  try {
    const { teamId } = req.params;

    const employees = await Employee.find({ team: teamId }).populate(
      "user",
      "name email"
    );

    const employeeIds = employees
      .filter((e) => e.user)
      .map((e) => e.user._id);

    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }

    const reports = await Report.find({
      employee: { $in: employeeIds },
      team: teamId,
      date: { $in: dates },
    })
      .populate("employee", "name email")
      .populate("answers.question", "questionText")
      .sort({ date: -1 });

    res.json({
      message: "Reports fetched successfully",
      dates,
      employees: employees
        .filter((e) => e.user)
        .map((e) => ({ id: e.user._id, name: e.user.name })),
      reports,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;