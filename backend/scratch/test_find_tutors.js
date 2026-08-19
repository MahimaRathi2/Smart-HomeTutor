require("dotenv").config();
const connectDB = require("../config/db");
const TutorProfile = require("../models/TutorProfile");
const User = require("../models/User");

async function testFindTutorsFlow() {
  try {
    console.log("Connecting to DB...");
    await connectDB();

    console.log("1. Testing TutorProfile.find() query...");
    const profiles = await TutorProfile.find({ isApproved: true }).populate("user", "name email role");
    console.log(`✅ Found ${profiles.length} approved tutor profiles in database.`);

    console.log("2. Testing query with subject/mode/board criteria...");
    const mathProfiles = await TutorProfile.find({
      isApproved: true,
      subjects: { $regex: "Mathematics", $options: "i" },
    }).populate("user", "name email");

    console.log(`✅ Found ${mathProfiles.length} Mathematics tutors.`);

    console.log("3. Testing GPS Distance Calculation simulation...");
    const sampleLat = 28.6139; // Delhi lat
    const sampleLng = 77.2090; // Delhi lng

    profiles.forEach((p) => {
      if (p.coordinates && p.coordinates.lat && p.coordinates.lng) {
        const dLat = ((p.coordinates.lat - sampleLat) * Math.PI) / 180;
        const dLng = ((p.coordinates.lng - sampleLng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((sampleLat * Math.PI) / 180) *
            Math.cos((p.coordinates.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceKm = Math.round(6371 * c * 10) / 10;
        console.log(` - Tutor: ${p.user?.name || "Tutor"} | Distance: ${distanceKm} km`);
      }
    });

    console.log("✅ All test queries passed cleanly.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  }
}

testFindTutorsFlow();
