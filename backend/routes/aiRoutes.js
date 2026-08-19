/**
 * ==========================================
 * AI ROUTES
 * ==========================================
 * Endpoints for AI Tutor Recommendations, Smart Matching, Progress Prediction,
 * Doubt Assistance, Study Plans, and Progress Reports.
 */

const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const { requireAuth } = require("../middleware/authMiddleware");

router.get("/recommend-tutors", requireAuth, aiController.getRecommendations);
router.post("/match-tutor", requireAuth, aiController.matchTutor);
router.post("/progress-prediction", requireAuth, aiController.predictProgress);
router.post("/solve-doubt", requireAuth, aiController.solveDoubt);
router.post("/study-plan", requireAuth, aiController.generateStudyPlan);
router.get("/progress-report", requireAuth, aiController.getProgressReport);

module.exports = router;
