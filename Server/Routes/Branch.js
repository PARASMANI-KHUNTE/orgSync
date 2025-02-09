const express = require('express');
const router = express.Router()
const {authMiddleware} = require('../middlewares/authMiddleware')

const {addNewBranch
    ,updateBranch
    ,deleteBranch
    ,getBranches,
    getBranchById
} =  require('../Controllers/BranchController')

router.use(authMiddleware);

router.post('/addBranch',addNewBranch)
router.put('/updateBranch',updateBranch)
router.delete('/deleteBranch',deleteBranch)
router.get('/getBranches',getBranches)
router.get('/:branchId', getBranchById);
module.exports = router;