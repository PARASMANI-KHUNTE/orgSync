const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true,
        unique: true
    },
    Task: {
        type: [String],
        required: true
    },
    AssignedEmployees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee"
    }]
}, { timestamps: true });

module.exports = mongoose.model("Department", DepartmentSchema);
