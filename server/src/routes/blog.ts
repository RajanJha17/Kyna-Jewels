import express from "express";
import { getAllBlogs, getBlogById } from "../controllers/blogController";

const router = express.Router();

router.get("/", getAllBlogs); // GET all blogs (id, title, displayImage)
router.get("/:id", getBlogById); // GET blog by ID

export default router;
