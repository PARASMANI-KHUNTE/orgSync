const express = require('express');
const router = express.Router();


router.post('/Signup',Signup),
router.post('/Login',login),
router.post('/update-password',updatePassword);


module.exports = router;