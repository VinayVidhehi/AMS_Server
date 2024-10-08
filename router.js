const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const Teacher = require("./models/teacherSchema");
const Attendance = require("./models/attendance")
const studentQuery = require("./models/userQuery");
const bcrypt = require("bcryptjs");
const NgrokUrl = require("./models/ngrok_url");
require("dotenv").config();

let array = [];

try {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((error) => {
      console.log("Connection to MongoDB failed: ", error.message);
    });
} catch (error) {
  console.log("Error outside promise: ", error.message);
}

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

//initialisation
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDER_MAIL_ID,
    pass: process.env.SENDER_MAIL_SECRET_KEY,
  },
});

//set mail id and otp to send the email to
const mailOptions = (email, otp) => {
  console.log("the email is sss", email, otp);
  return {
    from: process.env.SENDER_MAIL_ID,
    to: email,
    subject: "OTP verification for Attendance Management System sign up",
    text: `Your OTP for email verification is: ${otp}`,
  };
};

// Send email with response
async function sendEmail(email, otp) {
  try {
    await transporter.sendMail(mailOptions(email, otp));
    console.log("Email sent successfully");
    return 1;
  } catch (error) {
    console.error("Error sending email:", error);
    return 0;
  }
}

const userSignup = async (req, res) => {
  const { key } = req.body;

  //send otp for email verification after ensuring the email isnt registered
  if (key <= 1) {
    //handle sending otp and saving copy of the otp locally
    if (key == 0) {
      //take user email from request
      const { email } = req.body;

      const foundEmail = await Teacher.findOne({ email })

      //if email found ask them to login instead
      if (foundEmail != undefined || foundEmail != null) {
        res.json({
          message: "entered email is already registered, please login instead",
          key: 0,
        });
      } else {
        //here if there is a otp in the array with this email previously delete it
        array = array.filter((userOtp) => userOtp.email != email);

        const otp = generateOTP();
        array.push({ email, otp });
        console.log("the array is ", array, email);
        const response = sendEmail(email, otp);
        if (response == 0)
          res.json({
            message: "error while sending otp, please try again later",
            key: 0,
          });
        else
          res.json({
            message:
              "otp sent successfully, please check your mail and enter the otp to proceed",
            key: 1,
          });
      }
    }

    //check whether otp matches or not
    else if (key == 1) {
      const { otp, email } = req.body;

      const storedOtp = array.find((userOtp) => userOtp.email == email);
      console.log("stored otp is ", storedOtp);
      if (storedOtp.otp == otp) {
        res.json({
          message:
            "email verified successfully, please fill the details to signup",
          key: 1,
        });
      } else {
        res.json({
          message: "entered otp does not match, please check and try again",
          key: 0,
        });
      }
    }
  }

  //save credentials once email verified
else {
      const { email, name, password, course } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log("details are", email, course)
      const newUser = new Teacher({
        email,
        name,
        course,
        password: hashedPassword,
      });

      const response = await newUser.save();
      console.log("reesponse for saving user is ", response);
      res.json({
        message:
          "crendentials stored successfully, enjoy food within your budget",
        key: 1,
      });
    }
  }

const userLogin = async (req, res) => {
  const { email, password } = req.body;
    const user = await Teacher.findOne({ email });
    console.log("user is", email, password);

    if (user == null || user == undefined) {
      console.log("not found babe");
      return res.json({ message: "user not found, please signup", key: 0 });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      console.log("at login succesful");
      res.json({ message: "Login successful", key: 1 });
    } else {
      return res.json({ message: "wrong password, try again", key: 0 });
    }
  }

const userForgetPassword = async (req, res) => {
  const { email, newPassword, isStaff } = req.body;
  if (!isStaff) {
    try {
      // Find the user by email
      const userFound = await Student.findOne({ email });

      // If user not found, return error message
      if (!userFound) {
        return res.json({
          message: "User not found. Please sign up first.",
          key: 0,
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      // Update the user's password
      await Student.findOneAndUpdate({ email }, { password: hashedPassword });

      // Return success message
      return res.json({ message: "Password updated successfully.", key: 1 });
    } catch (error) {
      // Handle errors
      console.error("Error updating password:", error);
      return res.status(500).json({ message: "Internal server error", key: 0 });
    }
  } else {
    try {
      // Find the user by email
      const userFound = await Teacher.findOne({ email });

      // If user not found, return error message
      if (!userFound) {
        return res.json({
          message: "User not found. Please sign up first.",
          key: 0,
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      // Update the user's password
      await Teacher.findOneAndUpdate({ email }, { password: hashedPassword });

      // Return success message
      return res.json({ message: "Password updated successfully.", key: 1 });
    } catch (error) {
      // Handle errors
      console.error("Error updating password:", error);
      return res.status(500).json({ message: "Internal server error", key: 0 });
    }
  }
};

const handleStudentQuery = async (req, res) => {
  try {
    const { email, query } = req.body;

    const newStudentQuery = new studentQuery({
      email,
      query,
    });

    await newStudentQuery.save();
    res.send({ message: "succesfully stored query", key: 1 });
  } catch (error) {
    console.log("error during student query", error);
    res.send({ message: "unable to store query due to server error", key: 0 });
  }
};

const handleAddFacultyCourse = async (req, res) => {
  const { email, course_details } = req.body;

  try {
    const response = await Teacher.findOne({ email });
    if (response) {
      console.log("type of teacher is, inside adding courses", response, email);
      const newCourseDetails = [...response.course_details || [], course_details];
      const courseResponse = await Teacher.findOneAndUpdate(
        { email },
        { course_details: newCourseDetails },
        { new: true }
      ); // i want course details feild to be updated to newCourseDetails
      if (courseResponse) {
        res.json({
          message: `successfully added course ${course_details.course}`,
          key: 1,
        });
      } else {
        res.json({
          message: "unable to update course, try again later",
          key: 0,
        });
      }
    } else {
      res.json({ message: "unable to find user", key: 0 });
    }
  } catch (error) {
    console.error("Error updating course details:", error);
    res
      .status(500)
      .json({
        message: "An error occurred while updating course details",
        key: 0,
      });
  }
};

const handleFetchFacultyCourses = async (req, res) => {
  const { email } = req.query;

  try {
    if (email) {
      // Find the teacher by email
      const response = await Teacher.findOne({ email });

      if (response) {
        // Extract and send the course details
        console.log("course details are", response);
        const course_details = response.course_details;
        res.json({ message: "Course details fetched successfully", key: 1, course_details });
      } else {
        // Handle case where no teacher is found with the given email
        res.json({ message: "No teacher found with the provided email", key: 0 });
      }
    } else {
      // Handle case where the email is missing in the query
      res.json({ message: "Email query parameter is required", key: 0 });
    }
  } catch (error) {
    console.error("Error fetching course details:", error);
    res.status(500).json({ message: "An error occurred while fetching course details", key: 0 });
  }
};

const fetchServerString = async(req, res) => {
  const {email} = req.query;

  const user = await Teacher.findOne({email});
  if(user) {
    const response = await NgrokUrl.findOne();
    res.json({message:"succesfully fetched url", url:response.ngrok_url, key:1}) 
  }
}

const storeServerString = async (req, res) => {
  try {
    const { ngrok_url, naunce } = req.body;

    // Validate request data
    if (!ngrok_url || !naunce) {
      return res.status(400).json({ message: "Missing required fields", key: 0 });
    }

    // Validate the provided naunce with the environment variable
    if (naunce === process.env.NAUNCE) {
      // Find the document and update it, or create a new one if it doesn't exist
      const urlString = await NgrokUrl.findOneAndUpdate(
        {},
        { ngrok_url, is_active: true },
        { upsert: true, new: true }
      );

      return res.status(201).json({ message: "Successfully stored the server URL", key: 1 });
    }

    // If naunce does not match
    return res.status(403).json({ message: "Unauthorized to change the server string", key: 0 });
  } catch (error) {
    console.error("Error storing server string:", error);

    // Handle different error types accordingly
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: "Validation error: " + error.message, key: 0 });
    }

    // General error response
    return res.status(500).json({ message: "Internal server error", key: 0 });
  }
};


const handleUpdateAttendance = async (req, res) => {
  const { email, students } = req.body;
 console.log("students array is", students);
  try {
    // Find the user by email
    const findUser = await Attendance.findOne({ email });

    if (findUser) {
      // User exists, update their attendance
      const newAttendance = {
        date: new Date(), // Record the current date
        students, // Ensure each student has a usn field
        note: "no note for now"
      };

      // Push the new attendance record to the existing attendance array
      findUser.attendance.push(newAttendance);

      // Save the updated document
      await findUser.save();

      res.status(200).json({ message: 'Attendance updated successfully.', key:1 });
    } else {
      // User does not exist, create a new record
      const newAttendanceRecord = new Attendance({
        email,
        attendance: [{
          date: new Date(),
          students: students.map(usn => ({ usn })),
          note: "no note for now"
        }]
      });

      await newAttendanceRecord.save();
      res.status(201).json({ message: 'New attendance record created successfully.', key:1 });
    }
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' , key:0});
  }
};

const handleViewAttendance = async (req, res) => {
  const { email } = req.query;

  try {
    // Find the attendance record by email
    const attendanceRecord = await Attendance.findOne({ email });

    if (attendanceRecord) {
      // If the record is found, return it
      res.status(200).json({
        message: 'Attendance record found.',
        attendance: attendanceRecord.attendance,
        key:1
      });
    } else {
      // If no record is found, return a 404 response
      res.status(404).json({ message: 'No attendance record found for this email.', key:0 });
    }
  } catch (error) {
    console.error('Error retrieving attendance:', error);
    res.status(500).json({ message: 'Server error. Please try again later.', key:0 });
  }
};


module.exports = {
  userSignup,
  userLogin,
  userForgetPassword,
  handleStudentQuery,
  handleAddFacultyCourse,
  handleFetchFacultyCourses,
  fetchServerString,
  storeServerString,
  handleUpdateAttendance,
  handleViewAttendance
};
