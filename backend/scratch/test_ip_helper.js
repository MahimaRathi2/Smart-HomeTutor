const { getClientIp } = require("../utils/activityLogHelper");

console.log("=== CLIENT IP RESOLUTION TEST SUITE ===");

// 1. Direct string tests
console.assert(getClientIp("::1") === "127.0.0.1", "Test 1 Failed");
console.assert(getClientIp("::ffff:127.0.0.1") === "127.0.0.1", "Test 2 Failed");
console.assert(getClientIp("::ffff:203.0.113.195") === "203.0.113.195", "Test 3 Failed");
console.assert(getClientIp("203.0.113.195, 70.41.3.18") === "203.0.113.195", "Test 4 Failed");

// 2. Express req object with X-Forwarded-For
const mockReqProxy = {
  headers: {
    "x-forwarded-for": "198.51.100.42, 10.0.0.1",
  },
  ip: "10.0.0.1",
  socket: { remoteAddress: "10.0.0.1" },
};
console.assert(getClientIp(mockReqProxy) === "198.51.100.42", "Test 5 (Proxy X-Forwarded-For) Failed");

// 3. Express req object without X-Forwarded-For
const mockReqDirect = {
  headers: {},
  ip: "203.0.113.55",
  socket: { remoteAddress: "203.0.113.55" },
};
console.assert(getClientIp(mockReqDirect) === "203.0.113.55", "Test 6 (Direct Req IP) Failed");

// 4. Localhost Express req object
const mockReqLocalhost = {
  headers: {},
  ip: "::ffff:127.0.0.1",
  socket: { remoteAddress: "::1" },
};
console.assert(getClientIp(mockReqLocalhost) === "127.0.0.1", "Test 7 (Localhost Req IP) Failed");

console.log("✅ ALL 7 CLIENT IP RESOLUTION TESTS PASSED!");
