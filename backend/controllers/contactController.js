const ContactMessage = require("../models/ContactMessage");
const { createAdminNotification } = require("../utils/notificationHelper");

exports.submitContact = async (req, res) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body;

    if (!firstName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide first name, email, and message.",
      });
    }
    const newMessage = await ContactMessage.create({
      firstName,
      lastName: lastName || "",
      email: email.toLowerCase().trim(),
      subject: subject || "General Inquiry",
      message,
    });

    const senderName = `${firstName} ${lastName || ""}`.trim();
    await createAdminNotification({
      title: "New Contact Enquiry",
      message: `${senderName} (${email.toLowerCase().trim()}) submitted a new contact enquiry regarding ${subject || "General Inquiry"}.`,
      sourceUser: req.user ? req.user.id : null,
      sourceRole: req.user ? req.user.role : "student",
      type: "enquiry",
      actionUrl: "/dashboard/admin?tab=overview",
      app: req.app,
    });

    return res.status(201).json({
      success: true,
      message: "Your message has been sent successfully. We will get back to you soon!",
      data: newMessage,
    });
  } catch (err) {
    console.error("Contact Form Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again.",
    });
  }
};

exports.getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (err) {
    console.error("Get Contact Messages Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
