const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Store OTPs temporarily (in a real app, use a database)
const otpStore = {};

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Or use 'outlook', etc.
  auth: {
    user: 'your-email@gmail.com', // Replace with your email
    pass: 'your-email-password', // Replace with your email password or app password
  },
});

app.post('/send-otp', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send({ error: 'Email is required' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
  otpStore[email] = otp; // Store the OTP (temporary)

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: email,
    subject: 'Your OTP for Registration',
    text: `Your OTP is: ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send({ error: 'Failed to send OTP' });
    }
    res.status(200).send({ message: 'OTP sent successfully!' });
  });
});

app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (otpStore[email] && otpStore[email] === otp) {
    delete otpStore[email]; // OTP verified, remove it
    res.status(200).send({ message: 'OTP verified successfully!' });
  } else {
    res.status(400).send({ error: 'Invalid or expired OTP' });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
