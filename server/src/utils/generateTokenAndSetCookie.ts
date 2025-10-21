import jwt from "jsonwebtoken";
import { Response } from 'express';

export const generateTokenAndSetCookie = (res: Response, userId: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  // SIMPLIFIED: Set cookie as non-httpOnly so frontend can read it
  // This allows frontend to add it to Authorization header reliably
  res.cookie("token", token, {
    httpOnly: false, // Allow JavaScript to read - frontend will use Authorization header
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });

  return token;
};
