/**
 * ==========================================
 * COUPON ROUTES
 * ==========================================
 * Express endpoints for coupon application.
 */

const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
const { requireAuth } = require("../middleware/authMiddleware");

router.post("/apply", requireAuth, couponController.applyCoupon);
router.post("/create", requireAuth, couponController.createCoupon);

module.exports = router;
