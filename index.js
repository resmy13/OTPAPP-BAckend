const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI;
const emailModel = require('./models/email');






const corsOptions = {
    origin: 'http://localhost:4000//sendDataAndOTP', // Specify the origin allowed to make requests
    methods: 'GET, POST', // Specify the HTTP methods allowed
    optionsSuccessStatus: 200 // Optionally, set the success status code for preflight requests
  };

app.use(express.json());
app.use(cors());
app.use(cors(corsOptions));

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Route to handle sending OTP and saving to the database
app.post('/sendDataAndOTP', async (req, res) => {
  try {
    const { email, text } = req.body;

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Send OTP to the provided email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Your OTP',
      text: `Your OTP is: ${otp}`
    };

    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ error: 'Error sending OTP' });
      } else {
        // Save email, text, and OTP to the database
        const newEmail = new emailModel({ email, text, otp });
        await newEmail.save();
        
        res.status(200).json({ message: 'Data and OTP sent successfully' });
      }
    });
  } catch (error) {
    console.error('Error sending data and OTP:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
