const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  course_details: [
    {
      course: { type: String, unique:true},
      id: { type: String, unique:true},
      year:{type:Number, required:true},
      semester: { type: String, },
      students:[
        {usn:{type:String}}
      ]
    },
  ],
});

module.exports = mongoose.model("Teacher", teacherSchema);
