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
import puppeteer from "puppeteer"; // Add this import


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
      fileName: req.file.originalname,
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

// Analyze URL using Cheerio with improved content extraction
router.post("/analyze-url", auth, async (req, res) => {
  const { url } = req.body;
  const userId = req.user._id;

  if (!url) {
    return res.status(400).json({ message: "URL must be provided" });
  }

  // Validate URL format
  try {
    new URL(url);
  } catch (e) {
    return res.status(400).json({ message: "Invalid URL format" });
  }

  let browser = null;

  try {
    console.log(`Starting extraction from: ${url}`);
    
    // Launch a headless browser
    browser = await puppeteer.launch({
      headless: 'new', // Use new headless mode
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });
    
    // Create a new page
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });
    
    // Set user agent to appear as a regular browser
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36');
    
    // Configure request interception to block unnecessary resources
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      // Block images, fonts, stylesheets, etc. to speed up loading
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });
    
    // Add timeout setting with a message
    const navigationTimeout = 30000; // 30 seconds
    
    // Go to URL with timeout protection
    console.log(`Navigating to ${url} with ${navigationTimeout/1000}s timeout...`);
    
    try {
      // Navigate to the URL and wait until network is idle
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: navigationTimeout
      });
    } catch (navigationError) {
      // If timeout occurs, work with what we have
      console.log(`Navigation timeout or error: ${navigationError.message}. Working with partial page...`);
    }
    
    // Wait a bit for any delayed JavaScript to execute
    await new Promise(resolve => setTimeout(resolve, 2000));
        
    // Extract metadata from the page
    const pageTitle = await page.title() || url.split('/').pop() || 'Untitled Page';
    
    // Try to get meta description
    const pageDescription = await page.evaluate(() => {
      const descriptionMeta = document.querySelector('meta[name="description"]') || 
                              document.querySelector('meta[property="og:description"]');
      return descriptionMeta ? descriptionMeta.getAttribute('content') : '';
    });
    
    console.log(`Extracting content from: ${pageTitle}`);
    
    // Function to extract the readable content from the page using Puppeteer
    const extractedContent = await page.evaluate(() => {
      // Helper function to determine if an element is visible
      const isVisible = (element) => {
        if (!element) return false;
        
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
          return false;
        }
        
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      };
      
      // Helper to check if an element is likely navigation/footer/header
      const isNonContentElement = (element) => {
        if (!element) return false;
        
        // Check tag name
        const tagName = element.tagName.toLowerCase();
        if (['nav', 'footer', 'header', 'aside', 'menu'].includes(tagName)) {
          return true;
        }
        
        // Check ARIA roles
        const role = element.getAttribute('role');
        if (role && ['navigation', 'banner', 'contentinfo', 'complementary'].includes(role)) {
          return true;
        }
        
        // Check ID and class names
        const id = element.id.toLowerCase();
        const className = element.className.toString().toLowerCase();
        
        return (
          id.includes('nav') || id.includes('header') || id.includes('footer') || id.includes('menu') ||
          className.includes('nav') || className.includes('header') || className.includes('footer') || 
          className.includes('menu') || className.includes('sidebar')
        );
      };
      
      // Find the main content container
      const findMainContent = () => {
        // Try semantic elements first
        const mainSelectors = [
          'main', 'article', '[role="main"]', '.main-content', '#main-content', 
          '.content', '#content', '.post', '.post-content', '.entry-content', 
          '.article', '.article-content', '.page-content', '#primary'
        ];
        
        // Try each selector
        for (const selector of mainSelectors) {
          const elements = document.querySelectorAll(selector);
          for (const el of elements) {
            if (isVisible(el) && !isNonContentElement(el) && el.textContent.trim().length > 300) {
              return el;
            }
          }
        }
        
        // If no main content container found, use the body
        return document.body;
      };
      
      // Get the main content container
      const mainContent = findMainContent();
      
      // Process the content extraction
      let extractedText = '';
      
      // Function to process an element and its visible children
      const processElement = (element, depth = 0) => {
        // Skip non-visible or non-content elements
        if (!isVisible(element) || isNonContentElement(element)) {
          return '';
        }
        
        let elementContent = '';
        const tagName = element.tagName.toLowerCase();
        
        // Process element based on its tag
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
          // Headings
          const headingLevel = tagName.charAt(1);
          const text = element.textContent.trim();
          if (text) {
            elementContent += `\n\n${'#'.repeat(headingLevel)} ${text}\n`;
          }
        } 
        else if (tagName === 'p') {
          // Paragraphs
          const text = element.textContent.trim();
          if (text) {
            elementContent += `\n${text}\n`;
          }
        }
        else if (tagName === 'br') {
          elementContent += '\n';
        }
        else if (tagName === 'hr') {
          elementContent += '\n---\n';
        }
        else if (tagName === 'ul' || tagName === 'ol') {
          // Lists
          const listItems = element.querySelectorAll('li');
          listItems.forEach(li => {
            if (isVisible(li)) {
              const text = li.textContent.trim();
              if (text) {
                elementContent += `\n• ${text}`;
              }
            }
          });
          if (elementContent) {
            elementContent += '\n';
          }
        }
        else if (tagName === 'table') {
          // Tables
          elementContent += '\n\nTable Content:\n';
          const rows = element.querySelectorAll('tr');
          rows.forEach(row => {
            if (isVisible(row)) {
              const cells = [];
              row.querySelectorAll('th, td').forEach(cell => {
                if (isVisible(cell)) {
                  cells.push(cell.textContent.trim());
                }
              });
              if (cells.length) {
                elementContent += cells.join(' | ') + '\n';
              }
            }
          });
          elementContent += '\n';
        }
        else if (tagName === 'blockquote') {
          // Blockquotes
          const text = element.textContent.trim();
          if (text) {
            elementContent += `\n> ${text.replace(/\n/g, '\n> ')}\n`;
          }
        }
        else if (tagName === 'pre' || tagName === 'code') {
          // Code blocks
          const text = element.textContent.trim();
          if (text) {
            elementContent += `\n\`\`\`\n${text}\n\`\`\`\n`;
          }
        }
        else if (element.childNodes.length === 0 || (element.childNodes.length === 1 && element.childNodes[0].nodeType === 3)) {
          // Text nodes or elements with only text
          const text = element.textContent.trim();
          if (text && text.length > 1) {
            elementContent += ' ' + text + ' ';
          }
        }
        else {
          // For all other elements, process children recursively
          for (const child of element.childNodes) {
            if (child.nodeType === 1) { // Element node
              elementContent += processElement(child, depth + 1);
            } else if (child.nodeType === 3) { // Text node
              const text = child.textContent.trim();
              if (text && text.length > 1) {
                elementContent += ' ' + text + ' ';
              }
            }
          }
        }
        
        return elementContent;
      };
      
      // Extract content from the main container
      extractedText = processElement(mainContent);
      
      // If we didn't get enough content, try the whole body
      if (extractedText.length < 300) {
        console.log("Insufficient content from main container, processing whole body");
        extractedText = '';
        
        // Get all paragraphs, headings, and list items directly
        const contentElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th');
        contentElements.forEach(el => {
          if (isVisible(el) && !isNonContentElement(el.parentElement)) {
            const text = el.textContent.trim();
            if (text) {
              if (el.tagName.toLowerCase().startsWith('h')) {
                extractedText += `\n\n# ${text}\n`;
              } else if (el.tagName.toLowerCase() === 'li') {
                extractedText += `\n• ${text}`;
              } else {
                extractedText += `\n${text}\n`;
              }
            }
          }
        });
      }
      
      // Clean up the extracted text
      return extractedText
        .replace(/\n{3,}/g, '\n\n')  // Replace 3+ newlines with 2
        .replace(/\s{2,}/g, ' ')     // Replace multiple spaces with single space
        .trim();
    });
    
    // Close the browser
    await browser.close();
    browser = null;
    
    // Last resort if extraction methods above didn't work
    let finalExtractedText = extractedContent;
    
    if (finalExtractedText.length < 200) {
      console.log("Puppeteer extraction yielded insufficient content, trying with Cheerio as fallback");
      
      try {
        // Fetch the website content with Axios as fallback
        const { data } = await axios.get(url, {
          timeout: 15000,
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
          },
        });
        
        // Use Cheerio to get plain text
        const $ = cheerio.load(data);
        
        // Remove non-content elements
        $('script, style, noscript, iframe, svg, canvas, img, form, input, button, select, textarea').remove();
        
        // Grab all text from body
        finalExtractedText = $('body').text()
          .replace(/\s+/g, ' ')
          .trim();
      } catch (error) {
        console.error("Cheerio fallback also failed:", error.message);
      }
    }
    
    // Format the final content with metadata
    const finalContent = `
Page: ${pageTitle}
URL: ${url}
Description: ${pageDescription}
Date Extracted: ${new Date().toISOString().split('T')[0]}

CONTENT:
${finalExtractedText}
    `.trim();

    // Calculate character count
    const charCount = finalContent.length;
    
    console.log(`Extracted ${charCount} characters from ${url}`);
    
    // Bail out if we didn't get meaningful content
    if (charCount < 200) {
      return res.status(400).json({ 
        message: "Could not extract meaningful content from this URL. Please try a different page with more text content."
      });
    }

    // Now save the extracted content to the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Store URL in user record
    user.urls = user.urls || [];
    // Check if the URL already exists
    const existingUrlIndex = user.urls.findIndex((item) => item.url === url);
    if (existingUrlIndex !== -1) {
      // Update existing URL data
      user.urls[existingUrlIndex].charCount = charCount;
      user.urls[existingUrlIndex].lastUpdated = new Date();
    } else {
      // Add new URL data
      user.urls.push({
        url,
        charCount,
        title: pageTitle,
        lastUpdated: new Date(),
      });
    }
    await user.save();

    // Check if text data exists for this user
    let textData = await TextData.findOne({ userId });

    // Create new record if it doesn't exist
    if (!textData) {
      textData = new TextData({
        userId,
        text: "", // Initialize empty
        fileData: "", // Initialize empty
        webData: finalContent,
        createdAt: new Date(),
      });
    } else {
      // If webData field doesn't exist yet, add it
      if (textData.webData === undefined) {
        textData.webData = finalContent;
      } else {
        // Append new content with a separator
        textData.webData += `\n\n=== NEW PAGE ===\n\n${finalContent}`;
      }
      textData.updatedAt = new Date();
    }

    await textData.save();

    // Return a longer preview for better context
    const previewLength = Math.min(500, finalContent.length);
    const contentPreview = finalContent.substring(0, previewLength) + 
                          (finalContent.length > previewLength ? "..." : "");

    res.status(200).json({
      message: "URL content extracted successfully",
      url,
      title: pageTitle,
      charCount,
      urls: user.urls,
      contentPreview
    });
  } catch (error) {
    console.error("Error analyzing URL:", error);
    
    // Make sure to close browser in case of error
    if (browser) {
      await browser.close().catch(err => console.error("Error closing browser:", err));
    }
    
    // Provide more specific error messages based on the error type
    let errorMessage = "Error analyzing URL. Please check the URL and try again.";
    
    if (error.code === 'ECONNREFUSED') {
      errorMessage = "Could not connect to the website. The server refused the connection.";
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = "Website not found. Please check the URL and try again.";
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = "Connection timed out. The website took too long to respond.";
    } else if (error.message.includes('net::ERR_')) {
      errorMessage = `Network error: ${error.message}. The website may be down or blocking automated access.`;
    } else if (error.response) {
      // Specific HTTP error status
      if (error.response.status === 403) {
        errorMessage = "Access to this website is forbidden (403).";
      } else if (error.response.status === 404) {
        errorMessage = "The requested page was not found (404).";
      } else if (error.response.status === 429) {
        errorMessage = "Too many requests to this website. Please try again later.";
      } else if (error.response.status >= 500) {
        errorMessage = `Server error (${error.response.status}). The website is experiencing issues.`;
      } else {
        errorMessage = `Error accessing URL (Status: ${error.response.status})`;
      }
    }

    res.status(error.response?.status || 500).json({
      message: errorMessage,
      error: error.message
    });
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
