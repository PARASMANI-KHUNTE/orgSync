const express = require('express');
const router = express.Router()
const {addOrganization
    ,getOrg,
    updateOrganization
} = require('../Controllers/OranizationController')

const {authMiddleware} = require('../middlewares/authMiddleware')



router.use(authMiddleware);
router.get('/getOrg', getOrg);
router.post("/addOrganization",addOrganization);
router.put("/updateOrg",updateOrganization);

module.exports = router;