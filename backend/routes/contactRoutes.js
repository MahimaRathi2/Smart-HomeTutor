const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

router.post("/", contactController.submitContact);
router.get("/all", contactController.getContactMessages);

module.exports = router;
