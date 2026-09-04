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
const { email, role } = req.body;
const { teamId } = req.params;

const invitation = await Invitation.create({
  email,
  token,
  team: teamId,
  role: role === "admin" ? "admin" : "employee",
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

    if (!token) {
      return res.status(400).json({
        message: "Token is required",
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

let user = await User.findOne({ email: invitation.email });

if (!user && (!name || !password)) {
  return res.status(400).json({
    message: "Name and password are required for a new account",
  });
}

if (!user) {
  const hashedPassword = await bcrypt.hash(password, 10);
  user = await User.create({
    name,
    email: invitation.email,
    password: hashedPassword,
    role: "employee",
  });
}

const existingMembership = await TeamMember.findOne({
  user: user._id,
  team: invitation.team,
});

if (existingMembership) {
  return res.status(409).json({
    message: "You're already a member of this team",
  });
}

await Employee.create({
  user: user._id,
  team: invitation.team,
});
await TeamMember.create({
  user: user._id,
  team: invitation.team,
  role: invitation.role,
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
router.get("/:teamId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const invitations = await Invitation.find({ team: req.params.teamId }).sort({
      createdAt: -1,
    });

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