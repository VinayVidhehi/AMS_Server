const mongoose = require("mongoose");

const classroomSchema = new mongoose.Schema({
  classroom_id: { type: String, required: true },
  classroom_name: { type: String, required: true },
  students: [
    {
      student_id: { type: mongoose.Schema.Types.ObjectId, ref: "StudentLogin" },
    },
  ],
});

module.exports = mongoose.model("Classroom", classroomSchema);
