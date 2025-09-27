import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { NextFunction, Request, Response } from 'express';
import User from '../models/userModel';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie';
import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from '../services/emailService';

// Signup with email verification
export const signup = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  try {
    if (!email || !password || !name) {
      throw new Error("All fields are required");
    }

    const userAlreadyExists = await User.findOne({ email });
    console.log("userAlreadyExists", userAlreadyExists);

    if (userAlreadyExists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    // Split name into firstName and lastName
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    const user = new User({
      email,
      password: hashedPassword,
      passwordHash: hashedPassword, // For compatibility
      name,
      firstName,
      lastName,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    await user.save();

    // Generate JWT and set cookie
    const token = generateTokenAndSetCookie(res, user._id);

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      token: token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        role: user.role,
        lastLogin: user.lastLogin,
        addresses: user.addresses,
        isActive: user.isActive,
        availableOffers: user.availableOffers,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

// Email verification
export const verifyEmail = async (req: Request, res: Response) => {
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    // Generate JWT and set cookie for verified user
    const token = generateTokenAndSetCookie(res, user._id);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      token: token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        role: user.role,
        lastLogin: user.lastLogin,
        addresses: user.addresses,
        isActive: user.isActive,
        availableOffers: user.availableOffers,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
    });
  } catch (error) {
    console.log("error in verifyEmail ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Login with cookie-based authentication
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }
    
    // Check password using either password or passwordHash field
    const isPasswordValid = user.password 
      ? await bcryptjs.compare(password, user.password)
      : await user.comparePassword(password);
      
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT and set cookie
    const token = generateTokenAndSetCookie(res, user._id);

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token: token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        role: user.role,
        lastLogin: user.lastLogin,
        addresses: user.addresses,
        isActive: user.isActive,
        availableOffers: user.availableOffers,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
    });
  } catch (error) {
    console.log("Error in login ", error);
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

// Logout
export const logout = async (req: Request, res: Response) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// Forgot password
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = new Date(resetTokenExpiresAt);
    user.resetPasswordExpires = new Date(resetTokenExpiresAt); // For compatibility

    await user.save();

    // Send reset email
    await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

    res.status(200).json({ success: true, message: "Password reset link sent to your email" });
  } catch (error) {
    console.log("Error in forgotPassword ", error);
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token: resetToken } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    // Update password
    const hashedPassword = await bcryptjs.hash(password, 10);

    user.password = hashedPassword;
    user.passwordHash = hashedPassword; // For compatibility
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    user.resetPasswordExpires = undefined; // For compatibility
      await user.save();

    await sendResetSuccessEmail(user.email);

    // Generate JWT and set cookie for user after password reset
    const jwtToken = generateTokenAndSetCookie(res, user._id);

    res.status(200).json({ 
      success: true, 
      message: "Password reset successful",
      token: jwtToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        role: user.role,
        lastLogin: user.lastLogin,
        addresses: user.addresses,
        isActive: user.isActive,
        availableOffers: user.availableOffers,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.log("Error in resetPassword ", error);
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

// Check authentication status
export const checkAuth = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).userId).select("-password -passwordHash");
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in checkAuth ", error);
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

// Get current user profile
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).userId).select("-password -passwordHash");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        role: user.role,
        lastLogin: user.lastLogin,
        addresses: user.addresses,
        isActive: user.isActive,
        availableOffers: user.availableOffers,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.log("Error in getCurrentUser ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    // Get user from database
    const user = await User.findById(userId)
      .select("-passwordHash -otp -otpExpires -resetPasswordToken -resetPasswordExpires");

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.json({ user });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Server error during profile fetch." });
    next(err);
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const userId = (req as any).userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        role: user.role,
        lastLogin: user.lastLogin,
        addresses: user.addresses,
        isActive: user.isActive,
        availableOffers: user.availableOffers,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.log("Error in updateProfile ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};