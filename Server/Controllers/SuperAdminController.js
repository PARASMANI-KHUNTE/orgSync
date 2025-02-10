const argon2 = require('argon2')
const SuperAdmin = require('../models/SuperAdmin')
const {generateToken} = require('../Utils/TokenService')
const {sendOTP} = require('../Utils/OtpService')

exports.CheckForExistenceData = async (req, res) => {
    try {
        const { Name, Email, Phone } = req.body;

        if (!Name || !Email || !Phone ) {
            return res.status(400).json({
                success: false,
                message: "Missing Fields",
            });
        }

        // Check if SuperAdmin with Email or Phone exists
        const AlreadyAuser = await SuperAdmin.findOne({ $or: [{ Email }, { Phone }] });
        if (AlreadyAuser) {
            return res.status(400).json({
                success: false, // Fix: should be false for errors
                message: "Super Admin Already Exists",
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
};
exports.SaveSignupData = async (req,res) =>{
    try{
        const {Name , Email , Phone , Password} = req.body;
        if(!Name || !Email || !Phone  || !Password){
            return res.status(400).json({
                messsage : "Missing Fields",
            })
        }

        const hassPassword = await argon2.hash(Password);


        const newUser = new SuperAdmin({
            Name,
            Email,
            Phone,
            Password : hassPassword ,
            isVerified : true ,

        })

        await newUser.save();

        return res.status(200).json({
            success : true,
            message : "Successfull Signup"
        })

    }catch(error){
        console.log(error)
    }
}
exports.login = async (req,res) =>{
    try{
        const {Email , Password} = req.body;
        if(!Email , !Password){
            return res.status(400).json({
                messsage : "Missing Fields",
            })
        }
        const user = await SuperAdmin.findOne({Email});
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
        await SuperAdmin.findByIdAndUpdate(userId, { Password: hashedPassword });

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
        const isUser = await SuperAdmin.findOne({ Email : email }); // Await the database call
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
        const user = await SuperAdmin.findOneAndUpdate(
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
