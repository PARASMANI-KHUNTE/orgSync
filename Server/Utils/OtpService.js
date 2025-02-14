const nodemailer = require('nodemailer');
require('dotenv').config();

const otpStore = new Map(); 

const sendOTP = async (email) => {
 // Generate a random 4-digit OTP
const OTP = Math.floor(Math.random() * 9000) + 1000;
  // Configure Nodemailer transporter with your email provider's credentials
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host : 'smtp.gmail.com',
    auth: {
      user: process.env.EMAIL_USER , // Ensure these are set in your .env file
      pass: process.env.EMAIL_PASSWORD ,
    },
  });

  // Email options
  const mailOptions = {
    from: {name : 'OrgSync' , address : process.env.EMAIL_USER} ,
    to: email,
    subject: 'OTP Verification',
    text: `Your OTP is: ${OTP}. It will expire in 5 minutes.`,
  };

  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);

    // Store the OTP in the temporary store with expiration (5 minutes)
    otpStore.set(email, { otp: OTP, expires: Date.now() + 5 * 60 * 1000 });

    return OTP; // Return the OTP for further use if needed
  } catch (error) {
    throw error;
  }
};

const  verifyOTP = async (email, OTP) => {
  // Retrieve the OTP details from the store
  const otpDetails = otpStore.get(email);

  // Check if OTP exists and is not expired
  if (!otpDetails || otpDetails.expires < Date.now()) {
    otpStore.delete(email); // Remove expired OTP
    return false; // OTP expired or not found
  }

  // Compare the provided OTP with the stored OTP
  if (otpDetails.otp === parseInt(OTP, 10)) {
    otpStore.delete(email); // Remove OTP after successful verification
    return true;
  }

  return false; // OTP does not match
};


const sendLink = async ({ to, subject, html }) => {
  try {
    // Configure Nodemailer transporter with your email provider's credentials
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER, // Ensure these are set in your .env file
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, message: 'Failed to send email', error };
  }
};

module.exports = { sendOTP, verifyOTP  ,sendLink};
