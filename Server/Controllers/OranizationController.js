const organization = require('../models/Organization')

exports.addOrganization = async(req,res)=>{
    try {
        const {Name , Location } = req.body;
        if(!Name || !Location ){
            return res.status(400).json({
                success : false,
                message : "missing data"
            })
        }
        const userId = req.user.payload?.userId;
        if (!userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: User ID missing"
            });
        }
        const checkIfAlreadyExist = await organization.findOne({Name});
        if(checkIfAlreadyExist){
            return res.status(400).json({
                success : false,
                message : "Organization with this name already exist."
            })
        }

        const newOrg = new organization({
            Name ,
            Location,
            AdminId : userId
        })

        await newOrg.save();
        return res.status(200).json({
            success : true,
            message : "Organization Has been created."
        })

    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Internal Server Error"
        })
    }
}

exports.getOrg = async (req, res) => {
    try {
        // Get userId from query params
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        // Find organization where AdminId matches userId
        const org = await organization.findOne({ AdminId: userId });

        if (!org) {
            return res.status(404).json({
                success: false,
                message: "No organization found for this user"
            });
        }

        return res.status(200).json({
            success: true,
            organization: org
        });

    } catch (error) {
        console.error("Error in getOrg:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

exports.updateOrganization = async (req, res) => {
    try {
        const { orgId, Name, Location } = req.body;
        const userId = req.user.payload?.userId;

        if (!orgId || !Name || !Location) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        // Check if user is admin of this organization
        const org = await organization.findOne({ _id: orgId, AdminId: userId });
        if (!org) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: You can't edit this organization"
            });
        }

        // Check if new name conflicts with existing org (excluding current org)
        const nameExists = await organization.findOne({ 
            Name, 
            _id: { $ne: orgId } 
        });
        if (nameExists) {
            return res.status(400).json({
                success: false,
                message: "Organization with this name already exists"
            });
        }

        // Update the organization
        const updatedOrg = await organization.findByIdAndUpdate(
            orgId,
            { Name, Location },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Organization updated successfully",
            organization: updatedOrg
        });

    } catch (error) {
        console.error("Error in updateOrganization:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};