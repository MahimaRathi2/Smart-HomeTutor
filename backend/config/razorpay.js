

const Razorpay = require("razorpay");

const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_HomeTutorKey";
const key_secret = process.env.RAZORPAY_KEY_SECRET || "secret_HomeTutorKey";

const razorpayInstance = new Razorpay({
  key_id: key_id,
  key_secret: key_secret,
});

module.exports = {
  razorpayInstance,
  key_id,
  key_secret,
};

