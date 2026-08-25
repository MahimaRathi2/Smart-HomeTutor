/**
 * ==========================================
 * REPORT CONTROLLER
 * ==========================================
 * Express controller for manually triggering 30-day progress report
 * scheduler checks, inspecting report history, and downloading PDFs.
 */

const path = require("path");
const fs = require("fs");
const ProgressReport = require("../models/ProgressReport");
const { runReportScheduler } = require("../services/reportScheduler");

/**
 * @desc   Manual trigger / test mode check for 30-day progress reports
 * @route  POST /api/reports/trigger-check
 * @access Private (Admin / Test Mode)
 */
exports.triggerReportCheck = async (req, res) => {
  try {
    const { mockDaysAhead, userId } = req.body;
    const daysAhead = Number(mockDaysAhead) || 0;

    console.log(`⚡ [REPORT CONTROLLER] Manual report check triggered with mockDaysAhead = ${daysAhead}`);

    const result = await runReportScheduler({
      mockDaysAhead: daysAhead,
      forceUserId: userId || null,
    });

    return res.status(200).json({
      success: true,
      message: `30-Day Report Check completed successfully for mockDaysAhead = ${daysAhead}!`,
      processedCount: result.processedCount,
      failedCount: result.failedCount,
      reports: result.reports,
    });
  } catch (err) {
    console.error("Trigger Report Check Error:", err);
    return res.status(500).json({ success: false, message: "Server Error triggering report check." });
  }
};

/**
 * @desc   Get user's 30-day progress report history
 * @route  GET /api/reports/history
 * @access Private (Student / Tutor / Admin)
 */
exports.getReportHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let filter = { user: userId };
    if (userRole === "admin" && req.query.studentId) {
      filter = { user: req.query.studentId };
    }

    const reports = await ProgressReport.find(filter)
      .populate("user", "name email role")
      .sort({ periodEnd: -1 });

    return res.status(200).json({
      success: true,
      reports,
    });
  } catch (err) {
    console.error("Get Report History Error:", err);
    return res.status(500).json({ success: false, message: "Server Error fetching report history." });
  }
};

/**
 * @desc   Download specific PDF progress report file
 * @route  GET /api/reports/download/:reportId
 * @access Private
 */
exports.downloadReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const report = await ProgressReport.findById(reportId);
    if (!report) {
      return res.status(404).json({ success: false, message: "Progress report record not found." });
    }

    // Security: Student/tutor can only download their own report (or admin)
    if (userRole !== "admin" && report.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden: You can only download your own progress reports." });
    }

    const relativePath = (report.pdfPath || "").replace(/^\//, "");
    const fullPath = path.join(__dirname, "../..", relativePath);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ success: false, message: "PDF report file not found on server storage." });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${report.pdfFilename || "Report.pdf"}"`);
    return res.sendFile(fullPath);
  } catch (err) {
    console.error("Download Report Error:", err);
    return res.status(500).json({ success: false, message: "Server Error downloading report." });
  }
};
