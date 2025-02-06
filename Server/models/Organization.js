const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true,
        unique: true
    },
    Location: {
        type: String,
        required: true
    },
    AdminId  : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "SuperAdmin"
    }
}, { timestamps: true });

module.exports = mongoose.model("Organization", OrganizationSchema);
