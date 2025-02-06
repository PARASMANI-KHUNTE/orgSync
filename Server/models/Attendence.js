const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    checkInOut: [{
        date: { type: Date, required: true },  // Date of check-in/out
        checkIn: { type: Date },               // Check-in timestamp
        checkOut: { type: Date },              // Check-out timestamp
        hours: { type: Number, default: 0 },   // Total work hours
        overTime: { type: Number, default: 0 } // Overtime hours
    }],
    Employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Attendance", AttendanceSchema);
