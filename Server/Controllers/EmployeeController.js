const argon2 = require('argon2')
const Employee = require('../models/Employee')

const {generateToken} = require('../Utils/TokenService')
const {sendOTP} = require('../Utils/OtpService')



exports.checkEmployeeFace = async (req, res) => {
    try {
        const { embedding, id } = req.body;
      

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
                parsedEmbedding = Object.keys(embedding).map(key => Number(embedding[key]));
            } else {
                throw new Error("Invalid embedding format.");
            }
        } catch (err) {
            return res.status(400).json({ message: "Invalid embedding format. Expected an array of numbers." });
        }

        // Ensure parsed embedding contains only valid numbers
        if (!parsedEmbedding.every(num => typeof num === "number" && !isNaN(num))) {
            return res.status(400).json({ message: "Embedding array contains invalid values." });
        }

      
        // Fetch all employees under the given employer
        let employees = await Employee.find({ employer: id });

        if (!employees.length) {
            return res.status(400).json({
                status : false,
                message : "No face matched."
            })
        }

        // Check if embedding already exists in any employee
        for (let employee of employees) {
            if (!employee.embeddings || employee.embeddings.length === 0) continue;

            for (let storedEmbedding of employee.embeddings) {
                const distance = faceapi.euclideanDistance(parsedEmbedding, storedEmbedding);

                if (distance < 0.5) {  // Threshold for similarity
                    return res.status(200).json({
                        message: "Face already exists",
                        success : true,
                        employeeId: employee._id
                    });
                }
            }
        }

    } catch (error) {
        console.error("Error in face recognition:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.CheckForExistenceData = async (req, res) => {
    try {
        const {EmployeeID , Name, Email, Phone } = req.body;

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
        const { EmployeeID, Name, Email, Phone, Password, Address, FaceEmbeddings } = req.body;

        // Validate required fields
        if (!EmployeeID || !Name || !Email || !Phone || !Password || !Address || !FaceEmbeddings) {
            return res.status(400).json({
                success: false,
                message: "Missing Fields",
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
            FaceEmbeddings,  // Added FaceEmbeddings
            Password: hashedPassword,
            isVerified: true, // Make sure your schema has this field if you're using it
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
            userPhone : user.Phone
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



exports.employeeCheckin = async (req,res)=>{

    try {
        const { embedding, id } = req.body;
      

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
                parsedEmbedding = Object.keys(embedding).map(key => Number(embedding[key]));
            } else {
                throw new Error("Invalid embedding format.");
            }
        } catch (err) {
            return res.status(400).json({ message: "Invalid embedding format. Expected an array of numbers." });
        }

        // Ensure parsed embedding contains only valid numbers
        if (!parsedEmbedding.every(num => typeof num === "number" && !isNaN(num))) {
            return res.status(400).json({ message: "Embedding array contains invalid values." });
        }

      
        // Fetch all employees under the given employer
        let employees = await Employee.find({ employer: id });

      // Check if embedding already exists in any employee
for (let employee of employees) {
    if (!employee.embeddings || employee.embeddings.length === 0) continue;

    for (let storedEmbedding of employee.embeddings) {
        const distance = faceapi.euclideanDistance(parsedEmbedding, storedEmbedding);

        if (distance < 0.5) {  // Threshold for similarity

            // Get today's date in YYYY-MM-DD format
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Check if employee has already checked in today
            let latestCheckIn = employee.checkInOut.find(entry => {
                const entryDate = new Date(entry.date);
                entryDate.setHours(0, 0, 0, 0);
                return entryDate.getTime() === today.getTime();
            });

            if (latestCheckIn) {
                return res.status(200).json({
                    message: "Already checked in for today.",
                    success : false,
                    employeeId: employee._id,
                    latestCheckIn: {
                        date: latestCheckIn.date,
                        checkIn: latestCheckIn.checkIn,
                        checkOut: latestCheckIn.checkOut
                    }
                });
            }

            // Mark check-in
            const newCheckIn = {
                date: new Date(),
                checkIn: new Date(),
                checkOut: null // Not checked out yet
            };

            employee.checkInOut.push(newCheckIn);

            await employee.save(); // Save the updated employee record

            return res.status(200).json({
                message: "Check-in successful.",
                success: true,
                employeeId: employee._id,
                checkInTime: newCheckIn.checkIn
            });
        }
    }
}

    
    }
    catch(error){
        return res.status(400).json({
            message : "Server error "
        })
    }

    
}

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
