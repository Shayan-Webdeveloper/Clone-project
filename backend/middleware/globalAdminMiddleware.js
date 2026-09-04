const TeamMember = require("../models/TeamMember");

const globalAdminMiddleware = async (req, res, next) => {
  try {
    if (req.user.role === "admin") {
      return next();
    }

    const adminMembership = await TeamMember.findOne({
      user: req.user.id,
      role: "admin",
      status: "active",
    });

    if (!adminMembership) {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = globalAdminMiddleware;