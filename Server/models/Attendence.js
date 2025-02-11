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
    }
}, { timestamps: true });


// Pre-save hook: calculate hours for each entry where checkOut is set
AttendanceSchema.pre("save", function (next) {
    this.checkInOut.forEach((entry) => {
      if (entry.checkIn && entry.checkOut) {
        const diffMs = entry.checkOut - entry.checkIn; // milliseconds
        const totalHours = diffMs / (1000 * 60 * 60);  // convert to hours
        entry.hours = parseFloat(totalHours.toFixed(2));
      }
    });
    next();
  });

module.exports = mongoose.model("Attendance", AttendanceSchema);
