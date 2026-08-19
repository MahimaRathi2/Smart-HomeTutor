const Newsletter = require("../models/Newsletter");

exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await Newsletter.findOne({ email: normalizedEmail });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "You are already subscribed to our newsletter!",
      });
    }

    await Newsletter.create({ email: normalizedEmail });

    return res.status(201).json({
      success: true,
      message: "Thank you for subscribing to Smart HomeTutor newsletter!",
    });
  } catch (err) {
    console.error("Newsletter Subscription Error:", err);
    return res.status(500).json({
      success: false,
      message: "Subscription failed. Please try again.",
    });
  }
};
