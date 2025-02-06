const express = require('express');
const router = express.Router()
const {authMiddleware} = require('../middlewares/authMiddleware')

const {addNewBranch
    ,updateBranch
} =  require('../Controllers/BranchController')

router.use(authMiddleware);

router.post('/addBranch',addNewBranch)
router.put('/updateBranch',updateBranch)


module.exports = router;