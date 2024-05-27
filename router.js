const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const Student = require('./models/studentLogin');
const StudentImage = require('./models/studentImage');
const bcrypt = require("bcryptjs");
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
      
      const foundEmail = await Student.findOne({ email });

      //if email found ask them to login instead
      if (foundEmail != undefined || foundEmail != null) {
        res.json({
          message: "entered email is already registered, please login instead",
        key:0});
      }

      else {
        //here if there is a otp in the array with this email previously delete it
      array = array.filter((userOtp) => userOtp.email != email);

      const otp = generateOTP();
      array.push({ email, otp });
      console.log("the array is ",array, email);
      const response = sendEmail(email, otp);
      if(response == 0) res.json({message:'error while sending otp, please try again later', key:0});
      else res.json({message:'otp sent successfully, please check your mail and enter the otp to proceed', key:1})
      }
    }

    //check whether otp matches or not
    else if (key == 1) {
      const {otp, email} = req.body;
            
      const storedOtp = array.find((userOtp) => userOtp.email == email);
      console.log("stored otp is ",storedOtp);
      if(storedOtp.otp == otp) {
        res.json({message:"email verified successfully, please fill the details to signup", key : 1});
      }
      else {
        res.json({message:"entered otp does not match, please check and try again", key:0});
      }
    }
  }

  //save credentials once email verified
  else {
    const {email, name, password, usn} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Student({
      email,
      name,
      student_id:usn,
      password:hashedPassword,
    })

    const response = await newUser.save();
    console.log("reesponse for saving user is ", response);
    res.json({message:"crendentials stored successfully, enjoy food within your budget", key:1})
  }
};

const userLogin = async (req, res) => {
  const {email, password} = req.body;

  const user = await Student.findOne({email});
  console.log("user is", email, password);

  if(user == null || user == undefined) {
    console.log("not found babe");
    res.json({message:"user not found, please signup", key:0});
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if(isMatch){
    console.log("at login succesful")
    res.json({message:"Login successful", key:1});
  }

  else {
    res.json({message:"wrong password, try again", key:0});
  }
}

const userForgetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Find the user by email
    const userFound = await Student.findOne({ email });

    // If user not found, return error message
    if (!userFound) {
      return res.json({ message: "User not found. Please sign up first.", key:0 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // Update the user's password
    await Student.findOneAndUpdate({ email }, { password: hashedPassword });

    // Return success message
    return res.json({ message: "Password updated successfully.", key:1 });
  } catch (error) {
    // Handle errors
    console.error("Error updating password:", error);
    return res.status(500).json({ message: "Internal server error", key:0 });
  }
};


const imageChunksMap = new Map();

const userUploadImage = async (req, res) => {
  try {
    const { email, chunk, sequenceNumber, isLastChunk } = req.body;

    // Ensure email and chunk are provided
    if (!email || !chunk || sequenceNumber === undefined) {
      return res.status(400).json({ message: "Email, chunk, and sequence number are required", key: 0 });
    }

    // Initialize the array for the email if it doesn't exist
    if (!imageChunksMap.has(email)) {
      imageChunksMap.set(email, []);
    }

    // Store the chunk
    const chunksArray = imageChunksMap.get(email);
    chunksArray.push({ sequenceNumber, chunk });

    // If this is the last chunk, assemble the image
    if (isLastChunk) {
      // Sort the chunks based on sequence number
      chunksArray.sort((a, b) => a.sequenceNumber - b.sequenceNumber);

      // Combine the chunks into a single string
      const combinedImage = chunksArray.map(chunkObj => chunkObj.chunk).join('');

      // Create a new student image document
      const uploadStudentImage = new StudentImage({
        email: email,
        image_base64: combinedImage,
      });

      // Save the document to the database
      const response = await uploadStudentImage.save();

      // Clear the chunks from memory
      imageChunksMap.delete(email);

      // Respond based on the success of the save operation
      if (response) {
        res.json({ message: "Successfully saved image", key: 1 });
      } else {
        res.status(500).json({ message: "Error while uploading the image, try again later", key: 0 });
      }
    } else {
      res.json({ message: "Chunk received successfully", key: 1 });
    }
  } catch (error) {
    console.error("Error while storing base64 string:", error);
    res.status(500).json({ message: "Internal server error", key: 0 });
  }
};



module.exports = {
    userSignup,
    userLogin,
    userForgetPassword,
    userUploadImage,
}