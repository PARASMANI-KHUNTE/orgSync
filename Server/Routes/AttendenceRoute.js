const express = require('express')
const { authMiddleware } = require('../middlewares/authMiddleware')
const router = express.Router()
const {checkInOut,
    employeeCheckin,
    employeeCheckOut,
    employeeAttendance,
    getAttendance,
    getAttendanceById
} = require('../Controllers/AttendenceController')
router.use(authMiddleware)


router.post('/checkInOut',employeeAttendance)
// router.post('/Checkin',employeeCheckin)
// router.post('/CheckOut',employeeCheckOut)
router.get('/getAttendence',getAttendance)
router.get('/getAttendanceById',getAttendanceById)

module.exports = router