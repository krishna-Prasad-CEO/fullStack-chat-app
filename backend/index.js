import express from "express";
import dotenv from "dotenv";
import authRoute from "./routes/auth.route.js";
import connectDb from "./lib/db.js";
import cookieParser from "cookie-parser";
import { v2 as Cloudinary } from "cloudinary";
import messageRoute from "./routes/message.route.js";
import cors from "cors";
import { io, server, app } from "./lib/socket.js";
import path from "path";

dotenv.config();

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
Cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// middlewares
app.use("/api/auth", authRoute);
app.use("/api/message", messageRoute);
const PORT = process.env.PORT;
const __dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
  connectDb();
});
