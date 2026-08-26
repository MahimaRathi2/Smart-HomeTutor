const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const User = require("../models/User");
const TutorProfile = require("../models/TutorProfile");
const BookingRequest = require("../models/BookingRequest");
const ClassSchedule = require("../models/ClassSchedule");

const studentController = require("../controllers/studentController");
const adminController = require("../controllers/adminController");
const tutorController = require("../controllers/tutorController");

const mockReqRes = (body = {}, user = {}, params = {}, query = {}) => {
  const req = {
    body,
    user,
    params,
    query,
    ip: "127.0.0.1",
    app: { get: () => null },
  };

  const res = {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(obj) {
      this.data = obj;
      return this;
    },
  };

  return { req, res };
};

async function runDemoWorkflowTest() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smarthometutor";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for Demo Class Workflow Test.");

    // Clean up test data
    const testStudentEmail = "test_demo_student_wf@test.com";
    const testTutorEmail = "test_demo_tutor_wf@test.com";

    await User.deleteMany({ email: { $in: [testStudentEmail, testTutorEmail] } });

    // 1. Create Test Student & Tutor Users
    const studentUser = await User.create({
      name: "Demo Workflow Student",
      email: testStudentEmail,
      password: "password123",
      role: "student",
      isVerified: true,
    });

    const tutorUser = await User.create({
      name: "Demo Workflow Tutor",
      email: testTutorEmail,
      password: "password123",
      role: "tutor",
      tutorStatus: "approved",
      isVerified: true,
    });

    const tutorProfile = await TutorProfile.create({
      user: tutorUser._id,
      fullName: tutorUser.name,
      email: tutorUser.email,
      primarySubject: "Advanced Physics",
      subjects: ["Physics", "Mathematics"],
      fee: 800,
      verificationStatus: "Approved",
      registrationStatus: "Approved",
      isApproved: true,
    });

    await BookingRequest.deleteMany({ student: studentUser._id });
    await ClassSchedule.deleteMany({ student: studentUser._id });

    console.log("Test Users and Tutor Profile created.");

    // TEST STEP 1: Student Requests a Demo Class
    console.log("\n--- STEP 1: Student Requests Demo Class ---");
    const bookReqRes = mockReqRes(
      {
        tutorProfileId: tutorProfile._id.toString(),
        isTrial: true,
        message: "Please schedule a trial demo class for Physics.",
      },
      { id: studentUser._id.toString(), role: "student" }
    );

    await studentController.bookTutor(bookReqRes.req, bookReqRes.res);
    console.log("Book Demo Status:", bookReqRes.res.statusCode, "Message:", bookReqRes.res.data.message);
    if (bookReqRes.res.statusCode !== 201) throw new Error("Demo booking request failed!");

    const createdBooking = bookReqRes.res.data.booking;
    console.log("Created Booking ID:", createdBooking._id);
    console.log("Status:", createdBooking.status);
    console.log("adminApproved:", createdBooking.adminApproved, "tutorApproved:", createdBooking.tutorApproved);

    // Verify NO ClassSchedule was created at request stage
    const scheduleAtRequest = await ClassSchedule.findOne({ booking: createdBooking._id });
    console.log("Schedule at Request Stage exists?:", !!scheduleAtRequest);
    if (scheduleAtRequest) throw new Error("ClassSchedule should NOT be created at initial request stage!");

    // TEST STEP 1B: Prevent Duplicate Active Demo Requests
    console.log("\n--- STEP 1B: Attempt Duplicate Demo Request ---");
    const dupBookReqRes = mockReqRes(
      {
        tutorProfileId: tutorProfile._id.toString(),
        isTrial: true,
        message: "Duplicate request attempt",
      },
      { id: studentUser._id.toString(), role: "student" }
    );

    await studentController.bookTutor(dupBookReqRes.req, dupBookReqRes.res);
    console.log("Duplicate Demo Status:", dupBookReqRes.res.statusCode, "Message:", dupBookReqRes.res.data.message);
    if (dupBookReqRes.res.statusCode !== 400) throw new Error("Duplicate active demo request should be rejected!");

    // TEST STEP 2: Admin Approval
    console.log("\n--- STEP 2: Admin Approves Demo Request ---");
    const adminApproveReqRes = mockReqRes(
      {},
      { id: "admin123", role: "admin" },
      { id: createdBooking._id.toString() }
    );

    await adminController.approveBookingRequest(adminApproveReqRes.req, adminApproveReqRes.res);
    console.log("Admin Approve Status:", adminApproveReqRes.res.statusCode, "Message:", adminApproveReqRes.res.data.message);

    const bookingAfterAdmin = await BookingRequest.findById(createdBooking._id);
    console.log("adminApproved:", bookingAfterAdmin.adminApproved, "tutorApproved:", bookingAfterAdmin.tutorApproved);
    console.log("New Booking Status:", bookingAfterAdmin.status);
    if (bookingAfterAdmin.status !== "Pending Tutor Acceptance") throw new Error("Status should be Pending Tutor Acceptance after Admin approval alone!");

    // Verify STILL no ClassSchedule created until Tutor also approves
    const scheduleAfterAdmin = await ClassSchedule.findOne({ booking: createdBooking._id });
    console.log("Schedule after Admin Approval alone exists?:", !!scheduleAfterAdmin);
    if (scheduleAfterAdmin) throw new Error("ClassSchedule should NOT be created until BOTH Admin and Tutor approve!");

    // TEST STEP 3: Tutor Approval & Automatic Class Creation
    console.log("\n--- STEP 3: Tutor Approves Demo Request ---");
    const tutorAcceptReqRes = mockReqRes(
      {},
      { id: tutorUser._id.toString(), role: "tutor" },
      { id: createdBooking._id.toString() }
    );

    await tutorController.acceptBookingRequest(tutorAcceptReqRes.req, tutorAcceptReqRes.res);
    console.log("Tutor Accept Status:", tutorAcceptReqRes.res.statusCode, "Message:", tutorAcceptReqRes.res.data.message);

    const bookingAfterBoth = await BookingRequest.findById(createdBooking._id);
    console.log("Final Booking Status:", bookingAfterBoth.status);
    console.log("adminApproved:", bookingAfterBoth.adminApproved, "tutorApproved:", bookingAfterBoth.tutorApproved);
    if (bookingAfterBoth.status !== "Confirmed") throw new Error("Booking status should be Confirmed after dual approval!");

    // TEST STEP 4 & 5: Verify ONE Demo Class Schedule Created & One-Time Only
    console.log("\n--- STEP 4 & 5: Verify Non-Recurring Demo Class Schedule ---");
    const scheduledClass = await ClassSchedule.findOne({ booking: createdBooking._id });
    console.log("Scheduled Class ID:", scheduledClass ? scheduledClass._id : null);
    console.log("Subject:", scheduledClass.subject);
    console.log("classType:", scheduledClass.classType);
    console.log("isRecurring:", scheduledClass.isRecurring);
    console.log("frequency:", scheduledClass.frequency);
    console.log("status:", scheduledClass.status);

    if (!scheduledClass) throw new Error("Demo ClassSchedule was NOT created after dual approval!");
    if (scheduledClass.classType !== "demo") throw new Error("classType should be demo!");
    if (scheduledClass.isRecurring !== false) throw new Error("isRecurring should be false!");

    // Test Backend Idempotency Protection
    const { createDemoClassScheduleIfBothApproved } = require("../utils/demoScheduleHelper");
    const repeatSchedule = await createDemoClassScheduleIfBothApproved(createdBooking._id);
    console.log("Repeat Schedule Call returned same ID?:", repeatSchedule._id.toString() === scheduledClass._id.toString());
    const countSchedules = await ClassSchedule.countDocuments({ booking: createdBooking._id });
    console.log("Total schedules created for this demo booking:", countSchedules);
    if (countSchedules !== 1) throw new Error("Duplicate schedules created!");

    // TEST STEP 6: Demo Class Completion
    console.log("\n--- STEP 6: Mark Demo Class Completed ---");
    scheduledClass.status = "Completed";
    scheduledClass.attendance = "Present";
    await scheduledClass.save();

    bookingAfterBoth.status = "Completed";
    await bookingAfterBoth.save();
    console.log("Demo class and booking marked as Completed.");

    // TEST STEP 7: Prevent Another Demo After Completion
    console.log("\n--- STEP 7: Prevent Demo Booking After Completion ---");
    const postCompBookReqRes = mockReqRes(
      {
        tutorProfileId: tutorProfile._id.toString(),
        isTrial: true,
        message: "Attempt demo after completed demo",
      },
      { id: studentUser._id.toString(), role: "student" }
    );

    await studentController.bookTutor(postCompBookReqRes.req, postCompBookReqRes.res);
    console.log("Post-Completion Demo Status:", postCompBookReqRes.res.statusCode, "Message:", postCompBookReqRes.res.data.message);
    if (postCompBookReqRes.res.statusCode !== 400) throw new Error("Post-completion demo booking should be blocked!");
    if (!postCompBookReqRes.res.data.message.includes("You have already completed a demo class with this tutor")) {
      throw new Error("Message mismatch for post-completion demo attempt!");
    }

    console.log("\n✅ ALL DEMO CLASS WORKFLOW TESTS PASSED CLEANLY!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ DEMO CLASS WORKFLOW TEST ERROR:", err);
    process.exit(1);
  }
}

runDemoWorkflowTest();
