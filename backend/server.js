import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { google } from "googleapis";
import authRoutes from "./routes/auth.js";
import dotenv from "dotenv";
import handleEmails from "./emails/handleEmails.js";
import SentEmail from "./models/SentEmail.js";
import emailsRouter from "./routes/emails.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

const corsOptions = {
  origin: "http://localhost:5173",
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/emails", handleEmails);
app.use("/api/emails", emailsRouter);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
