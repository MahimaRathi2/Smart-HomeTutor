require("dotenv").config();
const connectDB = require("../config/db");
const ActivityLog = require("../models/ActivityLog");
const User = require("../models/User");

async function cleanAndSyncLogs() {
  await connectDB();

  const testPatterns = [
    /test/i,
    /hacker/i,
    /stanford\.edu/i,
    /audit_/i,
    /nodoc/i,
    /withdoc/i,
    /david miller/i,
    /opening degree verification/i
  ];

  const deleteResult = await ActivityLog.deleteMany({
    $or: [
      { userEmail: { $regex: /test|hacker|stanford\.edu|audit_|nodoc|withdoc/i } },
      { action: { $regex: /david miller|opening degree verification|verified & approved prof/i } }
    ]
  });

  console.log(`✅ Removed ${deleteResult.deletedCount} placeholder/test activity logs from MongoDB.`);

  const orphanLogs = await ActivityLog.find({ user: null, userEmail: { $ne: "" } });
  let relinkedCount = 0;

  for (const log of orphanLogs) {
    const user = await User.findOne({ email: log.userEmail.toLowerCase().trim() });
    if (user) {
      log.user = user._id;
      await log.save();
      relinkedCount++;
    }
  }

  console.log(`✅ Relinked ${relinkedCount} orphan activity logs with matching MongoDB User documents.`);


  const misclassifiedLogins = await ActivityLog.updateMany(
    {
      action: { $regex: /logged in successfully|successful login/i },
      severity: { $ne: "info" }
    },
    { $set: { severity: "info", category: "auth" } }
  );

  console.log(`✅ Corrected ${misclassifiedLogins.modifiedCount} login logs to severity: "info".`);

  const remainingLogsCount = await ActivityLog.countDocuments();
  const criticalCount = await ActivityLog.countDocuments({ severity: "critical" });
  console.log(`📊 Clean Audit Log Summary: Total Logs = ${remainingLogsCount}, Critical Events = ${criticalCount}`);

  process.exit(0);
}

cleanAndSyncLogs();
