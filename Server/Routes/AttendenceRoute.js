const express = require('express')
const { authMiddleware } = require('../middlewares/authMiddleware')
const router = express.Router()
const {checkInOut,
    employeeCheckin,
    employeeCheckOut,
    getAttendance
} = require('../Controllers/AttendenceController')
router.use(authMiddleware)


router.post('/checkInOut',checkInOut)
router.post('/Checkin',employeeCheckin)
router.post('/CheckOut',employeeCheckOut)
router.get('/getAttendence',getAttendance)

module.exports = router