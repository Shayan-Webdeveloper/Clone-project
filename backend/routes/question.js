const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const Question = require("../models/Question");

const router = express.Router();

// Admin: list every question for this team (active and inactive)
router.get("/:teamId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const questions = await Question.find({ team: req.params.teamId }).sort({
      createdAt: -1,
    });

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

// Any authenticated user: the questions currently asked in the daily standup for this team
router.get("/active/:teamId", authMiddleware, async (req, res) => {
  try {
    const questions = await Question.find({
      team: req.params.teamId,
      isActive: true,
    }).sort({ createdAt: 1 });

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

    const question = await Question.create({
      team: req.params.teamId,
      questionText,
    });

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

    const question = await Question.findOneAndUpdate(
      { _id: req.params.id, team: req.params.teamId },
      update,
      { new: true, runValidators: true }
    );

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
    const question = await Question.findOneAndDelete({
      _id: req.params.id,
      team: req.params.teamId,
    });

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