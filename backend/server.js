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
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/emails", handleEmails);
app.use("/api/emails", emailsRouter);
app.use("/api/emails", connectedEmails);
app.use("/api/user", user);
app.use("/api/emails", stats);
app.use("/api/blocklist", blocklist);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${port}`);
});
