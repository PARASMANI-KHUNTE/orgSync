const { sendOTP, verifyOTP } = require('../Utils/OtpService')

exports.OtpSend = async (req,res)=>{
    try {
        const {email } = req.body;
        if(!email){
            return res.status(400).json({
                success : true,
                status : false,
                message : "Please provide Email"
            })
        }
        await sendOTP(email)
        return res.status(200).json({
            success : true,
            status : true,
            message : `Otp has been send to ${email}`
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message, // Return error details
        });
    }
}

exports.OtpVerify =  async (req,res)=>{
    try {
        const {email , otp } = req.body;
        if(!email || !otp){
            return res.status(400).json({
                success: false,
                message: "No Otp Found",
            });
        }
        await verifyOTP(email , otp)
        return res.status(200).json({
            success: true,
            message: "Successfully Verified",
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message, // Return error details
        });
    }
}


