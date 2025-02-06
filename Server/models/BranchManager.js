const mongoose = require('mongoose');

const BranchManagerSchema = new mongoose.Schema({
    EmployeeID: {
        type: String,
        unique: true,
        required: true
    },
    Name: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        unique: true, 
        required: true
    },
    Phone: {
        type: String,
        unique: true,
        required: true,
        match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit phone number"]
    }
}, { timestamps: true });

module.exports = mongoose.model("BranchManager", BranchManagerSchema);
