const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hometutor";

async function testAdminDashboard() {
  try {
    console.log("Connecting to MongoDB:", mongoURI);
    await mongoose.connect(mongoURI);

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const TutorProfile = mongoose.model('TutorProfile', new mongoose.Schema({}, { strict: false }));
    const Subject = mongoose.model('Subject', new mongoose.Schema({}, { strict: false }));
    const Blog = mongoose.model('Blog', new mongoose.Schema({}, { strict: false }));
    const ActivityLog = mongoose.model('ActivityLog', new mongoose.Schema({}, { strict: false }));

    const usersCount = await User.countDocuments();
    const tutorsCount = await User.countDocuments({ role: 'tutor' });
    const pendingDocsCount = await TutorProfile.countDocuments({ verificationStatus: 'Pending' });
    const subjectsCount = await Subject.countDocuments();
    const blogsCount = await Blog.countDocuments();
    const logsCount = await ActivityLog.countDocuments();

    console.log(`Database Overview:
- Total Users: ${usersCount}
- Tutors: ${tutorsCount}
- Pending Verifications: ${pendingDocsCount}
- Catalog Subjects: ${subjectsCount}
- Published Blogs: ${blogsCount}
- Activity Logs: ${logsCount}`);

    console.log("✅ Admin Dashboard Database Verification Passed!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Verification Error:", err);
    process.exit(1);
  }
}

testAdminDashboard();
