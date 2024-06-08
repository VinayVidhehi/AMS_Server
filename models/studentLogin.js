const mongoose = require("mongoose");

// Schema for student login details
const studentLoginSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  student_id: {
    type: String,
    required: true,
    unique: true,
  },
  classroom: {
    classroom_id: { type: mongoose.Schema.Types.ObjectId, ref: "Classroom" },
    classroom_name: { type: String },
  },
});

const StudentLogin = mongoose.model("StudentLogin", studentLoginSchema);

module.exports = StudentLogin;
