const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  teacher_id: { type: mongoose.Schema.Types.ObjectId },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  class_taken: [{ type: mongoose.Schema.Types.ObjectId, ref: "Classroom" }],
});

module.exports = mongoose.model("Teacher", teacherSchema);
