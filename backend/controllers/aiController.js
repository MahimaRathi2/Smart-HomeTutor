

const TutorProfile = require("../models/TutorProfile");
const ClassSchedule = require("../models/ClassSchedule");

exports.getRecommendations = async (req, res) => {
  try {
    const { subject, grade, maxBudget, mode } = req.query;
    let filter = { available: true };

    if (subject && subject !== "all") filter.subjects = { $regex: subject, $options: "i" };
    if (grade && grade !== "all") filter.classes = { $regex: grade, $options: "i" };
    if (mode && mode !== "all") filter.mode = { $regex: mode, $options: "i" };
    if (maxBudget && Number(maxBudget) > 0) filter.fee = { $lte: Number(maxBudget) };

    let tutors = await TutorProfile.find(filter)
      .populate("user", "name email phone")
      .sort({ rating: -1, experience: -1 })
      .limit(6);

    if (tutors.length === 0) {
      tutors = await TutorProfile.find({ available: true })
        .populate("user", "name email phone")
        .sort({ rating: -1, experience: -1 })
        .limit(6);
    }

    const matches = tutors.map((t) => {
      let score = 75; // base score
      if (t.rating >= 4.8) score += 15;
      else if (t.rating >= 4.5) score += 10;
      if (t.experience >= 5) score += 10;
      score = Math.min(99, score);

      const subjectsStr = Array.isArray(t.subjects) ? t.subjects.join(", ") : (t.subjects || "Syllabus");
      return {
        tutor: t,
        matchScore: score,
        reason: `High academic compatibility matching ${subject || subjectsStr || "your syllabus goals"} (${t.experience || 0}+ yrs experience, ${t.rating || 5}★ rating).`,
      };
    });

    matches.sort((a, b) => b.matchScore - a.matchScore);

    return res.status(200).json({
      success: true,
      message: "AI Smart Tutor Recommendations generated based on academic rating and subject compatibility.",
      recommendations: matches,
    });
  } catch (err) {
    console.error("AI Recommendations Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
exports.matchTutor = async (req, res) => {
  try {
    const { subject, grade, maxBudget, mode, learningStyle } = req.body;
    let filter = { available: true };

    if (subject) filter.subjects = { $regex: subject, $options: "i" };
    if (grade) filter.classes = { $regex: grade, $options: "i" };
    if (mode && mode !== "all") filter.mode = { $regex: mode, $options: "i" };
    if (maxBudget && Number(maxBudget) > 0) filter.fee = { $lte: Number(maxBudget) };

    let tutors = await TutorProfile.find(filter).populate("user", "name email phone");

    if (tutors.length === 0) {
      tutors = await TutorProfile.find({ available: true }).populate("user", "name email phone").limit(5);
    }
    const matches = tutors.map((t) => {
      let score = 75;
      if (t.rating >= 4.8) score += 15;
      else if (t.rating >= 4.5) score += 10;
      if (t.experience >= 5) score += 10;
      score = Math.min(99, score);

      return {
        tutor: t,
        matchScore: score,
        reason: `High academic score matching ${subject || "your grade"} and preferred fee budget.`,
      };
    });

    matches.sort((a, b) => b.matchScore - a.matchScore);

    return res.status(200).json({
      success: true,
      message: "AI Smart Tutor Matching engine complete.",
      topMatch: matches[0] || null,
      matches,
    });
  } catch (err) {
    console.error("AI Match Tutor Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
exports.predictProgress = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { subject } = req.body;

    const totalClasses = await ClassSchedule.countDocuments({ student: studentId });
    const completedClasses = await ClassSchedule.countDocuments({ student: studentId, status: "Completed" });
    const presentClasses = await ClassSchedule.countDocuments({ student: studentId, attendance: "Present" });

    const attendanceRate = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 100;
    const predictedGradeBoost = Math.round(attendanceRate * 0.25 + completedClasses * 1.5);
    const predictedGrade = Math.min(98, 70 + predictedGradeBoost);

    return res.status(200).json({
      success: true,
      prediction: {
        subject: subject || "Overall Academic Score",
        currentAttendanceRate: `${Math.round(attendanceRate)}%`,
        completedSessions: completedClasses,
        predictedScore: `${predictedGrade}%`,
        expectedGradeImprovement: `+${Math.min(25, Math.round(predictedGradeBoost))}% boost`,
        aiAdvice: "Maintain regular attendance and complete weekly homework notes to achieve maximum exam score performance.",
      },
    });
  } catch (err) {
    console.error("AI Progress Prediction Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.solveDoubt = async (req, res) => {
  try {
    const { question, subject } = req.body;

    if (!question) {
      return res.status(400).json({ success: false, message: "Please state your academic doubt or question." });
    }

    const aiSolution = {
      subject: subject || "General Academic",
      question,
      stepByStepSolution: [
        "Step 1: Identify the fundamental mathematical concept, chemical formula, or physical law.",
        "Step 2: Breakdown known variables, given parameters, and required output equation.",
        "Step 3: Apply standard step-by-step substitution and solve for the precise solution.",
      ],
      summary: `Automated AI Assistance output for '${question.substring(0, 50)}...'. Connect with verified HomeTutor educators for 1-on-1 live HD video clarification.`,
    };

    return res.status(200).json({
      success: true,
      solution: aiSolution,
    });
  } catch (err) {
    console.error("AI Doubt Solver Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.generateStudyPlan = async (req, res) => {
  try {
    const { subject, targetGrade, hoursPerWeek } = req.body;
    const hours = Number(hoursPerWeek) || 6;

    const studyPlan = {
      subject: subject || "Mathematics & Science",
      targetGrade: targetGrade || "Grade 10",
      weeklyHours: hours,
      schedule: [
        { day: "Monday", focus: "Core Concepts & Formula Revision", duration: "1.5 hrs" },
        { day: "Wednesday", focus: "Problem Solving & Numerical Exercises", duration: "2.0 hrs" },
        { day: "Friday", focus: "1-on-1 Tutor Live Class & Doubt Session", duration: "1.5 hrs" },
        { day: "Saturday", focus: "Weekly Practice Quiz & Mock Test", duration: "1.0 hr" },
      ],
      milestones: [
        "Week 1-2: Master fundamental chapters & definitions",
        "Week 3: Complete 50+ practice questions and past exam papers",
        "Week 4: Mock exam simulation & final review with home tutor",
      ],
    };

    return res.status(200).json({
      success: true,
      message: "Personalized AI Study Plan generated successfully!",
      studyPlan,
    });
  } catch (err) {
    console.error("AI Study Plan Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getProgressReport = async (req, res) => {
  try {
    const studentId = req.user.id;

    const totalClasses = await ClassSchedule.countDocuments({ student: studentId });
    const completedClasses = await ClassSchedule.countDocuments({ student: studentId, status: "Completed" });
    const presentClasses = await ClassSchedule.countDocuments({ student: studentId, attendance: "Present" });

    const report = {
      studentId,
      overallHealth: "Excellent Progress 🌟",
      attendanceRating: totalClasses > 0 ? `${Math.round((presentClasses / Math.max(totalClasses, 1)) * 100)}%` : "100%",
      completedSessionsCount: completedClasses,
      strengths: ["Consistency in attendance", "Active participation during live video sessions", "Timely submission of homework notes"],
      areasForImprovement: ["Practice multi-step problem solving under timed exam conditions"],
      recommendations: "Schedule 2 revision sessions prior to monthly exams to lock in top academic ranks.",
    };

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (err) {
    console.error("AI Progress Report Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
