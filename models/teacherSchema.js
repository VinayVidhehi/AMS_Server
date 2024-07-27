const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  course_details: [
    {
      course: { type: String, unique:true},
      id: { type: String, unique:true},
      semester: { type: String, },
      strength: {type:Number, default:1},
      students:{
        usn:{type:String, unique:true},
      }
    },
  ],
});

module.exports = mongoose.model("Teacher", teacherSchema);
