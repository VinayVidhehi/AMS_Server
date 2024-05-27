const mongoose = require('mongoose');

// Schema for student embeddings and image data
const studentSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        ref: 'StudentLogin'
    },
    image_base64: {
        type: String,
        required: true
    },
    embeddings: {
        type: [Number],
        default: []
    }
});

const Student = mongoose.model('StudentImage', studentSchema);

module.exports = Student;
