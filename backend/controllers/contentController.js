
const mongoose = require("mongoose");
const Blog = require("../models/Blog");

exports.getBlogs = async (req, res) => {
  try {
    const { category, tag } = req.query;
    let filter = { published: true };

    if (category) filter.category = { $regex: category, $options: "i" };
    if (tag) filter.tags = { $regex: tag, $options: "i" };

    const blogs = await Blog.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: blogs.length, blogs });
  } catch (err) {
    console.error("Get Blogs Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getBlogByIdOrSlug = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let blog = null;

    const isValidObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);

    if (isValidObjectId) {
      blog = await Blog.findById(idOrSlug);
    }

    if (!blog) {
      blog = await Blog.findOne({ slug: idOrSlug });
    }

    if (!blog || (!blog.published && (!req.user || req.user.role !== "admin"))) {
      return res.status(404).json({ success: false, message: "Blog article not found or has been unpublished." });
    }

    blog.views = (blog.views || 0) + 1;
    await blog.save();

    return res.status(200).json({ success: true, blog });
  } catch (err) {
    console.error("Get Blog By ID/Slug Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

