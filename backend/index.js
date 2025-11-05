/**

 * @file Main server entry point for the Note Keeper application.

 * @description This file initializes the Express server, configures middleware,

 * sets up API routes, and starts listening for incoming requests.

 */

// Loads environment variables from a .env file into process.env

require("dotenv").config();

// --- Imports ---
const auth = require('./middleware/auth') 

const express = require("express"); // The core framework for building the API

const cors = require("cors"); // Middleware to enable Cross-Origin Resource Sharing

const tasks = require("./routes/tasks"); // Imports the router for all task-related endpoints
const authRoutes = require('./routes/auth')

// --- App Initialization ---

const app = express();

// --- Core Middleware ---

// Enable Cross-Origin Resource Sharing (CORS) for all routes.

// This allows the frontend (running on a different port) to make requests to this backend.

app.use(cors());

// Parse incoming request bodies with JSON payloads.

// This is necessary to read data from the body of POST, PUT, and PATCH requests.

app.use(express.json());

// --- Request Logger Middleware (Custom) ---

/**

 * A simple middleware to log every incoming request to the console.

 * This provides a live feed of API activity for easy debugging.

 */

app.use((req, res, next) => {
  // Log the timestamp, HTTP method (e.g., GET, POST), and the requested URL.

  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`); // Call next() to pass control to the next middleware or route handler.

  next();
});

// --- API Routes ---
app.use('/api/auth', authRoutes)
app.use('/api/tasks', auth, tasks)
// Mount the task routes. All requests that start with '/tasks' will be

// forwarded to the router defined in './routes/tasks.js'.

app.use("/tasks", tasks);

// --- Server Startup ---

const port = process.env.PORT || 4000; // Use the port from .env, or default to 4000

// Start the server and listen for connections on the specified port.

app.listen(port, () => {
  console.log(`🚀 Server is running successfully on port ${port}`);
});
