const BranchManager = require('../models/BranchManager')
const Organization = require('../models/Organization')
const argon2 = require('argon2')
const {generateTokenForBM} = require('../Utils/TokenService')
const jwt = require('jsonwebtoken');
const {sendLink,sendOTP} = require('../Utils/OtpService')
const faceapi = require("face-api.js");
let frontendURl =  ""
if(process.env.Status == "production"){
    frontendURl = process.env.FRONTEND_URL
}else{
    frontendURl = process.env.DevUrl
}
exports.getBranchManagers = async(req,res)=>{
    try {
        const {AdminId} = req.body;
        
        if(!AdminId){
            return res.status(400).json({
                success : false,
                message : "Missing data"
            })
        }

        const org = await Organization.findOne({AdminId})
        if(!org){
            return res.status(400).json({
                success : false,
                message : "No organization found"
            })
        }

        const BranchManagers = await BranchManager.find({OrgId : org.id})
        if(!BranchManagers){
            return res.status(400).json({
                success : false,
                message : "No Brach Manager found"
            })
        }

        return res.status(200).json({
            success : true,
            message : "Got all the Managers",
            BranchManagers
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            message :`Error - ${error}`
        })
        
    }
}
const Joi = require("joi");


const mongoose = require("mongoose");

exports.addBranchManager = async (req, res) => {
    try {
        const { EmployeeID, Name, Email, Phone, AdminId } = req.body;

        // Define Joi validation schema
        const schema = Joi.object({
            EmployeeID: Joi.string().trim().required(),
            Name: Joi.string().trim().required(),
            Email: Joi.string().email().trim().required(),
            Phone: Joi.string()
                .pattern(/^[6-9]\d{9}$/)
                .required()
                .messages({
                    "string.pattern.base": "Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9.",
                }),
            AdminId: Joi.string().trim().required(),
        });

        // Validate request body using Joi
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        // Check if the Branch Manager already exists
        const existingManager = await BranchManager.findOne({
            $or: [{ EmployeeID }, { Email }, { Phone }],
        });

        if (existingManager) {
            return res.status(409).json({
                success: false,
                message: "A Branch Manager with the same Employee ID, Email, or Phone already exists.",
            });
        }

        // Check if the organization exists
        const organization = await Organization.findOne({ AdminId });

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: "No organization found with the given AdminId.",
            });
        }

        // Create and save the new Branch Manager
        const newBranchManager = new BranchManager({
            EmployeeID,
            Name,
            Email,
            Phone,
            OrgId: organization.id,
        });

        await newBranchManager.save();

        return res.status(201).json({
            success: true,
            message: "Branch Manager added successfully.",
        });
    } catch (error) {
        console.error("Error adding Branch Manager:", error);

        // Handle MongoDB duplicate key error (E11000) only for EmployeeID, Email, or Phone
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "A Branch Manager with the same Employee ID, Email, or Phone already exists.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again later.",
        });
    }
};


exports.removeBranchManager = async(req,res)=>{
    try {
        const { id } = req.params;
        const BM = await BranchManager.findOneAndDelete(id);
        if (!BM) {
            return res.status(404).json({
            success: false,
            message: "Branch not found"
            });
        }
          
        return res.status(200).json({
            success: true,
            message: "Branch deleted successfully"
        });
          
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal server error"
              });
        }
}
exports.updateBranchManager = async(req,res)=>{
    try {
        const {EmployeeID , Name , Email , Phone  , BmId } = req.body;
        if(!EmployeeID || !Name || !Email || !Phone || !BmId ){
            return res.status(400).json({
                success : false,
                message : "Data is missing"
            })
        }
        const CheckValidation = await BranchManager.findOne({
            EmployeeID,
            Name,
            Email,
            Phone,
            _id: { $ne: BmId } // Exclude the branch with this ID
        });

        if(CheckValidation){
            return res.status(400).json({
                success : false,
                message : "These Info Already present"
            })
        }
        
        
        const updatedBranchManager = await BranchManager.findByIdAndUpdate(
            BmId,
                { EmployeeID , Name , Email , Phone },
                { new: true }
              );

              return res.status(200).json({
                success: true,
                message: "BranchManager updated successfully",
                data: updatedBranchManager
              });
    } catch (error) {
        return res.status(500).json({
            success : false,
            message :`Error - ${error}`
        })
        
    }
}
exports.assignBranch = async(req,res)=>{
    try {
        const { branchId , BmId} = req.body;
        if(!branchId || !BmId){
            return res.status(400).json({
                success : false,
                message : "Data is missing"
            })
        }
        const user = await BranchManager.findById(BmId)
        if(!user){
            return res.status(400).json({
                success : false ,
                messsage : "invalid User id "
            })
        }
        if(!user.Verified){
            return res.status(404).json({
                success : false ,
                messsage : "user is not verified "
            })
        }
        const BranchM = await BranchManager.findByIdAndUpdate(BmId,{branchId}, { new: true })
        return res.status(200).json({
            success : true ,
            message : "Branch as been assigned to the user",
            BranchM
        })

    } catch (error) {
        return res.status(500).json({
            success : false,
            message :`Error - ${error}`
        })
        
    }
}
exports.sendVerificationLink = async (req, res) => {
  try {
    const { id } = req.body;
    
    const manager = await BranchManager.findById(id);
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found"
      });
    }

    // Create verification token
    const token = jwt.sign(
      { id: manager._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Create verification link
    const verificationLink = `${frontendURl}/set-password/${token}`;

    // Send email with verification link
    // Using your email service (nodemailer, sendgrid, etc.)
    await sendLink({
        to: manager.Email,
        subject: "Verify Your Account",
        html: `<h1>Welcome</h1><p>Click <a href="${verificationLink}">here</a> to verify.</p>`,
      });
      

    return res.status(200).json({
      success: true,
      message: "Verification link sent successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send verification link"
    });
  }
};
exports.setPassword = async (req, res) => {
    try {
      const { token, password } = req.body;
  
      // Validate request body
      if (!token || !password) {
        return res.status(400).json({
          success: false,
          message: "Missing token or password.",
        });
      }
  
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message:
            error.name === "TokenExpiredError"
              ? "The verification link has expired. Please ask your admin to resend the link."
              : "Invalid token. Please ask your admin to resend the link.",
        });
      }
  
      // Ensure token contains a valid user ID
      if (!decoded.id) {
        return res.status(400).json({
          success: false,
          message: "Invalid token payload. Please request a new link.",
        });
      }
  
      // Hash password
      let hashedPassword;
      try {
        hashedPassword = await argon2.hash(password);
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Error hashing password. Please try again later.",
        });
      }
  
      // Update the Branch Manager's password
      const manager = await BranchManager.findByIdAndUpdate(
        decoded.id,
        { Password: hashedPassword, Verified: true },
        { new: true }
      );
  
      if (!manager) {
        return res.status(404).json({
          success: false,
          message: "Branch Manager not found. Please check the link or contact your admin.",
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "Password has been set successfully. You can now log in.",
      });
  
    } catch (error) {
      console.error("Error setting password:", error);
      return res.status(500).json({
        success: false,
        message: "Something went wrong. Please try again later.",
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
        const user = await BranchManager.findOne({Email});
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
            userbranchId : user.branchId
        }


        const token = await generateTokenForBM(payload)
        
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
        await BranchManager.findByIdAndUpdate(userId, { Password: hashedPassword });

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
        const isUser = await BranchManager.findOne({ Email : email }); // Await the database call
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
        const user = await BranchManager.findOneAndUpdate(
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
            message: "Internal server error",
        });
    }
}




