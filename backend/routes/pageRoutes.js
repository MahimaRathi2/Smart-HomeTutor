const express = require("express");
const router = express.Router();
const TutorProfile = require("../models/TutorProfile");
const Review = require("../models/Review");

router.get("/tutor/:id", async (req, res) => {
  try {
    const tutor = await TutorProfile.findById(req.params.id).populate("user");

    if (!tutor) {
      return res.status(404).send("Tutor Not Found");
    }

    const reviews = await Review.find({ tutorProfile: tutor._id })
      .populate("student", "name")
      .sort({ createdAt: -1 });

    res.render("tutor-profile", { tutor, reviews });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

module.exports = router;