const mongoose = require('mongoose');

const BranchSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true,
        unique : true
    },
    Location: {
        type: String,
        required: true
    },
    OrgId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Organization"
    }
}, { timestamps: true });

module.exports = mongoose.model("Branch", BranchSchema);
