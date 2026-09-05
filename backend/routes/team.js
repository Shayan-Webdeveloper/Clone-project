  const express = require("express");
  const authMiddleware = require("../middleware/authMiddleware");
  const Team = require("../models/Team");
  const TeamMember = require("../models/TeamMember");
  const Employee = require("../models/Employee");
  const requireTeamRole = require("../middleware/teamRoleMiddleware");

  const router = express.Router();
  router.get("/", authMiddleware, async (req, res) => {
    try {
      const memberships = await TeamMember.find({
        user: req.user.id,
        status: "active",
      }).populate("team", "name");

      res.json({
        teams: memberships
          .filter((membership) => membership.team)
          .map((membership) => ({
            teamId: membership.team._id,
            name: membership.team.name,
            role: membership.role,
          })),
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  });
  router.post("/", authMiddleware, async (req, res) => {
    try {
      const { name } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          message: "Team name is required",
        });
      }

      const team = await Team.create({
        name: name.trim(),
        createdBy: req.user.id,
      });

      await TeamMember.create({
        team: team._id,
        user: req.user.id,
        role: "admin",
      });

      await Employee.create({
        team: team._id,
        user: req.user.id,
      });

      res.status(201).json({
        message: "Team created successfully",
        team,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  });
  module.exports = router;