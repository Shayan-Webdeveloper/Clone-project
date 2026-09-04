const TeamMember = require("../models/TeamMember");
const Employee = require("../models/Employee");   
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const express = require("express");
const crypto = require("crypto");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const globalAdminMiddleware = require("../middleware/globalAdminMiddleware");
const Invitation = require("../models/Invitation");
const router = express.Router();
const transporter = require("../utils/sendEmail");

router.post(
  "/:teamId",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    const token = crypto.randomBytes(32).toString("hex");
const { email } = req.body;
const { teamId } = req.params;

const invitation = await Invitation.create({
  email,
  token,
  team: teamId,
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  invitedBy: req.user.id,
});
await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: email,
  subject: "You're invited to join Team Pulse",
  text: `You have been invited to join Team Pulse. Click this link to accept your invitation: http://localhost:5173/accept-invitation?token=${token}`,
});
    res.status(201).json({
  message: "Invitation created successfully",
  invitation,
  invitationLink: `http://localhost:5173/accept-invitation?token=${token}`,
});
  }
);
router.get("/verify/:token", async (req, res) => {
  const { token } = req.params;

  const invitation = await Invitation.findOne({ token });

  if (!invitation) {
    return res.status(404).json({
      message: "Invalid invitation",
    });
  }

  if (invitation.status !== "pending") {
    return res.status(400).json({
      message: "Invitation is no longer valid",
    });
  }

  if (invitation.expiresAt < new Date()) {
    return res.status(400).json({
      message: "Invitation has expired",
    });
  }

  res.json({
    message: "Invitation is valid",
    email: invitation.email,
  });
});
router.post("/accept", async (req, res) => {
  try {
    const { name, token, password } = req.body;

    if (!name || !token || !password) {
      return res.status(400).json({
        message: "Name, token and password are required",
      });
    }

    const invitation = await Invitation.findOne({ token });

    if (!invitation) {
      return res.status(404).json({
        message: "Invalid invitation",
      });
    }

    if (invitation.status !== "pending") {
      return res.status(400).json({
        message: "Invitation is no longer valid",
      });
    }

    if (invitation.expiresAt < new Date()) {
      return res.status(400).json({
        message: "Invitation has expired",
      });
    }
const hashedPassword = await bcrypt.hash(password, 10);
const user = await User.create({
  name,
  email: invitation.email,
  password: hashedPassword,
  role: "employee",
});
await Employee.create({
  user: user._id,
  team: invitation.team,
});
await TeamMember.create({
  user: user._id,
  team: invitation.team,
  role: "employee",
  status: "active",
});
invitation.status = "accepted";
await invitation.save();
    res.json({
      message: "Invitation accepted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
router.get("/", authMiddleware, globalAdminMiddleware, async (req, res) => {
  try {
    const invitations = await Invitation.find().sort({ createdAt: -1 });

    res.json({
      message: "Invitations fetched successfully",
      invitations,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;