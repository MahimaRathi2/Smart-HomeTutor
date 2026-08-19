const connectDB = require('../config/db');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const TutorProfile = require('../models/TutorProfile');
const adminController = require('../controllers/adminController');

async function testStatusLogicMatrix() {
  await connectDB();
  console.log("Testing Complete Status Matrix...");

  // Setup test accounts
  const vStudent = await User.create({ name: "V Student", email: "vstudent@test.com", password: "p", role: "student", isVerified: true });
  const uStudent = await User.create({ name: "U Student", email: "ustudent@test.com", password: "p", role: "student", isVerified: false });
  const vParent  = await User.create({ name: "V Parent", email: "vparent@test.com", password: "p", role: "parent", isVerified: true });
  const uParent  = await User.create({ name: "U Parent", email: "uparent@test.com", password: "p", role: "parent", isVerified: false });

  const pTutorUser = await User.create({ name: "Pending Tutor", email: "ptutor@test.com", password: "p", role: "tutor", isVerified: true });
  const aTutorUser = await User.create({ name: "Approved Tutor", email: "atutor@test.com", password: "p", role: "tutor", isVerified: true });
  const rTutorUser = await User.create({ name: "Rejected Tutor", email: "rtutor@test.com", password: "p", role: "tutor", isVerified: true });
  const noProfTutor = await User.create({ name: "No Profile Tutor", email: "nptutor@test.com", password: "p", role: "tutor", isVerified: true });

  const adminUser  = await User.create({ name: "Admin Test", email: "admintest@test.com", password: "p", role: "admin", isVerified: true });

  // Create linked profiles
  await TutorProfile.create({ user: pTutorUser._id, fullName: "Pending Tutor", email: "ptutor@test.com", verificationStatus: "Pending" });
  await TutorProfile.create({ user: aTutorUser._id, fullName: "Approved Tutor", email: "atutor@test.com", verificationStatus: "Approved" });
  await TutorProfile.create({ user: rTutorUser._id, fullName: "Rejected Tutor", email: "rtutor@test.com", verificationStatus: "Rejected" });

  // Query getAllUsers
  const mockReq = { query: { sort: 'latest' }, user: { id: 'admin-id' }, ip: '127.0.0.1' };
  const mockRes = { status: function(c) { this.statusCode = c; return this; }, json: function(d) { this.responseData = d; return this; } };

  await adminController.getAllUsers(mockReq, mockRes);
  const users = mockRes.responseData.users;

  const getStatus = (email) => users.find(u => u.email === email)?.status;

  console.log("1. Verified Student Status:", getStatus("vstudent@test.com"));
  console.log("2. Unverified Student Status:", getStatus("ustudent@test.com"));
  console.log("3. Verified Parent Status:", getStatus("vparent@test.com"));
  console.log("4. Unverified Parent Status:", getStatus("uparent@test.com"));
  console.log("5. Pending Tutor Status:", getStatus("ptutor@test.com"));
  console.log("6. Approved Tutor Status:", getStatus("atutor@test.com"));
  console.log("7. Rejected Tutor Status:", getStatus("rtutor@test.com"));
  console.log("8. No Profile Tutor Status:", getStatus("nptutor@test.com"));
  console.log("9. Admin Status:", getStatus("admintest@test.com"));

  // Cleanup test accounts
  const testIds = [vStudent._id, uStudent._id, vParent._id, uParent._id, pTutorUser._id, aTutorUser._id, rTutorUser._id, noProfTutor._id, adminUser._id];
  await User.deleteMany({ _id: { $in: testIds } });
  await TutorProfile.deleteMany({ email: { $in: ["ptutor@test.com", "atutor@test.com", "rtutor@test.com"] } });
  console.log("Cleaned up test accounts.");

  const allPassed =
    getStatus("vstudent@test.com") === "Active" &&
    getStatus("ustudent@test.com") === "Unverified" &&
    getStatus("vparent@test.com") === "Active" &&
    getStatus("uparent@test.com") === "Unverified" &&
    getStatus("ptutor@test.com") === "Pending" &&
    getStatus("atutor@test.com") === "Approved" &&
    getStatus("rtutor@test.com") === "Rejected" &&
    getStatus("nptutor@test.com") === "Active" &&
    getStatus("admintest@test.com") === "Active";

  if (allPassed) {
    console.log("✅ COMPLETE STATUS MATRIX TEST PASSED!");
    process.exit(0);
  } else {
    console.error("❌ MATRIX TEST FAILED!");
    process.exit(1);
  }
}

testStatusLogicMatrix();
