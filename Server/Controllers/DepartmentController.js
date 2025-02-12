const Department = require('../models/Department')
// Create a new Department
exports.createDepartment = async (req, res) => {
    try {
        const { Name } = req.body;
        const branchId =  req.user.payload?.userbranchId
        console.log(Name , branchId)

        if (!Name || !branchId) {
            return res.status(400).json({ success: false, message: "Name and branchId are required" });
        }

        const existingDepartment = await Department.findOne({ Name, branchId });

        if (existingDepartment) {
            return res.status(400).json({ success: false, message: "Department already exists" });
        }

        const newDepartment = new Department({ Name, branchId });

        await newDepartment.save();

        res.status(201).json({ success: true, message: "Department created successfully", data: newDepartment });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

exports.getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find().populate("branchId");
        res.status(200).json({ success: true, data: departments });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};
exports.getDepartmentById = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id).populate("branchId");

        if (!department) {
            return res.status(404).json({ success: false, message: "Department not found" });
        }

        res.status(200).json({ success: true, data: department });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// Update Department
exports.updateDepartment = async (req, res) => {
    try {
        const { Name} = req.body;
        const branchId =  req.user.payload?.userbranchId
        const department = await Department.findByIdAndUpdate(
            req.params.id,
            { Name, branchId },
            { new: true, runValidators: true }
        );

        if (!department) {
            return res.status(404).json({ success: false, message: "Department not found" });
        }

        res.status(200).json({ success: true, message: "Department updated successfully", data: department });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// Delete Department
exports.deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);

        if (!department) {
            return res.status(404).json({ success: false, message: "Department not found" });
        }

        res.status(200).json({ success: true, message: "Department deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// // Assign Task to Department
// exports.assignTask = async (req, res) => {
//     try {
//         const { task } = req.body;

//         if (!task) {
//             return res.status(400).json({ success: false, message: "Task is required" });
//         }

//         const department = await Department.findByIdAndUpdate(
//             req.params.id,
//             { $push: { Task: task } },
//             { new: true }
//         );

//         if (!department) {
//             return res.status(404).json({ success: false, message: "Department not found" });
//         }

//         res.status(200).json({ success: true, message: "Task assigned successfully", data: department });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
//     }
// };

// // Remove Task from Department
// exports.removeTask = async (req, res) => {
//     try {
//         const { task } = req.body;

//         const department = await Department.findByIdAndUpdate(
//             req.params.id,
//             { $pull: { Task: task } },
//             { new: true }
//         );

//         if (!department) {
//             return res.status(404).json({ success: false, message: "Department not found" });
//         }

//         res.status(200).json({ success: true, message: "Task removed successfully", data: department });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
//     }
// };

// // Update Task in Department
// exports.updateTask = async (req, res) => {
//     try {
//         const { oldTask, newTask } = req.body;

//         if (!oldTask || !newTask) {
//             return res.status(400).json({ success: false, message: "Old and new task are required" });
//         }

//         const department = await Department.findById(req.params.id);

//         if (!department) {
//             return res.status(404).json({ success: false, message: "Department not found" });
//         }

//         const taskIndex = department.Task.indexOf(oldTask);

//         if (taskIndex === -1) {
//             return res.status(400).json({ success: false, message: "Task not found in department" });
//         }

//         department.Task[taskIndex] = newTask;
//         await department.save();

//         res.status(200).json({ success: true, message: "Task updated successfully", data: department });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
//     }
// };
