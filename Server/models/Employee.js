const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    EmployeeID: {
        type: String,
        required: true,
        unique: true
    },
    FaceEmbeddings: {
        type:[[Number]],  // 2D array of 128 numbers
        required: true,
    
    }
    
    ,
    Attendance: {  
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
    Address: { 
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: Number, required: true }
    },
    Password: {
        type: String,
        required: true
    },
    assignedDepartment : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Department"
    },
    BranchId  : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Branch"
    }
});

module.exports = mongoose.model("Employee", EmployeeSchema);
