const mongoose = require('mongoose');

// Schema for student login details
const studentLoginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    student_id: {
        type: String,
        required: true,
        unique: true
    }
});

const StudentLogin = mongoose.model('StudentLogin', studentLoginSchema);

module.exports = StudentLogin;
