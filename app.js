const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {userLogin, userSignup, userForgetPassword, userUploadImage, getUserImage} = require('./router')
require("dotenv").config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

//all post requests here
app.post('/signup', userSignup);
app.post('/login', userLogin);
app.post('/forget-password', userForgetPassword);
app.post('/uploadImage', userUploadImage);
app.post('/getImage', getUserImage);

app.get('/', (req, res) => {
  res.json({message:'Face recognition based attendance management system'})
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})