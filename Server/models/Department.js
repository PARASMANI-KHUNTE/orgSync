const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true,
        unique: true
    },
    Task: {
        type: [String],
    },
    branchId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Branch"
        }
}, { timestamps: true });

module.exports = mongoose.model("Department", DepartmentSchema);
