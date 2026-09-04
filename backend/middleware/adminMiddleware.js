const TeamMember = require("../models/TeamMember");

const adminMiddleware = async (req, res, next) => {
  try {
    const teamId = req.params.teamId || req.body.teamId;

    if (!teamId) {
      return res.status(400).json({
        message: "Team ID is required",
      });
    }

    const membership = await TeamMember.findOne({
      team: teamId,
      user: req.user.id,
      role: "admin",
      status: "active",
    });

    if (!membership) {
      return res.status(403).json({
        message: "Admin access required for this team",
      });
    }

    req.teamMembership = membership;
    next();
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = adminMiddleware;