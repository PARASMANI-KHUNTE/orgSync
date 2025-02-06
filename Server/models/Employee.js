const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    EmployeeID: {
        type: String,
        required: true,
        unique: true
    },
    FaceEmbeddings: {
        type: [[Number]], // Array of arrays of numbers
        required: true,
        validate: {
            validator: function(arr) {
                return arr.every(innerArr => 
                    Array.isArray(innerArr) && innerArr.every(num => typeof num === 'number' && !isNaN(num))
                );
            },
            message: "Embeddings must be a 2D array of valid numbers."
        }
    },
    Attendance: {  // Fixed spelling from "Attendence" to "Attendance"
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attendance"
    },
    Name: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true,
        unique: true
    },
    Phone: {
        type: Number,
        required: true,
        unique: true,
        match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit phone number"] // Ensures it's a valid Indian phone number
    },
    Address: { // Fixed incorrect object definition
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: Number, required: true }
    },
    Password: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Employee", EmployeeSchema);
