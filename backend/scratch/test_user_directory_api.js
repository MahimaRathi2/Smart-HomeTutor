const connectDB = require('../config/db');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const adminController = require('../controllers/adminController');

async function testUserDirectoryAPI() {
  await connectDB();
  console.log("Testing User Directory API & MongoDB integration...");

  // 1. Create a dummy test student
  const testStudent = await User.create({
    name: "Test Dynamic Student",
    email: "dynamicstudent2026@gmail.com",
    password: "password123",
    role: "student",
    isVerified: true
  });
  console.log(`1. Created test student ID=${testStudent._id}`);

  // 2. Mock Express req/res for GET /api/admin/users?role=student
  const mockReq = {
    query: { role: 'all', sort: 'oldest' },
    user: { id: testStudent._id.toString(), role: 'admin' },
    ip: '127.0.0.1'
  };

  const mockRes = {
    statusCode: 200,
    status: function (code) {
      this.statusCode = code;
      return this;
    },
    json: function (data) {
      this.responseData = data;
      return this;
    }
  };

  await adminController.getAllUsers(mockReq, mockRes);
  console.log(`2. GET /api/admin/users?role=student Response Code=${mockRes.statusCode}, Count=${mockRes.responseData.count}`);

  const foundTestStudent = mockRes.responseData.users.find(u => u.email === "dynamicstudent2026@gmail.com");
  console.log(`3. Dynamic Student Found: Name="${foundTestStudent?.name}", Role="${foundTestStudent?.role}", Status="${foundTestStudent?.status}"`);

  // 4. Test DELETE /api/admin/user/:id
  const deleteReq = {
    params: { id: testStudent._id.toString() },
    user: { id: 'admin-id' },
    ip: '127.0.0.1'
  };
  const deleteRes = {
    status: function (code) { this.statusCode = code; return this; },
    json: function (data) { this.responseData = data; return this; }
  };

  await adminController.deleteUser(deleteReq, deleteRes);
  console.log(`4. DELETE /api/admin/user/:id Response Code=${deleteRes.statusCode}, Success=${deleteRes.responseData.success}`);

  if (foundTestStudent && foundTestStudent.status === "Active" && deleteRes.statusCode === 200) {
    console.log("✅ USER DIRECTORY API & MONGODB INTEGRATION PASSED!");
    process.exit(0);
  } else {
    console.error("❌ TEST FAILED!");
    process.exit(1);
  }
}

testUserDirectoryAPI();
