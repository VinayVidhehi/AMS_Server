const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  attendance: [{
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentLogin' },
    name: { type: String },
    status: { type: String, enum: ['present', 'absent', 'late'] }
  }]
});

const attendanceSchema = new mongoose.Schema({
  classroom_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' },
  classroom_name: { type: String },
  attendance_records: [attendanceRecordSchema]
});

module.exports = mongoose.model('Attendance', attendanceSchema);
