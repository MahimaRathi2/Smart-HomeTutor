

const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { requireAuth } = require("../middleware/authMiddleware");

router.post("/create-order", requireAuth, paymentController.createOrder);
router.post("/verify", requireAuth, paymentController.verifyPayment);
router.post("/fail", requireAuth, paymentController.recordFailedPayment);
router.post("/cancel", requireAuth, paymentController.recordCancelledPayment);
router.get("/history", requireAuth, paymentController.getPaymentHistory);

module.exports = router;
