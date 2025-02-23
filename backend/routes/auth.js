import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Adjust the import path as needed
import Token from "../models/Token.js"; // Import the Token model
import dotenv from "dotenv";
import auth from "../middleware/auth.js";
import nodemailer from "nodemailer";
import e from "express";

dotenv.config();

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    // res.status(201).json({ message: 'User registered successfully' });

    // This is for email verification
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const verificationLink = `${process.env.VITE_API_BASE_URL}/api/auth/verify-email?token=${token}`;

    const emailHTML = `
      <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; border: 1px solid #eaeaea; padding: 20px; border-radius: 10px; text-align: center;">
        <img src="https://email-agent.up.railway.app/logo/logo_light.png" alt="Email Agent" style="width: 200px; height: 60px; margin-bottom: 20px;">  
        <h2 style="color: #333;">Welcome to Our Platform, ${name}!</h2>
        <p style="color: #555;">Click the button below to verify your email and activate your account.</p>
        <a href="${verificationLink}" style="display: inline-block; background-color:rgb(12, 88, 195); color: white; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-size: 16px; margin-top: 20px;">Verify Email</a>
        <p style="color: #777; margin-top: 20px;">If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
        <p style="background-color: #f4f4f4; padding: 10px; word-break: break-all; border-radius: 5px;">${verificationLink}</p>
        <p style="color: #999; font-size: 14px;">This link will expire in 1 hour.</p>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;">
        <p style="color: #777;">Please do not reply this email.</p>
        <h2 style="color: #333; margin-top: 20px;">Need Help?</h2>
        <p style="color: #555;">If you have any questions or need help, please contact our support team at <a href="mailto:
        support@replai.tech" style="color: #007bff; text-decoration: none;">support@replai.tech</a></p>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;">
        <p style="color: #777;">You're receiving this email because you signed up for an account on Email Agent.</p>
        <p style="color: #999; font-size: 14px;">If you did not request this, please ignore this email.</p>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Verify Your Email - Email Agent",
      html: emailHTML,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .json({ message: "Error sending verification email." });
      }
      res.status(200).json({
        message:
          "Registered successfully! Please check your email to verify your account.",
      });
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Error registering user" });
  }
});

// Send verification email
router.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: "Missing token parameter" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(400).json({ message: "Invalid token" });
    }

    user.isVerified = true;
    await user.save();

    // res.status(200).json({ message: 'Email verified successfully!' });
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verified</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            background-color: #f4f4f4;
            padding: 20px;
          }
          .container {
            background: white;
            max-width: 400px;
            margin: auto;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
            margin-top: 100px;
          }
          .success-icon {
            color: #28a745;
            font-size: 50px;
            margin-bottom: 10px;
          }
          .message {
            font-size: 18px;
            color: #333;
          }
          .btn {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 24px;
            background-color:rgb(12, 88, 195);
            color: white;
            text-decoration: none;
            font-size: 16px;
            border-radius: 5px;
            transition: background 0.3s ease-in-out;
          }
          .btn:hover {
            background-color: rgb(0, 106, 255);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <img src="https://email-agent.up.railway.app/logo/logo_light.png" alt="Email Agent" style="width: 200px; height: 60px; margin-bottom: 20px;">
          <h2>Email Verified Successfully!</h2>
          <p class="message">Your email has been successfully verified. You can now log in to your account.</p>
          <a href="https://email-agent.up.railway.app/signin" class="btn">Go to Login</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ message: "Error verifying email." });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res
        .status(400)
        .json({ message: "Please verify your email to login" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Error logging in" });
  }
});

// Resend verification email
router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const verificationLink = `${process.env.VITE_API_BASE_URL}/api/auth/verify-email?token=${token}`;

    const { name } = user.name;

    const emailHTML = `
      <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; border: 1px solid #eaeaea; padding: 20px; border-radius: 10px; text-align: center;">
        <img src="https://email-agent.up.railway.app/logo/logo_light.png" alt="Email Agent" style="width: 200px; height: 60px; margin-bottom: 20px;">  
        <h2 style="color: #333;">Welcome to Our Platform, ${name}!</h2>
        <p style="color: #555;">Click the button below to verify your email and activate your account.</p>
        <a href="${verificationLink}" style="display: inline-block; background-color:rgb(12, 88, 195); color: white; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-size: 16px; margin-top: 20px;">Verify Email</a>
        <p style="color: #777; margin-top: 20px;">If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
        <p style="background-color: #f4f4f4; padding: 10px; word-break: break-all; border-radius: 5px;">${verificationLink}</p>
        <p style="color: #999; font-size: 14px;">This link will expire in 1 hour.</p>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;">
        <p style="color: #777;">Please do not reply this email.</p>
        <h2 style="color: #333; margin-top: 20px;">Need Help?</h2>
        <p style="color: #555;">If you have any questions or need help, please contact our support team at <a href="mailto:
        support@replai.tech" style="color: #007bff; text-decoration: none;">support@replai.tech</a></p>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;">
        <p style="color: #777;">You're receiving this email because you signed up for an account on Email Agent.</p>
        <p style="color: #999; font-size: 14px;">If you did not request this, please ignore this email.</p>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Verify Your Email - Email Agent",
      html: emailHTML,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .json({ message: "Error sending verification email." });
      }
      res
        .status(200)
        .json({ message: "Verification email resent successfully!" });
    });
  } catch (error) {
    console.error("Error resending verification email:", error);
    res.status(500).json({ message: "Error resending verification email." });
  }
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User with this email does not exist" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const resetLink = `${process.env.VITE_API_BASE_URL}/api/auth/reset-password?token=${token}`;

    const emailHTML = `
    <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; border: 1px solid #eaeaea; padding: 20px; border-radius: 10px; text-align: center;">
      <img src="https://email-agent.up.railway.app/logo/logo_light.png" alt="Email Agent" style="width: 200px; height: 60px; margin-bottom: 20px;">  
      <h2 style="color: #333;">Forgot password?</h2>
      <p style="color: #555;">Click the button below to set new password.</p>
      <a href="${resetLink}" style="display: inline-block; background-color:rgb(12, 88, 195); color: white; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-size: 16px; margin-top: 20px;">Reset password</a>
      <p style="color: #777; margin-top: 20px;">If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
      <p style="background-color: #f4f4f4; padding: 10px; word-break: break-all; border-radius: 5px;">${resetLink}</p>
      <p style="color: #999; font-size: 14px;">This link will expire in 1 hour.</p>
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;">
      <p style="color: #777;">Please do not reply this email.</p>
      <h2 style="color: #333; margin-top: 20px;">Need Help?</h2>
      <p style="color: #555;">If you have any questions or need help, please contact our support team at <a href="mailto:
      support@replai.tech" style="color: #007bff; text-decoration: none;">support@replai.tech</a></p>
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;">
      <p style="color: #777;">You're receiving this email because you signed up for an account on Email Agent.</p>
      <p style="color: #999; font-size: 14px;">If you did not request this, please ignore this email.</p>
    </div>
  `;

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Password Reset - Email Agent",
      html: emailHTML,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .json({ message: "Error sending password reset email." });
      }
      res
        .status(200)
        .json({ message: "Password reset email sent successfully!" });
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(500).json({ message: "Error sending password reset email." });
  }
});

// Password Reset Page

router.get("/reset-password", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: "Missing token parameter" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(400).json({ message: "Invalid token" });
    }

    res.send(`
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password</title>
    <style>
        * {
            box-sizing: border-box;
            font-family: Arial, sans-serif;
        }
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f4f4f4;
            margin: 0;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 400px;
            width: 100%;
        }
        h2 {
            margin-bottom: 20px;
        }
        input {
            width: 100%;
            padding: 12px;
            margin-top: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 16px;
        }
        .btn {
            width: 100%;
            padding: 12px;
            background-color: #007bff;
            color: white;
            border: none;
            font-size: 16px;
            border-radius: 5px;
            margin-top: 20px;
            cursor: pointer;
            transition: background 0.3s;
        }
        .btn:hover {
            background-color: #0056b3;
        }
        .message {
            margin-top: 15px;
            font-size: 14px;
            color: red;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="https://email-agent.up.railway.app/logo/logo_light.png" alt="Email Agent" style="width: 200px; height: 60px; margin-bottom: 20px;">
        <h2>Reset Your Password</h2>
        <input type="password" id="password" placeholder="New Password" required>
        <input type="password" id="confirmPassword" placeholder="Confirm Password" required>
        <button class="btn" onclick="resetPassword()">Reset Password</button>
        <p class="message" id="message"></p>
    </div>

    <script>
        async function resetPassword() {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const messageElement = document.getElementById('message');

            if (!password || !confirmPassword) {
                messageElement.textContent = "Please fill in all fields.";
                return;
            }

            if (password !== confirmPassword) {
                messageElement.textContent = "Passwords do not match.";
                return;
            }

            try {
                const response = await fetch("${process.env.VITE_API_BASE_URL}/api/auth/reset-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token, newPassword: password }) 
                });

                const data = await response.json();
                if (response.ok) {
                    messageElement.style.color = "green";
                    messageElement.textContent = "Password reset successfully! Redirecting...";
                    setTimeout(() => { window.location.href = "https://email-agent.up.railway.app/signin"; }, 2000);
                } else {
                    messageElement.textContent = data.message || "Error resetting password.";
                }
            } catch (error) {
                messageElement.textContent = "Something went wrong. Please try again.";
            }
        }
    </script>
</body>
</html>
    `);
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Error resetting password." });
  }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(400).json({ message: "Invalid token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successfully!" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Error resetting password." });
  }
});

// Get authenticated user
router.get("/user", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Error fetching user" });
  }
});

// Logout
router.post("/logout", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Add the token to a blacklist or remove it from the active tokens list
    await Token.create({ token });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ error: "Error logging out" });
  }
});

// Endpoint to check authentication status
router.get("/status", auth, (req, res) => {
  res.status(200).send({ authenticated: true });
});

export default router;
