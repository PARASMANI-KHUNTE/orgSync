const express = require('express');
const router = express.Router();


const {
     checkEmployeeFace , 
     CheckForExistenceData  , 
     SaveSignupData,
     login,
     updatePassword,
     resetPassword,
     setNewPassword}
     = require('../Controllers/EmployeeController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.use(authMiddleware)
router.get('/checkFace',checkEmployeeFace)
router.get("/checkdata",CheckForExistenceData)
router.post('/Signup',SaveSignupData),
router.post('/Login',login),
router.post('/update-password',updatePassword);
router.post('/reset-password',resetPassword)
router.put('/updatePassword',setNewPassword)
module.exports = router;