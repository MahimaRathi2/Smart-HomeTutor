

const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { requireAuth } = require("../middleware/authMiddleware");

router.post("/create-order", requireAuth, paymentController.createOrder);
router.post("/verify", requireAuth, paymentController.verifyPayment);
router.get("/history", requireAuth, paymentController.getPaymentHistory);

module.exports = router;
