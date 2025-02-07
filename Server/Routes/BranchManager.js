const express = require('express')
const router = express.Router()
const {authMiddleware} = require('../middlewares/authMiddleware')
const {
    getBranchManagers,
    addBranchManager ,
    removeBranchManager,
    updateBranchManager,
    assignBranch,
    sendVerificationLink,
    setPassword
} = require('../Controllers/BranchManagerController')
router.use(authMiddleware)

router.post('/get',getBranchManagers);
router.post('/add',addBranchManager);
router.delete('/remove',removeBranchManager);
router.put('/update',updateBranchManager);
router.put('/assign',assignBranch);
// Add these routes to your backend routes file
router.post('/sendlink', sendVerificationLink);
router.post('/set-password', setPassword);
module.exports = router;