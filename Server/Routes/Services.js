const express = require('express');
const router = express.Router();

const {OtpSend , OtpVerify} = require('../Controllers/ServiceController')

router.post('/sendOtp',OtpSend);
router.post('/verify-otp',OtpVerify);

module.exports = router;