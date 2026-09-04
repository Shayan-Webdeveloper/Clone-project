const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const transporter = require("./utils/sendEmail");
const express = require("express");    // Imports the Express framework for building web applications.
const cors = require("cors");          // Imports the CORS middleware to enable Cross-Origin Resource Sharing.
const authMiddleware = require("./middleware/authMiddleware");  // Imports the custom authentication middleware for protecting routes.
const mongoose = require("mongoose"); // Imports the Mongoose library for interacting with MongoDB.
const app = express(); // Creates an instance of the Express application.
app.use(cors()); // Enables CORS for all routes, allowing requests from different origins.
app.use(express.json()); // Middleware to parse incoming JSON requests and make the data available in req.body. 

const PORT = process.env.PORT || 5000; // Sets the port for the server to listen on, defaulting to 5000 if not specified in environment variables.

const authRoutes =  require("./routes/auth"); // Imports the authentication routes for handling user login and registration.
const schedulerRoutes = require("./routes/scheduler");
const reportRoutes = require("./routes/report");
const employeeRoutes = require("./routes/employee"); // Imports the employee routes for handling employee-related operations.
const teamRoutes = require("./routes/team");
console.log("TEAM ROUTES LOADED");
const profileRoutes = require("./routes/profile"); // Imports the profile routes for handling user profile-related operations.
const invitationRoutes = require("./routes/invitation");
const questionRoutes = require("./routes/question"); // Imports the question routes for admins to manage the daily standup questions.
const settingsRoutes = require("./routes/settings"); // Imports the settings routes for configuring the daily standup send time.

app.use("/api/auth", authRoutes); // Mounts the authentication routes at the /api/auth endpoint, allowing access to login and registration functionalities.
app.use("/api/reports", reportRoutes);
app.use("/api/employee", employeeRoutes); // Mounts the employee routes at the /api/employee endpoint, allowing access to employee-related functionalities.
app.use("/api/teams", teamRoutes);
app.use("/api/profile", profileRoutes); // Mounts the profile routes at the /api/profile endpoint, allowing access to user profile-related functionalities.
app.use("/api/invitations", invitationRoutes);
app.use("/api/scheduler", schedulerRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/settings", settingsRoutes);
app.get("/", (req, res) => { // Defines a route for the root URL ("/") that responds with a simple message indicating that the backend server is running.
  res.send("Team Pulse Backend is running");
});
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You have access to this protected route",
    user: req.user,
  });
});
console.log("MONGODB_URI EXISTS:", !!process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
  module.exports = app;