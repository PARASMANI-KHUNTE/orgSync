const Branch = require('../models/Branch')
const Organization = require('../models/Organization')
exports.addNewBranch = async (req, res) => {
    try {
        const { Name, Location } = req.body;
        
        // Input validation
        if (!Name || !Location) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: Name and Location"
            });
        }

        const userId = req.user?.payload?.userId;
        if (!userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: User ID missing"
            });
        }

        // Check for existing branch with same name
        const existingBranch = await Branch.findOne({ Name });
        if (existingBranch) {
            return res.status(400).json({
                success: false,
                message: "Branch with this name already exists"
            });
        }

        // Find organization
        const org = await Organization.findOne({ AdminId: userId });
        if (!org) {
            return res.status(400).json({
                success: false,
                message: "No organization found. Please create an organization first."
            });
        }

        // Create new branch
        const newBranch = new Branch({
            Name,
            Location,
            OrgId: org._id
        });

        await newBranch.save();
        
        return res.status(201).json({
            success: true,
            message: "Branch has been created successfully",
            data: newBranch
        });

    } catch (error) {
        console.error('Error in addNewBranch:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.updateBranch = async (req, res) => {
    try {
        const { branchId } = req.params;
        const { Name, Location } = req.body;
        const userId = req.user?.payload?.userId;

        // Validate user
        if (!userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: User ID missing"
            });
        }

        // Find organization
        const org = await Organization.findOne({ AdminId: userId });
        if (!org) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: Organization not found"
            });
        }

        // Find branch
        const branch = await Branch.findOne({ _id: branchId, OrgId: org._id });
        if (!branch) {
            return res.status(404).json({
                success: false,
                message: "Branch not found or unauthorized access"
            });
        }

        // Check if new name conflicts with existing branch
        if (Name && Name !== branch.Name) {
            const existingBranch = await Branch.findOne({ Name });
            if (existingBranch) {
                return res.status(400).json({
                    success: false,
                    message: "Branch with this name already exists"
                });
            }
        }

        // Update branch
        const updatedBranch = await Branch.findByIdAndUpdate(
            branchId,
            { 
                ...(Name && { Name }),
                ...(Location && { Location })
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Branch updated successfully",
            data: updatedBranch
        });

    } catch (error) {
        console.error('Error in updateBranch:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.deleteBranch = async (req, res) => {
    try {
        const { branchId } = req.params;
        const userId = req.user?.payload?.userId;

        // Validate user
        if (!userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: User ID missing"
            });
        }

        // Find organization
        const org = await Organization.findOne({ AdminId: userId });
        if (!org) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: Organization not found"
            });
        }

        // Find and delete branch
        const branch = await Branch.findOneAndDelete({ 
            _id: branchId, 
            OrgId: org._id 
        });

        if (!branch) {
            return res.status(404).json({
                success: false,
                message: "Branch not found or unauthorized access"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Branch deleted successfully"
        });

    } catch (error) {
        console.error('Error in deleteBranch:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};