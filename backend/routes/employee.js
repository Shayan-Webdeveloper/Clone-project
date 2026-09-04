  const express = require("express");
  const authMiddleware = require("../middleware/authMiddleware");
  const requireTeamRole = require("../middleware/teamRoleMiddleware");
  const Employee = require("../models/Employee");

  const router = express.Router();
  router.post(
    "/:teamId",
    authMiddleware,
    requireTeamRole("admin"),
    async (req, res) => {
    try {
      const { department, position, phone, joiningDate } = req.body;
  const { teamId } = req.params;

  const existingEmployee = await Employee.findOne({
    team: teamId,
    user: req.user.id,
  });

      if (existingEmployee) {
        return res.status(409).json({
          message: "Employee profile already exists",
        });
      }

      const employee = await Employee.create({
    team: teamId,
    user: req.user.id,
    department,
    position,
    phone,
    joiningDate,
  });
      res.status(201).json({
        message: "Employee profile created successfully",
        employee,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  });
  router.put("/:teamId/me", authMiddleware, async (req, res) => {
    try {
      const { teamId } = req.params;
      const { department, position, phone, joiningDate } = req.body;

  const employee = await Employee.findOneAndUpdate(
    { team: teamId, user: req.user.id },
        {
          department,
          position,
          phone,
          joiningDate,
        },
        { new: true, runValidators: true }
      );

      if (!employee) {
        return res.status(404).json({
          message: "Employee profile not found",
        });
      }

      res.json({
        message: "Employee profile updated successfully",
        employee,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  });
  router.get("/:teamId/me", authMiddleware, async (req, res) => {
    try {
      const { teamId } = req.params;

  const employee = await Employee.findOne({
    team: teamId,
    user: req.user.id,
  }).populate(
        "user",
        "name email role"
      );

      if (!employee) {
        return res.status(404).json({
          message: "Employee profile not found",
        });
      }

      res.json({
        message: "Employee profile fetched successfully",
        employee,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  });

  router.get("/:teamId", authMiddleware, requireTeamRole("admin"), async (req, res) => {
    try {
      const { teamId } = req.params;

  const employees = await Employee.find({
    team: teamId,
  })
        .populate("user", "name email role isActive createdAt")
        .sort({ createdAt: -1 });

      res.json({
        message: "Employees fetched successfully",
        employees,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  });

  router.put(
    "/:teamId/:id/status",
    authMiddleware,
    requireTeamRole("admin"),
    async (req, res) => {
    try {
      const { isActive } = req.body;
  const { teamId } = req.params;

      const employee = await Employee.findOne({
    _id: req.params.id,
    team: teamId,
  }).populate("user");

      if (!employee) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }

      employee.user.isActive = isActive;
      await employee.user.save();

      res.json({
        message: "Employee status updated successfully",
        isActive: employee.user.isActive,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  });

  module.exports = router;