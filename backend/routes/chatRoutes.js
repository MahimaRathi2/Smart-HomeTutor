const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { requireAuth } = require("../middleware/authMiddleware");
const chatUpload = require("../utils/chatUploadMiddleware");

router.post("/send", requireAuth, chatController.sendMessage);
router.post("/upload", requireAuth, chatUpload, chatController.uploadFile);
router.get("/conversations", requireAuth, chatController.getConversations);
router.get("/messages/:otherUserId", requireAuth, chatController.getMessages);
router.patch("/seen/:otherUserId", requireAuth, chatController.markAsSeen);

module.exports = router;
