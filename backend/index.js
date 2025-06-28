import * as dotenv from 'dotenv';
dotenv.config();

import express from "express";
// import bodyParser from 'body-parser';
import cors from "cors";
import cookieParser from "cookie-parser";
import globalErrorHandler from "./controllers/error.controller.js";
import router from "./routes/index.route.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(bodyParser.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
    maxAge: 86400 // 24 hours
  })
);

// Routes
app.use("/api", router);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('JWT_ACCESS_KEY configured:', !!process.env.JWT_ACCESS_KEY);
});

app.use(globalErrorHandler);

export default app;
