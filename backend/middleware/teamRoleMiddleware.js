const TeamMember = require("../models/TeamMember");

const requireTeamRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const { teamId } = req.params;

      if (!teamId) {
        return res.status(400).json({
          message: "Team ID is required",
        });
      }

      const membership = await TeamMember.findOne({
        team: teamId,
        user: req.user.id,
        role: requiredRole,
        status: "active",
      });

      if (!membership) {
        return res.status(403).json({
          message: "You do not have permission for this team",
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
};

module.exports = requireTeamRole;