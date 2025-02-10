const express = require('express');
const router = express.Router();

const {OtpSend , OtpVerify ,checkToken} = require('../Controllers/ServiceController');
const { authMiddleware } = require('../middlewares/authMiddleware');


router.post('/sendOtp',OtpSend);
router.post('/verify-otp',OtpVerify);
router.get('/verify-token',authMiddleware,checkToken)

module.exports = router;