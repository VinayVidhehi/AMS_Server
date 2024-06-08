const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {userLogin, userSignup, userForgetPassword, userUploadImage, getUserImage, handleStudentQuery} = require('./router')
require("dotenv").config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

//all post requests here
app.post('/student/signup', userSignup);
app.post('/student/login', userLogin);
app.post('/student/forget-password', userForgetPassword);
app.post('/teacher/uploadImage', userUploadImage);
app.post('/teacher/getImage', getUserImage);
app.post('/teacher/signup', userSignup);
app.post('/teacher/login', userLogin);
app.post('/query', handleStudentQuery);

app.get('/student/attendance', );
app.get('/teacher/attendance', );
app.get('/server', (req, res) => {
  res.json({messgae:"server is up", key:1});
})

app.get('/', (req, res) => {
  res.json({message:'Face recognition based attendance management system'})
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})