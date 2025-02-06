const mongoose = require('mongoose');

const SuperAdminSchema = new mongoose.Schema({
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
        type: String,
        required: true,
        unique: true,
        match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit phone number"] // Ensures valid format
    },
    Password : {
        type : String,
        required : true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    Organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    }
}, { timestamps: true });

module.exports = mongoose.model("SuperAdmin", SuperAdminSchema);
