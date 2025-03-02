const argon2 = require('argon2')
const Employee = require('../models/Employee')
const faceapi = require('face-api.js')
const {generateToken} = require('../Utils/TokenService')
const {sendOTP} = require('../Utils/OtpService')



exports.checkEmployeeFace = async (req, res) => {
    try {
        const { embedding } = req.body;
        const id = req.user.payload?.userId;
        const branchId = req.user.payload?.userbranchId;

        // Validate employer ID
        if (!id) {
            return res.status(400).json({ message: "Employer ID is required." });
        }

        // Convert embedding object to an array
        let parsedEmbedding;
        try {
            if (Array.isArray(embedding)) {
                parsedEmbedding = embedding.map(Number);
            } else if (embedding instanceof Float32Array) {
                parsedEmbedding = Array.from(embedding);
            } else if (typeof embedding === "object" && embedding !== null) {
                parsedEmbedding = Object.values(embedding).map(Number);
            } else {
                throw new Error("Invalid embedding format.");
            }
        } catch (err) {
            return res.status(400).json({ message: "Invalid embedding format. Expected an array of numbers." });
        }

        // Ensure parsed embedding is a valid array of 128 numbers
        if (!Array.isArray(parsedEmbedding) || parsedEmbedding.length !== 128 || !parsedEmbedding.every(num => typeof num === "number" && !isNaN(num))) {
            return res.status(400).json({ success: false, message: "Invalid embedding data. Expected an array of 128 numbers." });
        }

        // Fetch all employees under the given branch
        let employees = await Employee.find({ BranchId: branchId });

        if (!employees || employees.length === 0) {
            return res.status(200).json({
                success: false,
                message: "Face does not exist"
            });
        }

        // Compare parsed embedding with stored 2D FaceEmbeddings array
        for (let employee of employees) {
            if (!employee.FaceEmbeddings || employee.FaceEmbeddings.length === 0) continue;

            for (let storedEmbedding of employee.FaceEmbeddings) {  // Loop through stored 2D embeddings
                if (!Array.isArray(storedEmbedding) || storedEmbedding.length !== 128) continue; // Ensure stored embedding is valid

                const distance = faceapi.euclideanDistance(parsedEmbedding, storedEmbedding);

                if (distance < 0.5) {  // Threshold for similarity
                    return res.status(200).json({
                        message: "Face already exists",
                        success: true,
                        employee
                    });
                }
            }
        }

        return res.status(200).json({
            success: false,
            message: "No matching face found"
        });

    } catch (error) {
        console.error("Error in face recognition:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.CheckForExistenceData = async (req, res) => {
    try {
        const { EmployeeID, Name, Email, Phone } = req.query;


        if (!EmployeeID || !Name || !Email || !Phone ) {
            return res.status(400).json({
                success: false,
                message: "Missing Fields",
            });
        }

        // Check if SuperAdmin with Email or Phone exists
        const AlreadyAuser = await Employee.findOne({ $or: [{EmployeeID},{ Email }, { Phone }] });
        if (AlreadyAuser) {
            return res.status(400).json({
                success: false, // Fix: should be false for errors
                message: "Employee Already Exists",
            });
        }


        return res.status(200).json({
            success: true, // Fix: should be true for success
            message: "No details matched",
        });

    } catch (error) {
        console.error("Error in CheckForExistenceData:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message, // Return error details
        });
    }
}
exports.SaveSignupData = async (req, res) => {
    try {
        let { EmployeeID, Name, Email, Phone, Password, Address, FaceEmbeddings } = req.body;

        const branchId = req.user.payload?.userbranchId;

        // If FaceEmbeddings is a string (e.g., JSON.stringify output), parse it
        if (typeof FaceEmbeddings === "string") {
            try {
                FaceEmbeddings = JSON.parse(FaceEmbeddings);
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid FaceEmbeddings format.",
                });
            }
        }

        // Convert keys in FaceEmbeddings object to an array if needed
        if (FaceEmbeddings && typeof FaceEmbeddings === "object" && !Array.isArray(FaceEmbeddings)) {
            FaceEmbeddings = Object.values(FaceEmbeddings).map(num => parseFloat(num));
        }

        // Ensure FaceEmbeddings is a valid array of 128 numbers
        if (!Array.isArray(FaceEmbeddings) || FaceEmbeddings.length !== 128 || FaceEmbeddings.some(isNaN)) {
            return res.status(400).json({
                success: false,
                message: "FaceEmbeddings must be an array of 128 valid numbers.",
            });
        }

        // Hash password
        const hashedPassword = await argon2.hash(Password);

        // Create new user object
        const newUser = new Employee({
            EmployeeID,
            Name,
            Email,
            Phone,
            Address: {
                city: Address.city,
                state: Address.state,
                pincode: Address.pincode
            },
            FaceEmbeddings,  // Now properly formatted as an array of numbers
            Password: hashedPassword,
            BranchId: branchId
        });

        // Save to database
        await newUser.save();

        return res.status(200).json({
            success: true,
            message: "Successful Signup"
        });

    } catch (error) {
        console.error("Error during signup:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

exports.login = async (req,res) =>{
    try{
        const {Email , Password} = req.body;
        if(!Email , !Password){
            return res.status(400).json({
                messsage : "Missing Fields",
            })
        }
        const user = await Employee.findOne({Email});
        const verifyPassword = await argon2.verify(user.Password,Password)
        if(!verifyPassword){
            return res.status(404).json({
                success : false,
                message : "invalid Creditentials"
            })
        }

        const payload = {
            userId : user.id,
            userName : user.Name,
            userEmail : user.Email,
            userPhone : user.Phone,
            userEmployeeID : user.EmployeeID,
            Address : user.Address
        }


        const token = await generateToken(payload)
        
        return res.status(200).json({
            success : true,
            message : "Successfully Login",
            token
        })
    }catch(error){
        console.log(error)
    }
}
exports.updatePassword = async (req, res) => {
    try {
        const { Password } = req.body;
        
        if (!Password) {
            return res.status(400).json({
                success: false,
                message: "Missing field"
            });
        }

        // Get User ID from Token Payload
        const userId = req.user.payload?.userId; // Assuming payload contains { user: { id: '...' } }
        
        if (!userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: User ID missing"
            });
        }

        // Hash new password
        const hashedPassword = await argon2.hash(Password);

        // Update password in database
        await Employee.findByIdAndUpdate(userId, { Password: hashedPassword });

        return res.status(200).json({
            success: true,
            message: "Password has been updated."
        });

    } catch (error) {
        console.error("Error updating password:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

exports.resetPassword = async (req,res) =>{
    const { email } = req.body;

    // Validate email input
    if (!email) {
        return res.status(400).json({
            success : false,
            message: "Please Provide Email"
        });
    }

    try {
        // Check if user exists in the database
        const isUser = await Employee.findOne({ email }); // Await the database call
        if (!isUser) {
            return res.status(404).json({
                success : false,
                message: "User Does not exist"
            });
        }
   
        await sendOTP(email);

        // Respond with success message and token
        return res.status(200).json({
            success : true,
            message: `OTP sent successfully to ${email}`,
        });
    } catch (error) {
        // console.error("Error in forgot-password route:", error.message);
        return res.status(500).json({
            success : false,
            message: "Internal Server Error"
        });
    }
}

exports.setNewPassword = async (req,res) =>{
    const { email, password } = req.body;

    // Validate the input
    if (!email || !password) {
        return res.status(400).json({
            success : false,
            message: "userId and password are required",
        });
    }

    try {
        const hashedPassword = await argon2.hash(password);
      
        // Find the user by ID and update the password
        const user = await Employee.findOneAndUpdate(
            {Email : email},
            { Password: hashedPassword },
            { new: true } // Return the updated document
        );

        if (!user) {
            return res.status(404).json({
                success : false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success : true,
            message: "Password updated successfully",
        });
    } catch (error) {
        // console.error("Error updating password:", error.message);
        return res.status(500).json({
            success : false,
            message: "Internal server error",
        });
    }
}


exports.assignWork = async (req, res) => {
    try {
        const { employeeId, departmentId } = req.body;

        if (!employeeId || !departmentId) {
            return res.status(400).json({ success: false, message: "Employee ID and Department ID are required." });
        }

        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found." });
        }

        employee.assignedDepartment = departmentId;
        await employee.save();

        res.status(200).json({ success: true, message: "Department assigned successfully." });
    } catch (error) {
        console.error("Error assigning department:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
}

exports.getEmployees = async (req,res) =>{
    const branchId = req.user.payload?.userbranchId

    const employees = await Employee.find({ BranchId: branchId }).select("-FaceEmbeddings -Password");

    if(!employees){
        return res.status(200).json({
            success : false,
            message : "No Employees Found"
        })
    }
    
    
    return res.status(200).json({
        success : true,
        employees,
        message : "Succesfully got the data"
    })


};
exports.getEmployee = async (req,res) =>{
    const {id , employeeId} = req.body;

    const employees = await Employee.findOne({employer : id})
    if(!employees){
        return res.status(200).json({
            message : "No Employees Found"
        })
    }
    // let userdata =[]
    // let noOfemployees = employees.length()
    // for(i;i>=noOfemployees,i++){
    //     const employee = await User.findOne({employeeId})
    //     if(employee)
    // }
    return res.status(200).json({
        success : true,
        employees,
        message : "Succesfully got the data"
    })


};


exports.UpdateEmployeeData = async (req, res) => {
    try {
        const { id } = req.params; // Get employee _id from URL params
        const { EmployeeID, Name, Phone, Address } = req.body;
        const branchId = req.user.payload?.userbranchId;



        // Find the employee by _id and BranchId
        const employee = await Employee.findOne({ _id: id, BranchId: branchId });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found.",
            });
        }

        // Update only the provided fields
        if (EmployeeID) employee.EmployeeID = EmployeeID;
        if (Name) employee.Name = Name;
        if (Phone) employee.Phone = Phone;
        if (Address) {
            employee.Address.city = Address.city || employee.Address.city;
            employee.Address.state = Address.state || employee.Address.state;
            employee.Address.pincode = Address.pincode || employee.Address.pincode;
        }

        // Save the updated employee details
        await employee.save();

        return res.status(200).json({
            success: true,
            message: "Employee details updated successfully.",
        });

    } catch (error) {
        console.error("Error updating employee data:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};
