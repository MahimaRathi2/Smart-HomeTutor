
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const seedAdminAccount = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "useradmin2005@gmail.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const adminPassword = process.env.ADMIN_PASSWORD || "Admin@HomeTutor2026!";
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      await User.create({
        name: "mahi Chaudhary",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        isVerified: true,
        walletBalance: 0,
        referralCode: "ADMIN-2026",
      });

      console.log(`✅ Default Admin Account Initialized (${adminEmail})`);
    } else {
      if (existingAdmin.role !== "admin" || !existingAdmin.isVerified) {
        existingAdmin.role = "admin";
        existingAdmin.isVerified = true;
        await existingAdmin.save();
      }
    }
  } catch (err) {
    console.error("Admin Account Seed Error:", err.message);
  }
};

module.exports = seedAdminAccount;
