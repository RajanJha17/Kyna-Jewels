import { Request, Response } from "express";
import Blog from "../models/blogModel";

// @desc    Get all blogs (only id, title, and displayImage)
// @route   GET /api/blogs
// @access  Public
export const getAllBlogs = async (req: Request, res: Response) => {
  try {
    const blogs = await Blog.find({}, "_id title displayImage").sort({
      createdAt: -1,
    }); // latest first
    res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: "Failed to fetch blogs" });
  }
};

// @desc    Get a blog by ID
// @route   GET /api/blogs/:id
// @access  Public
export const getBlogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json(blog);
  } catch (error) {
    console.error("Error fetching blog by ID:", error);
    res.status(500).json({ message: "Failed to fetch blog" });
  }
};
