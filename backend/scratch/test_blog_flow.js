require("dotenv").config();
const connectDB = require("../config/db");
const Blog = require("../models/Blog");
const mongoose = require("mongoose");

async function testBlogFlow() {
  try {
    console.log("Connecting to Database...");
    await connectDB();

    console.log("1. Testing Blog Creation in MongoDB...");
    const testTitle = "Mastering Mathematics: 5 Secrets for Top Grades " + Date.now();
    const testContent = "Mathematics can seem daunting, but with consistent practice and clear conceptual understanding, any student can achieve top grades. Here are 5 battle-tested secrets from our expert home tutors.";
    const testCategory = "Study Tips";
    const testAuthor = "Dr. Anita Sharma";
    const testCover = "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80";

    const blog = await Blog.create({
      title: testTitle,
      slug: "mastering-mathematics-secrets-" + Date.now(),
      content: testContent,
      excerpt: "5 battle-tested math secrets from expert tutors.",
      category: testCategory,
      author: testAuthor,
      coverImage: testCover,
      published: true,
      readTime: "4 min read",
      tags: ["math", "study tips", "board exams"],
    });

    console.log("✅ Blog created successfully:", blog._id, blog.slug);

    console.log("2. Testing Public Published Blogs Query...");
    const publicBlogs = await Blog.find({ published: true }).sort({ createdAt: -1 });
    console.log(`✅ Found ${publicBlogs.length} published blogs.`);

    console.log("3. Testing Blog Retrieval by Slug...");
    const fetchedBlog = await Blog.findOne({ slug: blog.slug });
    if (fetchedBlog && fetchedBlog.title === testTitle) {
      console.log("✅ Blog retrieved cleanly by slug!");
    } else {
      console.error("❌ Blog retrieval by slug failed!");
    }

    console.log("4. Testing Toggle Unpublish...");
    fetchedBlog.published = false;
    await fetchedBlog.save();

    const publicBlogsAfterUnpublish = await Blog.find({ published: true });
    const isPresent = publicBlogsAfterUnpublish.some((b) => b._id.toString() === blog._id.toString());
    if (!isPresent) {
      console.log("✅ Unpublished blog correctly hidden from public query!");
    } else {
      console.error("❌ Unpublished blog still visible in public query!");
    }

    console.log("5. Cleanup test record...");
    await Blog.findByIdAndDelete(blog._id);
    console.log("✅ Cleanup complete.");

    process.exit(0);
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  }
}

testBlogFlow();
