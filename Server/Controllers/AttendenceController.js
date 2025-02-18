const Employee = require('../models/Employee');
const Attendance = require('../models/Attendence');
const faceapi = require('face-api.js'); // Ensure this is imported correctly

// exports.checkInOut = async (req, res) => {
//     try {
//         const { embedding } = req.body;
//         const branchId = req.user?.payload?.userbranchId;

//         if (!branchId) {
//             return res.status(400).json({ message: "Branch ID is required." });
//         }

//         // Validate and parse embedding
//         let parsedEmbedding;
//         try {
//             if (Array.isArray(embedding)) {
//                 parsedEmbedding = embedding.map(Number);
//             } else if (embedding instanceof Float32Array) {
//                 parsedEmbedding = Array.from(embedding);
//             } else if (typeof embedding === "object" && embedding !== null) {
//                 parsedEmbedding = Object.keys(embedding).map(key => Number(embedding[key]));
//             } else {
//                 throw new Error("Invalid embedding format.");
//             }
//         } catch (err) {
//             return res.status(400).json({ message: "Invalid embedding format. Expected an array of numbers." });
//         }

//         if (!parsedEmbedding.every(num => typeof num === "number" && !isNaN(num))) {
//             return res.status(400).json({ message: "Embedding array contains invalid values." });
//         }

//         // Fetch employees under the given branch
//         let employees = await Employee.find({ BranchId: branchId });

//         for (let employee of employees) {
//             if (!employee.FaceEmbeddings || employee.FaceEmbeddings.length === 0) continue;

//             for (let storedEmbedding of employee.FaceEmbeddings) {
//                 const distance = faceapi.euclideanDistance(parsedEmbedding, storedEmbedding);
//                 if (distance < 0.5) { // Threshold for similarity
//                     const today = new Date();
//                     today.setHours(0, 0, 0, 0);

//                     // Fetch or create attendance record
//                     let attendanceRecord = await Attendance.findOne({ Employee: employee._id });
//                     if (!attendanceRecord) {
//                         attendanceRecord = new Attendance({
//                             Employee: employee._id,
//                             checkInOut: []
//                         });
//                     }

//                     // Check if already checked in today
//                     let latestCheckIn = attendanceRecord.checkInOut.find(entry => {
//                         const entryDate = new Date(entry.date);
//                         entryDate.setHours(0, 0, 0, 0);
//                         return entryDate.getTime() === today.getTime();
//                     });

//                     if (latestCheckIn) {
//                         return res.status(200).json({
//                             message: "Already checked in for today.",
//                             success: false,
//                             latestCheckIn: {
//                                 date: latestCheckIn.date,
//                                 checkIn: latestCheckIn.checkIn,
//                                 checkOut: latestCheckIn.checkOut
//                             }
//                         });
//                     }

//                     // Perform check-in
//                     const newCheckIn = {
//                         date: new Date(),
//                         checkIn: new Date(),
//                         checkOut: null
//                     };

//                     attendanceRecord.checkInOut.push(newCheckIn);
//                     await attendanceRecord.save();

//                     return res.status(200).json({
//                         message: "Check-in successful.",
//                         success: true,
//                         checkInTime: newCheckIn.checkIn
//                     });
//                 }
//             }
//         }

//         return res.status(404).json({ message: "No matching employee found." });

//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: "Server error", error: error.message });
//     }
// };


// exports.employeeCheckin = async (req, res) => {
//     try {
//         console.log("request revcived ")
//         const { embedding } = req.body;
//         console.log(`Recived embedings are - ${embedding}`)
//         const branchId = req.user.payload?.userbranchId;
//         console.log("request revcived ")
      

//         if (!branchId) {
//             return res.status(400).json({ message: "Branch ID is required." });
//         }

//         let parsedEmbedding;
//         try {
//             parsedEmbedding = parseEmbedding(embedding);
//         } catch (err) {
//             return res.status(400).json({ message: err.message });
//         }

//         let employees = await Employee.find({ BranchId: branchId });

//         for (let employee of employees) {
//             if (!employee.FaceEmbeddings || employee.FaceEmbeddings.length === 0) continue;

//             for (let storedEmbedding of employee.FaceEmbeddings) {
//                 const distance = faceapi.euclideanDistance(parsedEmbedding, storedEmbedding);
//                 if (distance < 0.5) {
//                     const today = new Date();
//                     today.setHours(0, 0, 0, 0);

//                     let attendanceRecord = await Attendance.findOne({ Employee: employee._id });

//                     if (!attendanceRecord) {
//                         attendanceRecord = new Attendance({
//                             Employee: employee._id,
//                             checkInOut: []
//                         });
//                     }

//                     let latestCheckIn = attendanceRecord.checkInOut.find(entry => {
//                         const entryDate = new Date(entry.date);
//                         entryDate.setHours(0, 0, 0, 0);
//                         return entryDate.getTime() === today.getTime();
//                     });

//                     if (latestCheckIn) {
//                         return res.status(200).json({
//                             message: "Already checked in for today.",
//                             success: false,
//                             latestCheckIn: latestCheckIn
//                         });
//                     }

//                     // Perform check-in
//                     const newCheckIn = {
//                         date: new Date(),
//                         checkIn: new Date(),
//                         checkOut: null
//                     };

//                     attendanceRecord.checkInOut.push(newCheckIn);
//                     await attendanceRecord.save();

//                     return res.status(200).json({
//                         message: "Check-in successful.",
//                         success: true,
//                         checkInTime: newCheckIn.checkIn
//                     });
//                 }
//             }
//         }
//         return res.status(400).json({ message: "Face not recognized." });
//     } catch (error) {
//         return res.status(500).json({ message: "Server error.", error: error.message });
//     }
// };

// exports.employeeCheckOut = async (req, res) => {
//     try {
//         const { embedding } = req.body;
//         const branchId = req.user.payload?.userbranchId;
//         console.log("request revcived ")

//         if (!branchId) {
//             return res.status(400).json({ message: "Branch ID is required." });
//         }

//         let parsedEmbedding;
//         try {
//             parsedEmbedding = parseEmbedding(embedding);
//         } catch (err) {
//             return res.status(400).json({ message: err.message });
//         }

//         let employees = await Employee.find({ BranchId: branchId });

//         for (let employee of employees) {
//             if (!employee.FaceEmbeddings || employee.FaceEmbeddings.length === 0) continue;

//             for (let storedEmbedding of employee.FaceEmbeddings) {
//                 const distance = faceapi.euclideanDistance(parsedEmbedding, storedEmbedding);
//                 if (distance < 0.5) {
//                     const today = new Date();
//                     today.setHours(0, 0, 0, 0);

//                     let attendanceRecord = await Attendance.findOne({ Employee: employee._id });

//                     if (!attendanceRecord) {
//                         return res.status(400).json({ message: "No check-in record found. Please check in first." });
//                     }

//                     let latestEntry = attendanceRecord.checkInOut.find(entry => {
//                         const entryDate = new Date(entry.date);
//                         entryDate.setHours(0, 0, 0, 0);
//                         return entryDate.getTime() === today.getTime();
//                     });

//                     if (!latestEntry || latestEntry.checkOut) {
//                         return res.status(200).json({
//                             message: "Already checked out for today.",
//                             success: false,
//                             latestCheckOut: latestEntry
//                         });
//                     }

//                     // Perform check-out
//                     latestEntry.checkOut = new Date();
//                     await attendanceRecord.save();

//                     return res.status(200).json({
//                         message: "Check-out successful.",
//                         success: true,
//                         checkOutTime: latestEntry.checkOut
//                     });
//                 }
//             }
//         }
//         return res.status(400).json({ message: "Face not recognized." });
//     } catch (error) {
//         return res.status(500).json({ message: "Server error.", error: error.message });
//     }
// };

// function parseEmbedding(embedding) {
//     if (Array.isArray(embedding)) {
//         return embedding.map(Number);
//     } else if (embedding instanceof Float32Array) {
//         return Array.from(embedding);
//     } else if (typeof embedding === "object" && embedding !== null) {
//         return Object.values(embedding).map(Number);
//     }
//     throw new Error("Invalid embedding format. Expected an array of numbers.");
// }



exports.employeeAttendance = async (req, res) => {
    try {
        console.log("Request received for attendance");

        const { embedding } = req.body;
        const branchId = req.user.payload?.userbranchId;

        if (!branchId) {
            return res.status(400).json({ message: "Branch ID is required." });
        }

        let parsedEmbedding;
        try {
            parsedEmbedding = parseEmbedding(embedding);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        // Fetch all employees from the branch
        let employees = await Employee.find({ BranchId: branchId });

        for (let employee of employees) {
            if (!employee.FaceEmbeddings || employee.FaceEmbeddings.length === 0) continue;

            for (let storedEmbedding of employee.FaceEmbeddings) {
                const distance = faceapi.euclideanDistance(parsedEmbedding, storedEmbedding);
                
                if (distance < 0.5) {  // Face recognized
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    let attendanceRecord = await Attendance.findOne({ Employee: employee._id });

                    if (!attendanceRecord) {
                        // No previous attendance record exists, create a new one
                        attendanceRecord = new Attendance({
                            Employee: employee._id,
                            checkInOut: []
                        });
                    }

                    // Find today's entry
                    let todayEntry = attendanceRecord.checkInOut.find(entry => {
                        const entryDate = new Date(entry.date);
                        entryDate.setHours(0, 0, 0, 0);
                        return entryDate.getTime() === today.getTime();
                    });

                    if (!todayEntry) {
                        // If no check-in exists for today → Mark Check-In
                        const newCheckIn = {
                            date: new Date(),
                            checkIn: new Date(),
                            checkOut: null
                        };
                        attendanceRecord.checkInOut.push(newCheckIn);
                        await attendanceRecord.save();

                        return res.status(200).json({
                            message: "Check-in successful.",
                            success: true,
                            checkInTime: newCheckIn.checkIn
                        });

                    } else if (!todayEntry.checkOut) {
                        // If checked in but not checked out → Mark Check-Out
                        todayEntry.checkOut = new Date();
                        await attendanceRecord.save();

                        return res.status(200).json({
                            message: "Check-out successful.",
                            success: true,
                            checkOutTime: todayEntry.checkOut
                        });

                    } else {
                        // If already checked in and checked out
                        return res.status(200).json({
                            message: "Already checked in and checked out for today.",
                            success: false,
                            checkInTime: todayEntry.checkIn,
                            checkOutTime: todayEntry.checkOut
                        });
                    }
                }
            }
        }

        // If no matching face was found
        return res.status(400).json({ message: "Face not recognized." });

    } catch (error) {
        return res.status(500).json({ message: "Server error.", error: error.message });
    }
};

// Function to parse embeddings properly
function parseEmbedding(embedding) {
    if (Array.isArray(embedding)) {
        return embedding.map(Number);
    } else if (embedding instanceof Float32Array) {
        return Array.from(embedding);
    } else if (typeof embedding === "object" && embedding !== null) {
        return Object.values(embedding).map(Number);
    }
    throw new Error("Invalid embedding format. Expected an array of numbers.");
}


exports.getAttendance = async (req, res) => {
    const { id } = req.query; // <-- Change from req.body to req.query

    if (!id) {
        return res.status(400).json({ success: false, message: "Employee ID is required" });
    }

    const ValidateEmployee = await Employee.findById(id);
    if (!ValidateEmployee) {
        return res.status(400).json({ success: false, message: "Invalid Employee" });
    }

    const AttendanceRecord = await Attendance.findOne({ Employee: id });
    if (AttendanceRecord) {
        return res.status(200).json({ success: true, AttendanceRecord });
    } else {
        return res.status(404).json({ success: false, message: "No attendance record found" });
    }
};

exports.getAttendanceById = async (req, res) => {
     
    const id = req.user?.payload?.userId;

    if (!id) {
        return res.status(400).json({ success: false, message: "Employee ID is required" });
    }

    const ValidateEmployee = await Employee.findById(id);
    if (!ValidateEmployee) {
        return res.status(400).json({ success: false, message: "Invalid Employee" });
    }

    const AttendanceRecord = await Attendance.findOne({ Employee: id });
    if (AttendanceRecord) {
        return res.status(200).json({ success: true, AttendanceRecord });
    } else {
        return res.status(404).json({ success: false, message: "No attendance record found" });
    }
};