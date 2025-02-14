const BranchManager = require('../models/BranchManager')
const Organization = require('../models/Organization')
const argon2 = require('argon2')
const {generateTokenForBM} = require('../Utils/TokenService')
const jwt = require('jsonwebtoken');
const {sendLink,sendOTP} = require('../Utils/OtpService')
const faceapi = require("face-api.js");

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
exports.addBranchManager  = async(req,res)=>{
    try {
        const {EmployeeID , Name , Email , Phone , AdminId } = req.body;
        if(!EmployeeID || !Name || !Email || !Phone || !AdminId){
            return res.status(400).json({
                success : false,
                message : "Data is missing"
            })
        }

        const CheckValidation = await BranchManager.findOne({
            $or: [{ EmployeeID }, { Email }, { Phone }]
        });
        
        if(CheckValidation){
            return res.status(400).json({
                success : false,
                message : "User already Exist"
            })
        }

        const org = await Organization.findOne({AdminId})
        if(!org){
            return res.status(400).json({
                success : false,
                message : "No Organization Found"
            })
        }

        const NewBranchManager = new BranchManager({
            EmployeeID , Name , Email , Phone , OrgId : org.id
        })

        await NewBranchManager.save()

        return res.status(200).json({
            success : true,
            message : "Data has been saved"
        })


    } catch (error) {
        return res.status(500).json({
            success : false,
            message :`Error - ${error}`
        })
        
    }
}
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
    const verificationLink = `${process.env.FRONTEND_URL}/set-password/${token}`;

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

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const hashedPassword = await argon2.hash(password);

    // Update user
    const manager = await BranchManager.findByIdAndUpdate(
      decoded.id,
      {
        Password: hashedPassword,
        Verified: true
      },
      { new: true }
    );

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password set successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message === 'jwt expired' ? 
        "Verification link has expired" : 
        "Failed to set password"
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




