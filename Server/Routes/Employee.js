const express = require('express');
const router = express.Router();


const {
     checkEmployeeFace , 
     CheckForExistenceData  , 
     SaveSignupData,
     login,
     updatePassword}
     = require('../Controllers/EmployeeController')


router.get('/checkFace',checkEmployeeFace)
router.get("/checkdata",CheckForExistenceData)
router.post('/Signup',SaveSignupData),
router.post('/Login',login),
router.post('/update-password',updatePassword);


module.exports = router;