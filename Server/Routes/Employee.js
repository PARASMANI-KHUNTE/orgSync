const express = require('express');
const router = express.Router();


const {
     checkEmployeeFace , 
     CheckForExistenceData  , 
     SaveSignupData,
     login,
     updatePassword,
     resetPassword,
     setNewPassword,
     getEmployees,
     assignWork,
     UpdateEmployeeData}
     = require('../Controllers/EmployeeController');
const { authMiddleware } = require('../middlewares/authMiddleware');
router.post('/Login',login),
router.use(authMiddleware)
router.post('/checkFace',checkEmployeeFace)
router.get("/checkdata",CheckForExistenceData)
router.post('/Signup',SaveSignupData),
router.post('/update-password',updatePassword);
router.post('/reset-password',resetPassword)
router.put('/updatePassword',setNewPassword)
router.get('/getEmployees',getEmployees)
router.post('/assignDepartment',assignWork)
router.put('/updateEmployeeDetails/:id', UpdateEmployeeData);

module.exports = router;