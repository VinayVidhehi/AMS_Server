const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  usn: { type: String },
});

const batchSchema = new mongoose.Schema({
  batchName: { type: String, required: true },
  students: [studentSchema],
});

const courseDetailsSchema = new mongoose.Schema({
  course: { type: String, required: true },
  id: { type: String, required: true },
  year: { type: Number, required: true },
  semester: { type: String, required: true },
  students: [studentSchema],
  batches: [batchSchema],
});

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  course_details: [courseDetailsSchema],
});

module.exports = mongoose.model("Teacher", teacherSchema);
