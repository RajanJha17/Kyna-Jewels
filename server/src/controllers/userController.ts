import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import { createSuccessResponse, createErrorResponse } from "../utils/tracking";

export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  /**
   * Get user profile
   */
  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json(createErrorResponse("Unauthorized"));
        return;
      }

      const user = await this.userService.getUserById(userId);

      if (!user) {
        res.status(404).json(createErrorResponse("User not found"));
        return;
      }

      res.json(createSuccessResponse(user));
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json(createErrorResponse("Failed to get profile"));
    }
  };

  /**
   * Update user profile
   */
  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const updateData = req.body;

      if (!userId) {
        res.status(401).json(createErrorResponse("Unauthorized"));
        return;
      }

      const updatedUser = await this.userService.updateUser(userId, updateData);

      res.json(
        createSuccessResponse(updatedUser, "Profile updated successfully")
      );
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json(createErrorResponse("Failed to update profile"));
    }
  };

  /**
   * Get user orders with details
   */
  getUserOrders = async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId || req.user?.id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: "User ID is required",
        });
      }

      const { UserModel } = require("../models/userModel");
      const user = await UserModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      // Get orders with details
      const orders = await user.getOrdersWithDetails();

      res.json({
        success: true,
        data: {
          orders,
          totalOrders: orders.length,
          user: {
            id: user._id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
          },
        },
        message: "User orders retrieved successfully",
      });
    } catch (error) {
      console.error("Get user orders error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get user orders",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}
