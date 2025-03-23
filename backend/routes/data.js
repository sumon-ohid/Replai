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
  
  // if no file uploaded
  if (!req.file) {
    return res.status(400).json({ message: "File must be provided" });
  }
  
  const filePath = req.file.path;

  // if not pdf file
  if (req.file.mimetype !== "application/pdf") {
    // Clean up the uploaded file
    fs.unlinkSync(filePath);
    return res.status(400).json({ message: "File must be a PDF" });
  }

  // if size is greater than 4MB
  if (req.file.size > 4 * 1024 * 1024) {
    // Clean up the uploaded file
    fs.unlinkSync(filePath);
    return res.status(400).json({ message: "File must be smaller than 4MB" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      // Clean up the uploaded file
      fs.unlinkSync(filePath);
      return res.status(404).json({ message: "User not found" });
    }

    // Extract text from PDF
    const text = await extractTextFromPDF(filePath);
    
    // Calculate character count
    const charCount = text ? text.length : 0;
    
    // Keep track of initial character count for response
    const initialCharCount = charCount;

    // Look for existing file data for this user
    const existingFileData = await TextData.findOne({ userId });

    if (existingFileData) {
      // Update existing record
      existingFileData.fileData = text;
      await existingFileData.save();
    } else {
      // Create new record
      const newFileData = new TextData({
        userId,
        fileData: text,
      });
      await newFileData.save();
    }
    
    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    // Always return the character count in the response
    return res.status(201).json({ 
      message: "File uploaded and data saved successfully", 
      totalCharCount: initialCharCount,
      fileName: req.file.originalname
    });
    
  } catch (error) {
    console.error("Error uploading file:", error);
    
    // Try to clean up the file if it exists
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (cleanupError) {
      console.error("Error cleaning up file:", cleanupError);
    }
    
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
