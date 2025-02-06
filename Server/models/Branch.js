const mongoose = require('mongoose');

const BranchSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    Location: {
        type: String,
        required: true
    },
    Status: {
        type: String,
        default: "Active"
    },
    Department: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
    }],
    Manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BranchManager",
        required: true,
        unique: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Branch", BranchSchema);
