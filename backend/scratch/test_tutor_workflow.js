const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const TutorProfile = require('../models/TutorProfile');
const Notification = require('../models/Notification');
const authController = require('../controllers/authController');
const tutorController = require('../controllers/tutorController');
const adminController = require('../controllers/adminController');
const { requireApprovedTutor } = require('../middleware/authMiddleware');

const mockReqRes = (body = {}, user = null, params = {}, query = {}) => {
  const req = {
    body,
    user,
    params,
    query,
    headers: { accept: 'application/json' },
    xhr: true,
    ip: '127.0.0.1',
    app: { get: () => null }
  };

  const res = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.data = data;
      return this;
    },
    cookie() {},
    clearCookie() {},
    redirect(url) {
      this.redirectUrl = url;
      return this;
    }
  };

  return { req, res };
};

async function runTests() {
  console.log('🚀 Starting Comprehensive Tutor Workflow Tests...\n');
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hometutor');

  const testEmail = `testtutor_${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  // =========================================================================
  // CASE 1: TUTOR SIGNUP & LOGIN (Unblocked, not_applied)
  // =========================================================================
  console.log('--- CASE 1: TUTOR SIGNUP ---');
  const signupReqRes = mockReqRes({
    name: 'Test Tutor Case1',
    email: testEmail,
    password: testPassword,
    role: 'tutor'
  });

  await authController.signup(signupReqRes.req, signupReqRes.res);
  console.log('Signup Status:', signupReqRes.res.statusCode, 'Data:', signupReqRes.res.data);

  // Directly verify OTP so we can test login
  const createdUser = await User.findOne({ email: testEmail });
  if (!createdUser) throw new Error('User creation failed!');
  console.log('Initial user.tutorStatus:', createdUser.tutorStatus);
  if (createdUser.tutorStatus !== 'not_applied') throw new Error('Initial tutorStatus should be not_applied!');
  
  createdUser.isVerified = true;
  await createdUser.save();

  // Test Login
  console.log('\n--- CASE 2: TUTOR LOGIN (Unblocked without approval) ---');
  const loginReqRes = mockReqRes({
    email: testEmail,
    password: testPassword,
    role: 'tutor'
  });
  await authController.login(loginReqRes.req, loginReqRes.res);
  console.log('Login Status:', loginReqRes.res.statusCode, 'User:', loginReqRes.res.data.user);
  if (loginReqRes.res.statusCode !== 200) throw new Error('Login failed!');
  if (loginReqRes.res.data.user.tutorStatus !== 'not_applied') throw new Error('tutorStatus should be not_applied on login!');

  // =========================================================================
  // CASE 5 (Part A): SECURITY CHECK - CALL PROTECTED API WHILE PENDING/NOT_APPLIED
  // =========================================================================
  console.log('\n--- CASE 5 (Part A): SECURITY CHECK (403 Expected) ---');
  const secReqRes1 = mockReqRes({}, { id: createdUser._id.toString(), role: 'tutor' });
  let nextCalled = false;
  await requireApprovedTutor(secReqRes1.req, secReqRes1.res, () => { nextCalled = true; });
  console.log('Protected route check result -> Status:', secReqRes1.res.statusCode, 'Response:', secReqRes1.res.data, 'Next Called:', nextCalled);
  if (secReqRes1.res.statusCode !== 403) throw new Error('Protected route should return 403 when tutorStatus is not_applied!');

  // =========================================================================
  // CASE 1 (Part B): BECOME A TUTOR FORM SUBMISSION
  // =========================================================================
  console.log('\n--- CASE 1 (Part B): SUBMIT BECOME A TUTOR APPLICATION ---');
  const appReqRes = mockReqRes({
    fullName: 'Test Tutor Case1',
    highestQualification: 'Master of Mathematics',
    subjectsYouTeach: ['Mathematics', 'Physics'],
    classesYouTeach: ['Class 11-12'],
    teachingMode: 'Online',
    expectedFee: 500,
    declarationAccepted: true
  }, { id: createdUser._id.toString(), role: 'tutor' });

  await tutorController.createTutorProfile(appReqRes.req, appReqRes.res);
  console.log('Application Submission Result:', appReqRes.res.statusCode, 'Data:', appReqRes.res.data);
  
  const updatedUserAfterApp = await User.findById(createdUser._id);
  console.log('Updated user.tutorStatus after application:', updatedUserAfterApp.tutorStatus);
  if (updatedUserAfterApp.tutorStatus !== 'pending') throw new Error('tutorStatus should be pending after application submission!');

  // =========================================================================
  // CASE 5 (Part B): SECURITY CHECK WHILE PENDING (403 Expected)
  // =========================================================================
  console.log('\n--- CASE 5 (Part B): SECURITY CHECK WHILE PENDING (403 Expected) ---');
  const secReqRes2 = mockReqRes({}, { id: createdUser._id.toString(), role: 'tutor' });
  nextCalled = false;
  await requireApprovedTutor(secReqRes2.req, secReqRes2.res, () => { nextCalled = true; });
  console.log('Protected route check while pending -> Status:', secReqRes2.res.statusCode, 'Next Called:', nextCalled);
  if (secReqRes2.res.statusCode !== 403) throw new Error('Protected route should return 403 when tutorStatus is pending!');

  // Find created TutorProfile
  const profile = await TutorProfile.findOne({ user: createdUser._id });
  if (!profile) throw new Error('TutorProfile document not found!');

  // =========================================================================
  // CASE 3: ADMIN APPROVES TUTOR
  // =========================================================================
  console.log('\n--- CASE 3: ADMIN APPROVES TUTOR ---');
  const adminApproveReqRes = mockReqRes({}, { id: 'admin123', role: 'admin' }, { id: profile._id.toString() });
  await adminController.verifyTutor(adminApproveReqRes.req, adminApproveReqRes.res);
  console.log('Admin Approve Status:', adminApproveReqRes.res.statusCode, 'Message:', adminApproveReqRes.res.data.message);

  const approvedUser = await User.findById(createdUser._id);
  console.log('Approved user.tutorStatus:', approvedUser.tutorStatus);
  if (approvedUser.tutorStatus !== 'approved') throw new Error('tutorStatus should be approved after Admin verification!');

  // Check notification for tutor
  const notifs = await Notification.find({ user: createdUser._id }).sort({ createdAt: -1 });
  console.log('Tutor Notifications count:', notifs.length);
  if (notifs.length === 0) throw new Error('No approval notification created for tutor!');
  console.log('Latest Notification Title:', notifs[0].title);
  console.log('Latest Notification Message:', notifs[0].message);
  if (notifs[0].title !== 'Tutor Application Approved') throw new Error('Notification title mismatch!');

  // =========================================================================
  // CASE 5 (Part C): SECURITY CHECK AFTER APPROVAL (Next() Expected)
  // =========================================================================
  console.log('\n--- CASE 5 (Part C): SECURITY CHECK AFTER APPROVAL ---');
  const secReqRes3 = mockReqRes({}, { id: createdUser._id.toString(), role: 'tutor' });
  nextCalled = false;
  await requireApprovedTutor(secReqRes3.req, secReqRes3.res, () => { nextCalled = true; });
  console.log('Protected route check after approval -> Next Called:', nextCalled);
  if (!nextCalled) throw new Error('requireApprovedTutor should call next() when tutorStatus is approved!');

  // =========================================================================
  // CASE 4: ADMIN REJECTS TUTOR
  // =========================================================================
  console.log('\n--- CASE 4: ADMIN REJECTS TUTOR ---');
  const adminRejectReqRes = mockReqRes({ status: 'Rejected' }, { id: 'admin123', role: 'admin' }, { tutorProfileId: profile._id.toString() });
  await adminController.verifyTutorDocument(adminRejectReqRes.req, adminRejectReqRes.res);
  console.log('Admin Reject Status:', adminRejectReqRes.res.statusCode, 'Message:', adminRejectReqRes.res.data.message);

  const rejectedUser = await User.findById(createdUser._id);
  console.log('Rejected user.tutorStatus:', rejectedUser.tutorStatus);
  if (rejectedUser.tutorStatus !== 'rejected') throw new Error('tutorStatus should be rejected!');

  const rejectNotifs = await Notification.find({ user: createdUser._id }).sort({ createdAt: -1 });
  console.log('Latest Notification after rejection Title:', rejectNotifs[0].title);
  console.log('Latest Notification after rejection Message:', rejectNotifs[0].message);
  if (rejectNotifs[0].title !== 'Tutor Application Rejected') throw new Error('Rejection notification title mismatch!');

  // Clean up test user & profile
  await User.findByIdAndDelete(createdUser._id);
  await TutorProfile.findByIdAndDelete(profile._id);
  await Notification.deleteMany({ user: createdUser._id });

  console.log('\n✅ ALL 6 TEST CASES PASSED SUCCESSFULLY!');
  process.exit(0);
}

runTests().catch(err => {
  console.error('\n❌ Test Error:', err);
  process.exit(1);
});
