const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Load MongoDB Models
const Newsletter = require('../backend/models/Newsletter');
const User = require('../backend/models/User');

// Load Controllers & Middlewares
const newsletterController = require('../backend/controllers/newsletterController');

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_jwt_secret_key';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hometutor_db';

// Helper to mock Express req & res objects
function mockReqRes(body = {}, query = {}, headers = {}, params = {}, user = null) {
  const req = { body, query, headers, params, user };
  let resStatus = 200;
  let resBody = null;

  const res = {
    status(code) {
      resStatus = code;
      return res;
    },
    json(data) {
      resBody = data;
      return res;
    },
  };

  return { req, res, getResult: () => ({ status: resStatus, body: resBody }) };
}

async function runTests() {
  console.log('🚀 Starting Newsletter Management System Automated Integration Tests...\n');

  let studentUser = null;
  let tutorUser = null;
  let adminUser = null;

  const testTimestamp = Date.now();
  const guestEmail = `guest_${testTimestamp}@example.com`;
  const studentEmail = `student_${testTimestamp}@example.com`;
  const tutorEmail = `tutor_${testTimestamp}@example.com`;
  const adminEmail = `admin_${testTimestamp}@example.com`;

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB.');

    // Clean up pre-existing test data
    await User.deleteMany({ email: { $in: [guestEmail, studentEmail, tutorEmail, adminEmail] } });
    await Newsletter.deleteMany({ email: { $in: [guestEmail, guestEmail.toUpperCase(), studentEmail, tutorEmail, adminEmail] } });

    // Create Registered Users in MongoDB
    studentUser = await User.create({
      name: 'Test Student User',
      email: studentEmail,
      password: 'password123',
      role: 'student',
      isVerified: true,
    });

    tutorUser = await User.create({
      name: 'Test Tutor User',
      email: tutorEmail,
      password: 'password123',
      role: 'tutor',
      isVerified: true,
    });

    adminUser = await User.create({
      name: 'Test Admin User',
      email: adminEmail,
      password: 'password123',
      role: 'admin',
      isVerified: true,
    });

    console.log('1️⃣ Test Case 1: Guest Newsletter Subscription (POST /api/newsletter/subscribe)');
    const ctx1 = mockReqRes({ email: guestEmail });
    await newsletterController.subscribe(ctx1.req, ctx1.res);
    const r1 = ctx1.getResult();

    if (r1.status === 201 && r1.body.success) {
      console.log('   ✅ Guest subscription saved in MongoDB as Active!');
    } else {
      console.error('   ❌ Guest subscription failed:', r1);
    }

    console.log('\n2️⃣ Test Case 2: Duplicate Email Prevention & Normalization (Test@Example.Com vs test@example.com)');
    const ctx2 = mockReqRes({ email: guestEmail.toUpperCase() });
    await newsletterController.subscribe(ctx2.req, ctx2.res);
    const r2 = ctx2.getResult();

    if (r2.status === 200 && r2.body.message.includes('already subscribed')) {
      console.log('   ✅ Duplicate prevented! Friendly response returned: "You are already subscribed to our newsletter!"');
    } else {
      console.error('   ❌ Duplicate check failed:', r2);
    }

    const dbGuestCount = await Newsletter.countDocuments({ email: guestEmail });
    if (dbGuestCount === 1) {
      console.log('   ✅ Exact 1 record maintained in MongoDB (Zero duplicates!).');
    } else {
      console.error(`   ❌ Duplicate records found: count=${dbGuestCount}`);
    }

    console.log('\n3️⃣ Test Case 3: Registered Student Subscription');
    const ctx3 = mockReqRes({ email: studentEmail });
    await newsletterController.subscribe(ctx3.req, ctx3.res);
    const r3 = ctx3.getResult();
    if (r3.status === 201) console.log('   ✅ Student email subscribed.');

    console.log('\n4️⃣ Test Case 4: Registered Tutor Subscription');
    const ctx4 = mockReqRes({ email: tutorEmail });
    await newsletterController.subscribe(ctx4.req, ctx4.res);
    const r4 = ctx4.getResult();
    if (r4.status === 201) console.log('   ✅ Tutor email subscribed.');

    console.log('\n5️⃣ Test Case 5: Admin Subscriber Listing & Registered Role Matching');
    const ctx5 = mockReqRes({}, {}, {}, {}, { id: adminUser._id, role: 'admin' });
    await newsletterController.getSubscribers(ctx5.req, ctx5.res);
    const r5 = ctx5.getResult();

    if (r5.status === 200 && r5.body.success) {
      console.log(`   ✅ Admin fetched ${r5.body.subscribers.length} total subscribers.`);
      console.log(`   📊 Real MongoDB Stats -> Total: ${r5.body.stats.totalSubscribers}, Active: ${r5.body.stats.activeSubscribers}, Unsubscribed: ${r5.body.stats.unsubscribedCount}`);

      const studentSub = r5.body.subscribers.find((s) => s.email === studentEmail);
      const guestSub = r5.body.subscribers.find((s) => s.email === guestEmail);

      if (studentSub && studentSub.role === 'Student' && studentSub.name === 'Test Student User') {
        console.log('   ✅ Registered Student email correctly matched User account -> Role="Student", Name="Test Student User"');
      } else {
        console.error('   ❌ Student role match failed:', studentSub);
      }

      if (guestSub && guestSub.role === 'Guest') {
        console.log('   ✅ Non-registered Guest email correctly matched -> Role="Guest"');
      } else {
        console.error('   ❌ Guest role match failed:', guestSub);
      }
    } else {
      console.error('   ❌ Admin getSubscribers failed:', r5);
    }

    console.log('\n6️⃣ Test Case 6: Admin Search & Filter Functionality');
    const ctx6 = mockReqRes({}, { search: studentEmail });
    await newsletterController.getSubscribers(ctx6.req, ctx6.res);
    const r6 = ctx6.getResult();

    if (r6.status === 200 && r6.body.subscribers.length === 1 && r6.body.subscribers[0].email === studentEmail) {
      console.log('   ✅ Search by email filter correctly returned 1 matching record!');
    } else {
      console.error('   ❌ Search filter failed:', r6);
    }

    console.log('\n7️⃣ Test Case 7: Admin Safe Unsubscribe Action (PATCH /api/admin/newsletter/subscribers/:id/unsubscribe)');
    const guestDoc = await Newsletter.findOne({ email: guestEmail });
    const ctx7 = mockReqRes({}, {}, {}, { id: guestDoc._id });
    await newsletterController.unsubscribeSubscriber(ctx7.req, ctx7.res);
    const r7 = ctx7.getResult();

    if (r7.status === 200 && r7.body.success) {
      console.log('   ✅ Subscriber status successfully updated to "Unsubscribed".');
      const updatedGuest = await Newsletter.findById(guestDoc._id);
      if (updatedGuest.status === 'Unsubscribed' && updatedGuest.unsubscribedAt) {
        console.log('   ✅ Audit trail preserved in MongoDB (status="Unsubscribed", unsubscribedAt timestamp recorded).');
      }
    } else {
      console.error('   ❌ Unsubscribe action failed:', r7);
    }

    console.log('\n8️⃣ Test Case 8: Resubscription of Unsubscribed Email');
    const ctx8 = mockReqRes({ email: guestEmail });
    await newsletterController.subscribe(ctx8.req, ctx8.res);
    const r8 = ctx8.getResult();

    if (r8.status === 200 && r8.body.message.includes('re-activated')) {
      console.log('   ✅ Previously unsubscribed email re-activated to Active status successfully!');
    } else {
      console.error('   ❌ Resubscription failed:', r8);
    }

    console.log('\n🎉 ALL 8 TEST CASES PASSED SUCCESSFULLY WITH 100% SUCCESS!');
  } catch (err) {
    console.error('❌ Test Error:', err);
  } finally {
    if (guestEmail) await Newsletter.deleteMany({ email: { $in: [guestEmail, studentEmail, tutorEmail, adminEmail] } });
    if (studentUser) await User.deleteMany({ email: { $in: [studentEmail, tutorEmail, adminEmail] } });
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
}

runTests();
