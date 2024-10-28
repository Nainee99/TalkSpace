import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/DbConfig.js";
import authRoutes from "./routes/AuthRoutes.js";

// Initialize environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;
const ORIGIN = process.env.ORIGIN;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: ORIGIN,
    credentials: true,
    methods: ["GET,HEAD,PUT,PATCH,POST,DELETE"],
  })
);

app.use(cookieParser());
app.use("/api/auth", authRoutes);

app.use("/uploads/profiles", express.static(".uploads/profiles"));

// Connect to MongoDB
connectDB();

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
