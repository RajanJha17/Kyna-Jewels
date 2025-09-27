import { Response } from 'express';
import User from '../models/userModel';
import { AuthRequest } from '../types';
import mongoose from 'mongoose';

// Add product to wishlist
export const addToWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { productId } = req.body;
        const userId = req.user?._id;

        if (!productId) {
            res.status(400).json({ message: 'Product ID is required' });
            return;
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            res.status(400).json({ message: 'Invalid product ID' });
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Check if product is already in wishlist
        if (user.wishlist.includes(productId)) {
            res.status(400).json({ message: 'Product already in wishlist' });
            return;
        }

        // Add product to wishlist
        user.wishlist.push(productId);
        await user.save();

        res.status(200).json({
            message: 'Product added to wishlist successfully',
            wishlist: user.wishlist
        });
    } catch (error) {
        console.error('Add to wishlist error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Remove product from wishlist
export const removeFromWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { productId } = req.params;
        const userId = req.user?._id;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            res.status(400).json({ message: 'Invalid product ID' });
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Remove product from wishlist
        user.wishlist = user.wishlist.filter(id => id.toString() !== productId) as typeof user.wishlist;
        await user.save();

        res.status(200).json({
            message: 'Product removed from wishlist successfully',
            wishlist: user.wishlist
        });
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user's wishlist
export const getWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;

        const user = await User.findById(userId).populate('wishlist');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(200).json({
            wishlist: user.wishlist,
            count: user.wishlist.length
        });
    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Clear entire wishlist
export const clearWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        user.wishlist = [];
        await user.save();

        res.status(200).json({
            message: 'Wishlist cleared successfully',
            wishlist: []
        });
    } catch (error) {
        console.error('Clear wishlist error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};