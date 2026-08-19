const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hometutor";

async function testTutorDashboard() {
  try {
    console.log("Connecting to MongoDB:", mongoURI);
    await mongoose.connect(mongoURI);

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const TutorProfile = mongoose.model('TutorProfile', new mongoose.Schema({}, { strict: false }));
    const BookingRequest = mongoose.model('BookingRequest', new mongoose.Schema({}, { strict: false }));

    const tutors = await User.find({ role: 'tutor' });
    console.log(`Found ${tutors.length} tutor user accounts in MongoDB.`);

    if (tutors.length > 0) {
      const sampleTutor = tutors[0];
      console.log(`Sample Tutor User: ID=${sampleTutor._id}, Name=${sampleTutor.name}, Email=${sampleTutor.email}`);

      const profile = await TutorProfile.findOne({ user: sampleTutor._id });
      if (profile) {
        console.log(`Found Tutor Profile: FullName=${profile.fullName || sampleTutor.name}, Qualification=${profile.qualification}, Fee=₹${profile.fee}`);
      } else {
        console.log("No explicit TutorProfile found for this tutor user yet.");
      }

      const requests = await BookingRequest.find({ tutor: sampleTutor._id });
      console.log(`Found ${requests.length} booking requests for sample tutor.`);
    }

    console.log("✅ Tutor Dashboard Database Verification Passed!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Verification Error:", err);
    process.exit(1);
  }
}

testTutorDashboard();
