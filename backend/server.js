import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { google } from "googleapis";
import authRoutes from "./routes/auth.js";
import dotenv from "dotenv";
import handleEmails from "./emails/handleEmails.js";
import connectedEmails from "./emails/connectedEmails.js";
import SentEmail from "./models/SentEmail.js";
import emailsRouter from "./routes/emails.js";
import user from "./user/user.js";
import stats from "./emails/stats.js";
import blocklist from "./routes/blocklist.js";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import data from "./routes/data.js";
import googleAuth from "./routes/googleAuth.js";
import feedback from "./routes/feedback.js";
import userController from "./routes/userController.js";

// Define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URL, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

app.set('trust proxy', true);

const allowedOrigins = [
  "http://localhost:5173", // For local development
  "https://email-agent.up.railway.app", // For production
  "http://localhost:3000", // For test
  `${process.env.FRONTEND_URL}`,
  `${process.env.VITE_API_BASE_URL}`,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // for cookies or sessions
  })
);

// Increase payload size limit
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/auth", authRoutes);
app.use("/api/emails", handleEmails);
app.use("/api/emails", emailsRouter);
app.use("/api/emails", connectedEmails);
app.use("/api/user", user);
app.use("/api/emails", stats);
app.use("/api/blocklist", blocklist);
app.use("/api/data", data);
app.use("/api/auth", googleAuth);
app.use("/api/feedback", feedback);
app.use("/api/user", userController);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${port}`);
});
