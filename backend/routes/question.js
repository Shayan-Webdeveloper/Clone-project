const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const globalAdminMiddleware = require("../middleware/globalAdminMiddleware");
const Question = require("../models/Question");

const router = express.Router();

router.get("/", authMiddleware, globalAdminMiddleware, async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    res.json({ message: "Questions fetched successfully", questions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: list every question (active and inactive)
router.get("/:teamId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });

    res.json({
      message: "Questions fetched successfully",
      questions,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Any authenticated user: the questions currently asked in the daily standup
router.get("/active", authMiddleware, async (req, res) => {
  try {
    const questions = await Question.find({ isActive: true }).sort({
      createdAt: 1,
    });

    res.json({
      message: "Active questions fetched successfully",
      questions,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.post("/:teamId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { questionText } = req.body;

    if (!questionText || !questionText.trim()) {
      return res.status(400).json({
        message: "Question text is required",
      });
    }

    const question = await Question.create({ questionText });

    res.status(201).json({
      message: "Question created successfully",
      question,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.put("/:teamId/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { questionText, isActive } = req.body;

    const update = {};
    if (questionText !== undefined) update.questionText = questionText;
    if (isActive !== undefined) update.isActive = isActive;

    const question = await Question.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    res.json({
      message: "Question updated successfully",
      question,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.delete("/:teamId/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    res.json({
      message: "Question deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
