const express = require('express');
const router = express.Router();
const {authMiddleware} = require('../middlewares/authMiddleware')

const {
    CheckForExistenceData ,
    SaveSignupData ,
    login,
    updatePassword,
    resetPassword,
    setNewPassword
} = require('../Controllers/SuperAdminController')


router.get('/verifyData',CheckForExistenceData),
router.post('/SaveSignupData',SaveSignupData),
router.post('/Login',login),
router.post('/reset-password',resetPassword)
router.put('/updatePassword',setNewPassword)
router.post('/update-password',authMiddleware,updatePassword);


module.exports = router;