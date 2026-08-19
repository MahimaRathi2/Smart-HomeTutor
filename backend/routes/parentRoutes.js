/**
 * ==========================================
 * PARENT ROUTES
 * ==========================================
 * Router endpoints for parent portal actions.
 */

const express = require("express");
const router = express.Router();
const parentController = require("../controllers/parentController");
const { requireAuth, authorizeRole } = require("../middleware/authMiddleware");

router.post("/child", requireAuth, authorizeRole("parent"), parentController.addChild);
router.get("/children", requireAuth, authorizeRole("parent"), parentController.getChildren);
router.get("/child-certificates", requireAuth, authorizeRole("parent"), parentController.getChildCertificates);
router.post("/pay-invoice", requireAuth, authorizeRole("parent"), parentController.payInvoice);
router.get("/dashboard-stats", requireAuth, authorizeRole("parent"), parentController.getParentDashboardStats);

module.exports = router;
