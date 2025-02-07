const mongoose = require('mongoose');

const BranchManagerSchema = new mongoose.Schema({
    EmployeeID: {
        type: String,
        unique: true,
        required: true
    },
    Name: {
        type: String,
        required: true,
        unique: true,
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
    },
    Password : {
        type : String,
    },
    Verified : {
        type :Boolean,
        default : false
    },
    OrgId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Organization"
    },
    branchId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Branch"
    }
}, { timestamps: true });

module.exports = mongoose.model("BranchManager", BranchManagerSchema);
