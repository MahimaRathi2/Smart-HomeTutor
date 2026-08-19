const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../../frontend/public/uploads/tutors");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, "_");
    cb(null, `${file.fieldname}-${basename}-${uniqueSuffix}${ext}`);
  },
});

// File Filter for Allow-listed extensions
const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file format. Only PDF, JPG, JPEG, and PNG files are permitted."));
  }
};

// Multer Upload Instance with file size limit per document
const tutorUpload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: fileFilter,
});

// Middleware function for multi-field document uploads
const tutorDocUpload = tutorUpload.fields([
  { name: "profilePhoto", maxCount: 1 },
  { name: "qualificationDoc", maxCount: 1 },
  { name: "experienceDoc", maxCount: 1 },
  { name: "idProofDoc", maxCount: 1 },
  { name: "resumeDoc", maxCount: 1 },
  { name: "addressProofDoc", maxCount: 1 },
  { name: "file", maxCount: 1 },
  { name: "document", maxCount: 1 },
]);

// Attach Multer methods for route flexibility
tutorDocUpload.tutorUpload = tutorUpload;
tutorDocUpload.single = (name) => tutorUpload.single(name);
tutorDocUpload.array = (name, maxCount) => tutorUpload.array(name, maxCount);
tutorDocUpload.fields = (fields) => tutorUpload.fields(fields);

module.exports = tutorDocUpload;
