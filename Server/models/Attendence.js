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


// Pre-save hook: calculate hours, minutes, and seconds for each entry where checkOut is set
AttendanceSchema.pre("save", function (next) {
  this.checkInOut.forEach((entry) => {
    if (entry.checkIn && entry.checkOut) {
      const diffMs = entry.checkOut - entry.checkIn; // Total difference in milliseconds

      // Convert to hours, minutes, and seconds
      const totalSeconds = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      // Store the formatted time (e.g., "2 hr 9 min 38 sec")
      entry.hours = `${hours} hr ${minutes} min ${seconds} sec`;
    }
  });
  next();
});

module.exports = mongoose.model("Attendance", AttendanceSchema);
