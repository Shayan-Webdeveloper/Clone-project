const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");     
const Employee = require("../models/Employee");

const router = express.Router();
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { department, position, phone, joiningDate } = req.body;

    const existingEmployee = await Employee.findOne({
      user: req.user.id,
    });

    if (existingEmployee) {
      return res.status(409).json({
        message: "Employee profile already exists",
      });
    }

    const employee = await Employee.create({
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
router.put("/me", authMiddleware, async (req, res) => {
  try {
    const { department, position, phone, joiningDate } = req.body;

    const employee = await Employee.findOneAndUpdate(
      { user: req.user.id },
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
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user.id }).populate(
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

router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const employees = await Employee.find()
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

router.put("/:id/status", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { isActive } = req.body;

    const employee = await Employee.findById(req.params.id).populate("user");

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