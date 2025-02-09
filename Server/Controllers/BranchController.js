const Branch = require("../models/Branch");
const Organization = require("../models/Organization");
exports.addNewBranch = async (req, res) => {
  try {
    const { Name, Location } = req.body;

    // Input validation
    if (!Name || !Location) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: Name and Location",
      });
    }

    const userId = req.user?.payload?.userId;
    if (!userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: User ID missing",
      });
    }

    // Check for existing branch with same name
    const existingBranch = await Branch.findOne({ Name });
    if (existingBranch) {
      return res.status(400).json({
        success: false,
        message: "Branch with this name already exists",
      });
    }

    // Find organization
    const org = await Organization.findOne({ AdminId: userId });
    if (!org) {
      return res.status(400).json({
        success: false,
        message: "No organization found. Please create an organization first.",
      });
    }

    // Create new branch
    const newBranch = new Branch({
      Name,
      Location,
      OrgId: org._id,
    });

    await newBranch.save();

    return res.status(201).json({
      success: true,
      message: "Branch has been created successfully",
      data: newBranch,
    });
  } catch (error) {
    console.error("Error in addNewBranch:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getBranches = async (req, res) => {
  try {
    const userId = req.user?.payload?.userId;

    if (!userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: User ID missing",
      });
    }

    const org = await Organization.findOne({ AdminId: userId });
    if (!org) {
      return res.status(404).json({
        success: false,
        message: "No organization found for this user",
      });
    }

    const branches = await Branch.find({ OrgId: org._id })
      .select("Name Location createdAt updatedAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Branches fetched successfully",
      data: branches,
    });
  } catch (error) {
    console.error("Error in getBranches:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.updateBranch = async (req, res) => {
  try {
    const { Name, Location, branchId} = req.body;

    if (!Name || !Location || !branchId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: Name, Location, or branchId",
      });
    }

   
    // Update the branch
    const updatedBranch = await Branch.findByIdAndUpdate(
      branchId,
      { Name, Location },
      { new: true, runValidators: true }
    );

    if (!updatedBranch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found or update failed",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Branch updated successfully",
      data: updatedBranch,
    });
  } catch (error) {
    console.error("Error updating branch:", );
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


exports.deleteBranch = async (req, res) => {
  try {
    const { id } = req.body;

    const branch = await Branch.findOneAndDelete(id);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Branch deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


exports.getBranchById = async (req, res) => {
  try {
    const userId = req.user?.payload?.userId;
    const branchId = req.params.branchId; // Get branch ID from request parameters

    if (!userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: User ID missing",
      });
    }

    // First check if user belongs to organization
    const org = await Organization.findOne({ AdminId: userId });
    if (!org) {
      return res.status(404).json({
        success: false,
        message: "No organization found for this user",
      });
    }

    // Find specific branch by ID and ensure it belongs to user's organization
    const branch = await Branch.findOne({ 
      _id: branchId,
      OrgId: org._id 
    }).select("Name Location createdAt updatedAt");

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Branch fetched successfully",
      data: branch,
    });
  } catch (error) {
    console.error("Error in getBranchById:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};