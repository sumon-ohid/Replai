import express from "express";
import auth from "../middleware/auth.js";
import TextData from "../models/TextData.js";
import User from "../models/User.js";
import fs from "fs";
import dotenv from "dotenv";
import multer from "multer";
import { promisify } from "util";
import axios from "axios";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import * as cheerio from "cheerio";
import { load } from "cheerio";

dotenv.config();

const router = express.Router();

const upload = multer({ dest: "uploads/files" });

const readFileAsync = promisify(fs.readFile);

const extractTextFromPDF = async (filePath) => {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const pdfDocument = await getDocument({ data }).promise;
  let extractedText = "";

  for (let i = 1; i <= pdfDocument.numPages; i++) {
    const page = await pdfDocument.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items.map((item) => item.str).join(" ");
    extractedText += text + "\n";
  }

  return extractedText;
};

// Endpoint to save text data
router.post("/save-text", auth, async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user._id;
    if (!text) return res.status(400).send("Text is required");
    if (!userId) return res.status(400).send("User ID is required");
    if (typeof text !== "string")
      return res.status(400).send("Text must be a string");
    if (text.length > 2000)
      return res.status(400).send("Text is too long (max 2000 characters)");

    // Remove existing text data for the user
    await TextData.deleteMany({ userId });

    const newTextData = new TextData({
      userId,
      text,
    });

    await newTextData.save();
    res.status(201).send(newTextData);
  } catch (error) {
    console.error("Error saving text data:", error);
    res.status(500).send("Error saving text data");
  }
});

// Endpoint to get text data
router.get("/get-text", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) return res.status(400).send("User ID is required");

    const textData = await TextData.findOne({ userId });
    res.send(textData);
  } catch (error) {
    console.error("Error getting text data:", error);
    res.status(500).send("Error getting text data");
  }
});

// Upload file
router.post("/upload-file", auth, upload.single("file"), async (req, res) => {
  const userId = req.user._id;
  const filePath = req.file.path;

  // if no file uploaded
  if (!req.file) {
    return res.status(400).json({ message: "File must be provided" });
  }

  // if not pdf file
  if (req.file.mimetype !== "application/pdf") {
    return res.status(400).json({ message: "File must be a PDF" });
  }

  // if size is greater than 4MB
  if (req.file.size > 4 * 1024 * 1024) {
    return res.status(400).json({ message: "File must be smaller than 4MB" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const data = await extractTextFromPDF(filePath);
    const text = data;

    const existingFileData = await TextData.findOne({ userId });

    if (existingFileData) {
      existingFileData.fileData = text;
      await existingFileData.save();
      fs.unlinkSync(filePath);
      return res
        .status(201)
        .json({ message: "File uploaded and data saved successfully" });
    }

    const newFileData = new TextData({
      userId,
      fileData: text,
    });

    await newFileData.save();

    fs.unlinkSync(filePath);

    res
      .status(201)
      .json({ message: "File uploaded and data saved successfully" });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ message: "Error uploading file" });
  }
});

// Analyze URL using Cheerio
router.post("/analyze-url", auth, async (req, res) => {
  const { url } = req.body;
  const userId = req.user._id;

  if (!url) {
    return res.status(400).json({ message: "URL must be provided" });
  }

  try {
    const { data } = await axios.get(url, { timeout: 10000 }); // 10s timeout
    const $ = cheerio.load(data);
    const extractedText = $("body").text().replace(/\s+/g, " ").trim();
    const charCount = extractedText.length;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.urls = user.urls || [];
    user.urls.push({ url, charCount });
    await user.save();

    res.status(200).json({ charCount, urls: user.urls });
  } catch (error) {
    console.error("Error analyzing URL:", error);
    res.status(500).json({ message: "Error analyzing URL" });
  }
});

// Delete URL
router.delete("/delete-url/:url", auth, async (req, res) => {
  const userId = req.user._id;
  const url = req.params.url;

  if (!url) {
    return res.status(400).json({ message: "URL must be provided" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.urls = user.urls.filter((item) => item.url !== url);
    await user.save();

    res
      .status(200)
      .json({ message: "URL deleted successfully", urls: user.urls });
  } catch (error) {
    console.error("Error deleting URL:", error);
    res.status(500).json({ message: "Error deleting URL" });
  }
});

// Get URL data
router.get("/get-urls", auth, async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ urls: user.urls });
  } catch (error) {
    console.error("Error getting URLs:", error);
    res.status(500).json({ message: "Error getting URLs" });
  }
});

export default router;
