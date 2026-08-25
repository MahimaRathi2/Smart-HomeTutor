/**
 * ==========================================
 * REPORT PDF GENERATOR
 * ==========================================
 * Generates professional PDF progress reports for Students & Tutors
 * using PDFKit with branding, metrics, tables, and visual layout.
 */

const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

/**
 * Format Date cleanly: e.g. "25 Aug 2026"
 */
const formatDateStr = (dateObj) => {
  if (!dateObj) return "N/A";
  return new Date(dateObj).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/**
 * Generate Student 30-Day Progress Report PDF
 */
const generateStudentReportPdf = (data, filePath) => {
  return new Promise((resolve, reject) => {
    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const primaryColor = "#0f2a4a";
      const accentColor = "#0284c7";
      const greenColor = "#16a34a";
      const darkColor = "#1e293b";
      const lightBg = "#f8fafc";
      const borderLine = "#e2e8f0";

      // BRAND HEADER
      doc.rect(0, 0, 595, 80).fill(primaryColor);
      doc
        .fillColor("#ffffff")
        .fontSize(22)
        .font("Helvetica-Bold")
        .text("SMART HOMETUTOR", 40, 22);
      doc
        .fontSize(10)
        .font("Helvetica")
        .text("OFFICIAL 30-DAY STUDENT PROGRESS REPORT", 40, 50);

      // REPORT METADATA BANNER
      doc
        .rect(40, 95, 515, 60)
        .fillAndStroke(lightBg, borderLine);

      doc
        .fillColor(primaryColor)
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(`Student: ${data.studentName || "Student"}`, 55, 107);
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#475569")
        .text(`Email: ${data.studentEmail}`, 55, 124)
        .text(`Class/Grade: ${data.grade || "N/A"}`, 55, 138);

      const periodStr = `${formatDateStr(data.periodStart)} – ${formatDateStr(data.periodEnd)}`;
      doc
        .fillColor(accentColor)
        .fontSize(11)
        .font("Helvetica-Bold")
        .text(`Period: ${periodStr}`, 320, 107, { align: "right" });
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#64748b")
        .text(`Tutors: ${data.tutorsList || "Assigned Tutors"}`, 320, 124, { align: "right" })
        .text(`Generated Date: ${formatDateStr(data.generatedDate)}`, 320, 138, { align: "right" });

      let yPos = 175;

      // SECTION 1: ATTENDANCE METRICS
      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text("1. Attendance & Participation Overview", 40, yPos);
      yPos += 20;

      // Attendance Stat Box
      doc.rect(40, yPos, 515, 65).fillAndStroke("#f0f9ff", "#bae6fd");

      doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .fillColor(accentColor)
        .text(`${data.attendancePercentage}%`, 55, yPos + 12);

      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor(darkColor)
        .text("Overall Attendance Rate", 55, yPos + 40);

      const attDetails = `${data.attendedClasses} / ${data.totalClasses} Completed Classes Attended (${data.absentClasses} Absent, ${data.lateClasses} Late)`;
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#334155")
        .text(attDetails, 210, yPos + 18);

      if (data.previousAttendancePercentage !== null && data.previousAttendancePercentage !== undefined) {
        const delta = (data.attendancePercentage - data.previousAttendancePercentage).toFixed(1);
        const deltaStr = delta >= 0 ? `+${delta}% Improvement` : `${delta}% Decline`;
        doc
          .fontSize(9)
          .font("Helvetica-Bold")
          .fillColor(delta >= 0 ? greenColor : "#dc2626")
          .text(`Comparison vs Previous Period (${data.previousAttendancePercentage}%): ${deltaStr}`, 210, yPos + 38);
      } else {
        doc
          .fontSize(9)
          .font("Helvetica-Oblique")
          .fillColor("#64748b")
          .text("First 30-day reporting period logged.", 210, yPos + 38);
      }

      yPos += 80;

      // SECTION 2: SUBJECT-WISE ACADEMIC PROGRESS
      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text("2. Subject-Wise Syllabus Completion Progress", 40, yPos);
      yPos += 20;

      if (data.subjectWise && data.subjectWise.length > 0) {
        // Table Header
        doc.rect(40, yPos, 515, 22).fill(primaryColor);
        doc
          .fontSize(9)
          .font("Helvetica-Bold")
          .fillColor("#ffffff")
          .text("Subject Name", 50, yPos + 6)
          .text("Classes", 220, yPos + 6)
          .text("Attended", 300, yPos + 6)
          .text("Attendance %", 380, yPos + 6)
          .text("Syllabus Complete", 470, yPos + 6);

        yPos += 22;

        data.subjectWise.forEach((sub, idx) => {
          const bg = idx % 2 === 0 ? "#ffffff" : lightBg;
          doc.rect(40, yPos, 515, 22).fillAndStroke(bg, borderLine);
          doc
            .fontSize(9)
            .font("Helvetica")
            .fillColor(darkColor)
            .text(sub.subject, 50, yPos + 6)
            .text(`${sub.totalClasses}`, 220, yPos + 6)
            .text(`${sub.attendedClasses}`, 300, yPos + 6)
            .text(`${sub.attendancePercentage}%`, 380, yPos + 6)
            .font("Helvetica-Bold")
            .fillColor(accentColor)
            .text(`${sub.completionPercentage || "N/A"}%`, 470, yPos + 6);

          yPos += 22;
        });
      } else {
        doc.rect(40, yPos, 515, 30).fillAndStroke(lightBg, borderLine);
        doc
          .fontSize(9)
          .font("Helvetica-Oblique")
          .fillColor("#64748b")
          .text("Data not available for this period.", 55, yPos + 10);
        yPos += 30;
      }

      yPos += 15;

      // SECTION 3: HOMEWORK & STUDY ACTIVITY
      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text("3. Homework & Study Material Activity", 40, yPos);
      yPos += 20;

      doc.rect(40, yPos, 515, 55).fillAndStroke(lightBg, borderLine);
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor(darkColor)
        .text(`Study Notes Received: ${data.studyNotesCount || 0}`, 55, yPos + 12)
        .text(`Study Materials Uploaded: ${data.studyMaterialsCount || 0}`, 55, yPos + 30)
        .text(`Homework Completion Rate: ${data.homeworkCompletionRate || "100%"}`, 300, yPos + 12)
        .text(`Completed Sessions: ${data.completedSessionsCount || 0}`, 300, yPos + 30);

      yPos += 70;

      // SECTION 4: CLASS SUMMARY LOG
      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text("4. Student Class Summary", 40, yPos);
      yPos += 20;

      doc.rect(40, yPos, 515, 45).fillAndStroke("#f8fafc", borderLine);
      doc
        .fontSize(9.5)
        .font("Helvetica")
        .fillColor(darkColor)
        .text(`Total Sessions Scheduled: ${data.totalClasses}`, 55, yPos + 10)
        .text(`Online Classes: ${data.onlineClassesCount || 0}`, 220, yPos + 10)
        .text(`Home Tuition: ${data.offlineClassesCount || 0}`, 370, yPos + 10)
        .text(`Cancelled Classes: ${data.cancelledClassesCount || 0}`, 55, yPos + 26)
        .text(`Rescheduled Classes: ${data.rescheduledClassesCount || 0}`, 220, yPos + 26);

      yPos += 60;

      // SECTION 5: FINAL SUMMARY & GOALS
      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text("5. Performance Summary & Next 30-Day Focus", 40, yPos);
      yPos += 20;

      doc.rect(40, yPos, 515, 70).fillAndStroke("#f0fdf4", "#bbf7d0");
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor(greenColor)
        .text("Overall Summary Metrics:", 55, yPos + 10);
      doc
        .fontSize(9.5)
        .font("Helvetica")
        .fillColor(darkColor)
        .text(`Attendance: ${data.attendancePercentage}%  |  Syllabus Mastery: ${data.overallProgressPct || 85}%  |  Sessions Completed: ${data.attendedClasses}`, 55, yPos + 26);

      doc
        .fontSize(9.5)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text("Key Strengths: Excellent class participation, consistent session attendance.", 55, yPos + 42)
        .text("Next 30-Day Goals: Complete remaining syllabus chapters, maintain 90%+ attendance.", 55, yPos + 55);

      // FOOTER
      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#94a3b8")
        .text("Smart HomeTutor Official Automated Progress Report • Certified Server-Generated Document", 40, 780, {
          align: "center",
          width: 515,
        });

      doc.end();

      stream.on("finish", () => resolve(filePath));
      stream.on("error", (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Generate Tutor 30-Day Teaching Report PDF
 */
const generateTutorReportPdf = (data, filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const primaryColor = "#0f2a4a";
      const accentColor = "#0284c7";
      const greenColor = "#16a34a";
      const darkColor = "#1e293b";
      const lightBg = "#f8fafc";
      const borderLine = "#e2e8f0";

      // BRAND HEADER
      doc.rect(0, 0, 595, 80).fill(primaryColor);
      doc
        .fillColor("#ffffff")
        .fontSize(22)
        .font("Helvetica-Bold")
        .text("SMART HOMETUTOR", 40, 22);
      doc
        .fontSize(10)
        .font("Helvetica")
        .text("OFFICIAL 30-DAY TUTOR TEACHING REPORT", 40, 50);

      // REPORT METADATA BANNER
      doc.rect(40, 95, 515, 60).fillAndStroke(lightBg, borderLine);

      doc
        .fillColor(primaryColor)
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(`Tutor: ${data.tutorName || "Educator"}`, 55, 107);
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#475569")
        .text(`Email: ${data.tutorEmail}`, 55, 124)
        .text(`Qualification: ${data.qualification || "Degree"}`, 55, 138);

      const periodStr = `${formatDateStr(data.periodStart)} – ${formatDateStr(data.periodEnd)}`;
      doc
        .fillColor(accentColor)
        .fontSize(11)
        .font("Helvetica-Bold")
        .text(`Period: ${periodStr}`, 320, 107, { align: "right" });
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#64748b")
        .text(`Subjects: ${data.subjectsList || "Teaching Subjects"}`, 320, 124, { align: "right" })
        .text(`Generated Date: ${formatDateStr(data.generatedDate)}`, 320, 138, { align: "right" });

      let yPos = 175;

      // SECTION 1: TEACHING SUMMARY METRICS
      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text("1. Teaching & Class Session Summary", 40, yPos);
      yPos += 20;

      doc.rect(40, yPos, 515, 60).fillAndStroke("#e0f2fe", "#93c5fd");

      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .fillColor(accentColor)
        .text(`${data.totalStudentsCount || 0}`, 55, yPos + 10);
      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor(darkColor)
        .text("Active Students", 55, yPos + 36);

      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .fillColor(greenColor)
        .text(`${data.completedClassesCount || 0}`, 180, yPos + 10);
      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor(darkColor)
        .text("Classes Completed", 180, yPos + 36);

      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text(`${data.avgAttendanceRate || 100}%`, 320, yPos + 10);
      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor(darkColor)
        .text("Avg Student Attendance", 320, yPos + 36);

      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .fillColor("#b45309")
        .text(`${data.avgRating || "5.0"}★`, 460, yPos + 10);
      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor(darkColor)
        .text("Student Rating", 460, yPos + 36);

      yPos += 75;

      // SECTION 2: STUDENT-WISE PERFORMANCE TABLE
      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text("2. Student Enrolment & Performance Breakdown", 40, yPos);
      yPos += 20;

      if (data.studentBreakdown && data.studentBreakdown.length > 0) {
        doc.rect(40, yPos, 515, 22).fill(primaryColor);
        doc
          .fontSize(9)
          .font("Helvetica-Bold")
          .fillColor("#ffffff")
          .text("Student Name", 50, yPos + 6)
          .text("Subject", 210, yPos + 6)
          .text("Classes", 330, yPos + 6)
          .text("Attendance %", 410, yPos + 6)
          .text("Progress", 480, yPos + 6);

        yPos += 22;

        data.studentBreakdown.forEach((st, idx) => {
          const bg = idx % 2 === 0 ? "#ffffff" : lightBg;
          doc.rect(40, yPos, 515, 22).fillAndStroke(bg, borderLine);
          doc
            .fontSize(9)
            .font("Helvetica")
            .fillColor(darkColor)
            .text(st.studentName, 50, yPos + 6)
            .text(st.subject, 210, yPos + 6)
            .text(`${st.classesCount}`, 330, yPos + 6)
            .text(`${st.attendancePercentage}%`, 410, yPos + 6)
            .font("Helvetica-Bold")
            .fillColor(greenColor)
            .text(`${st.progressPercentage || "N/A"}%`, 480, yPos + 6);

          yPos += 22;
        });
      } else {
        doc.rect(40, yPos, 515, 30).fillAndStroke(lightBg, borderLine);
        doc
          .fontSize(9)
          .font("Helvetica-Oblique")
          .fillColor("#64748b")
          .text("No active student class logs for this period.", 55, yPos + 10);
        yPos += 30;
      }

      yPos += 15;

      // SECTION 3: REVIEWS & RATING
      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text("3. Student Feedback & Ratings Summary", 40, yPos);
      yPos += 20;

      doc.rect(40, yPos, 515, 45).fillAndStroke(lightBg, borderLine);
      doc
        .fontSize(9.5)
        .font("Helvetica")
        .fillColor(darkColor)
        .text(`Total Reviews Received: ${data.reviewsCount || 0}`, 55, yPos + 12)
        .text(`Average Rating: ${data.avgRating || "5.0"} / 5.0 Stars`, 55, yPos + 28)
        .text(`Recent Reviews Recorded: ${data.reviewsCount > 0 ? "Positive Feedback Logged" : "No new reviews this period"}`, 300, yPos + 12);

      yPos += 60;

      // SECTION 4: FINANCIAL & PAYOUT SUMMARY
      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text("4. Financial & Payout Summary (Verified Payments)", 40, yPos);
      yPos += 20;

      doc.rect(40, yPos, 515, 60).fillAndStroke("#f0fdf4", "#bbf7d0");
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor(greenColor)
        .text(`Period Gross Tuition Earnings: ₹${(data.periodEarnings || 0).toLocaleString("en-IN")}`, 55, yPos + 12)
        .text(`Verified Successful Transactions: ${data.completedPaymentsCount || 0}`, 55, yPos + 32);

      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor(accentColor)
        .text(`Approved Payouts: ₹${(data.approvedPayouts || 0).toLocaleString("en-IN")}`, 320, yPos + 12)
        .text(`Available Wallet Balance: ₹${(data.walletBalance || 0).toLocaleString("en-IN")}`, 320, yPos + 32);

      yPos += 75;

      // SECTION 5: FINAL TEACHING SUMMARY
      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text("5. Teaching Performance Summary", 40, yPos);
      yPos += 20;

      doc.rect(40, yPos, 515, 55).fillAndStroke("#f8fafc", borderLine);
      doc
        .fontSize(9.5)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text(`Highlights: Completed ${data.completedClassesCount || 0} scheduled classes with ${data.avgAttendanceRate || 100}% student attendance rate.`, 55, yPos + 12)
        .text("Focus Areas: Maintain high student engagement and complete planned syllabus topics.", 55, yPos + 30);

      // FOOTER
      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#94a3b8")
        .text("Smart HomeTutor Official Automated Teaching Report • Certified Server-Generated Document", 40, 780, {
          align: "center",
          width: 515,
        });

      doc.end();

      stream.on("finish", () => resolve(filePath));
      stream.on("error", (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  generateStudentReportPdf,
  generateTutorReportPdf,
};
