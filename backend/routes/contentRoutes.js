/**
 * ==========================================
 * CONTENT ROUTES (Blogs)
 * ==========================================
 * Express router endpoints for public Blog articles.
 */

const express = require("express");
const router = express.Router();
const contentController = require("../controllers/contentController");

router.get("/blogs", contentController.getBlogs);
router.get("/blogs/:idOrSlug", contentController.getBlogByIdOrSlug);

module.exports = router;
