const connectDB = require('../config/db');
const dotenv = require('dotenv');
dotenv.config();

const TutorProfile = require('../models/TutorProfile');
const adminController = require('../controllers/adminController');

async function testRejectFlow() {
  await connectDB();
  console.log("Testing Reject Button Workflow...");

  // 1. Create a pending tutor application
  const testApp = await TutorProfile.create({
    fullName: "Reject Test Tutor",
    email: "reject.test@edu.in",
    mobile: "9999988888",
    city: "Test City",
    registrationStatus: "Pending",
    verificationStatus: "Pending",
    verified: false,
  });

  console.log(`1. Created Pending Tutor Application ID=${testApp._id}`);

  // 2. Check pending documents list
  let pendingList = await TutorProfile.find({
    verificationStatus: { $nin: ["Approved", "Rejected"] },
    registrationStatus: { $nin: ["Approved", "Rejected"] },
  });
  console.log(`2. Current Pending Queue Count: ${pendingList.length}`);

  // 3. Simulate Reject API Call
  const mockReq = {
    params: { tutorProfileId: testApp._id.toString() },
    body: { status: "Rejected" },
    ip: "127.0.0.1",
  };
  const mockRes = {
    status: function (code) {
      this.statusCode = code;
      return this;
    },
    json: function (data) {
      this.responseData = data;
      return this;
    },
  };

  await adminController.verifyTutorDocument(mockReq, mockRes);
  console.log(`3. Reject API Response Code=${mockRes.statusCode}, Success=${mockRes.responseData.success}`);

  // 4. Verify MongoDB status
  const updatedApp = await TutorProfile.findById(testApp._id);
  console.log(`4. Updated MongoDB Application verificationStatus="${updatedApp.verificationStatus}", registrationStatus="${updatedApp.registrationStatus}"`);

  // 5. Verify removal from Pending Queue
  pendingList = await TutorProfile.find({
    verificationStatus: { $nin: ["Approved", "Rejected"] },
    registrationStatus: { $nin: ["Approved", "Rejected"] },
  });
  console.log(`5. Pending Queue Count after Reject: ${pendingList.length}`);

  // Cleanup test record
  await TutorProfile.findByIdAndDelete(testApp._id);
  console.log("6. Cleaned up test record.");

  if (updatedApp.verificationStatus === "Rejected" && mockRes.statusCode === 200) {
    console.log("✅ REJECT BUTTON WORKFLOW TEST PASSED!");
    process.exit(0);
  } else {
    console.error("❌ REJECT BUTTON TEST FAILED!");
    process.exit(1);
  }
}

testRejectFlow();
