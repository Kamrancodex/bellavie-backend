const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const { connectDB } = require("./config/database");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const aboutItemRoutes = require("./routes/aboutItemRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const uploadthingRoutes = require("./routes/uploadthingRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// CORS configuration - MUST run before any middleware that can terminate requests
const corsOptions = {
  origin: function (origin, callback) {
    const envOrigins = (process.env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const allowedOrigins = envOrigins.length
      ? envOrigins
      : [
          "http://localhost:3000",
          "http://localhost:8080",
          "https://bellaviecle.com",
          "https://www.bellaviecle.com",
        ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 204,
  preflightContinue: false,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
});

// Security middleware
app.use(helmet());
app.use(limiter);
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Bellavie CRM API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
const apiPrefix = process.env.API_PREFIX || "/api";
const apiVersion = process.env.API_VERSION || "v1";
const baseRoute = `${apiPrefix}/${apiVersion}`;

app.use(`${baseRoute}/auth`, authRoutes);
app.use(`${baseRoute}/users`, userRoutes);
app.use(`${baseRoute}/inquiries`, inquiryRoutes);
app.use(`${baseRoute}/services`, serviceRoutes);
app.use(`${baseRoute}/testimonials`, testimonialRoutes);
app.use(`${baseRoute}/about-items`, aboutItemRoutes);
app.use(`${baseRoute}/gallery`, galleryRoutes);
// UploadThing React helpers call /api/v1/api/uploadthing, so mount accordingly
app.use("/api/uploadthing", uploadthingRoutes);
app.use(`${baseRoute}/dashboard`, dashboardRoutes);

// Welcome route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Bellavie CRM API",
    version: "1.0.0",
    documentation: `${req.protocol}://${req.get("host")}/api-docs`,
    endpoints: {
      health: "/health",
      auth: `${baseRoute}/auth`,
      users: `${baseRoute}/users`,
      clients: `${baseRoute}/clients`,
      events: `${baseRoute}/events`,
      inquiries: `${baseRoute}/inquiries`,
      dashboard: `${baseRoute}/dashboard`,
    },
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  mongoose.connection.close(() => {
    console.log("Database connection closed.");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  mongoose.connection.close(() => {
    console.log("Database connection closed.");
    process.exit(0);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Bellavie CRM Server is running!
📍 Environment: ${process.env.NODE_ENV}
🌐 Port: ${PORT}
🔗 URL: http://localhost:${PORT}
💾 Database: ${process.env.DB_NAME}
📊 API Base: ${baseRoute}
  `);
});

module.exports = app;
