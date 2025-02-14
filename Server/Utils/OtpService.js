const nodemailer = require('nodemailer');
require('dotenv').config();

const otpStore = new Map();

// HTML template for OTP email
const generateOTPTemplate = (otp) => `
<!DOCTYPE html>
<html>
<head>
    <title>OTP Verification</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #333333;">OTP Verification</h1>
        </div>
        <div style="margin-bottom: 20px; text-align: center;">
            <p style="font-size: 16px; color: #666666;">Your verification code is:</p>
            <h2 style="font-size: 32px; color: #4CAF50; letter-spacing: 5px; margin: 20px 0;">${otp}</h2>
            <p style="font-size: 14px; color: #999999;">This code will expire in 5 minutes</p>
        </div>
        <div style="text-align: center; font-size: 12px; color: #999999;">
            <p>If you didn't request this code, please ignore this email.</p>
        </div>
    </div>
</body>
</html>
`;

const sendOTP = async (email) => {
    const OTP = Math.floor(Math.random() * 9000) + 1000;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
        // Add DKIM configuration if you have it
        ...(process.env.DKIM_PRIVATE_KEY && {
            dkim: {
                domainName: process.env.DKIM_DOMAIN,
                keySelector: process.env.DKIM_SELECTOR,
                privateKey: process.env.DKIM_PRIVATE_KEY,
            }
        }),
        // Improve TLS security
        tls: {
            rejectUnauthorized: true,
            minVersion: "TLSv1.2"
        }
    });

    const mailOptions = {
        from: {
            name: 'OrgSync',
            address: process.env.EMAIL_USER
        },
        to: email,
        subject: 'OTP Verification for OrgSync',
        text: `Your OTP is: ${OTP}. It will expire in 5 minutes.`, // Plain text version
        html: generateOTPTemplate(OTP), // HTML version
        headers: {
            'List-Unsubscribe': `<mailto:${process.env.EMAIL_USER}?subject=unsubscribe>`,
            'Precedence': 'bulk',
            'X-Auto-Response-Suppress': 'OOF, AutoReply',
            'Organization': 'OrgSync'
        },
        // Add message priority
        priority: 'high',
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        otpStore.set(email, { 
            otp: OTP, 
            expires: Date.now() + 5 * 60 * 1000 
        });
        return OTP;
    } catch (error) {
        throw error;
    }
};

const verifyOTP = async (email, OTP) => {
    const otpDetails = otpStore.get(email);

    if (!otpDetails || otpDetails.expires < Date.now()) {
        otpStore.delete(email);
        return false;
    }

    if (otpDetails.otp === parseInt(OTP, 10)) {
        otpStore.delete(email);
        return true;
    }

    return false;
};

const sendLink = async ({ to, subject, html }) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
         
            tls: {
                rejectUnauthorized: true,
                minVersion: "TLSv1.2"
            }
        });

        const mailOptions = {
            from: {
                name: 'OrgSync',
                address: process.env.EMAIL_USER
            },
            to,
            subject,
            html,
            headers: {
                'List-Unsubscribe': `<mailto:${process.env.EMAIL_USER}?subject=unsubscribe>`,
                'Precedence': 'bulk',
                'X-Auto-Response-Suppress': 'OOF, AutoReply',
                'Organization': 'OrgSync'
            },
            priority: 'high',
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        return { success: true, message: 'Email sent successfully' };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, message: 'Failed to send email', error };
    }
};

module.exports = { sendOTP, verifyOTP, sendLink };