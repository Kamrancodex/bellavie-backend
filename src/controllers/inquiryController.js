const Inquiry = require("../models/Inquiry");
const { validationResult } = require("express-validator");

// @desc    Get all inquiries
// @route   GET /api/v1/inquiries
// @access  Private
const getInquiries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.eventType) {
      filter.eventType = req.query.eventType;
    }

    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Get inquiries with pagination
    const inquiries = await Inquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("assignedTo", "username")
      .populate("convertedToClient", "firstName lastName")
      .populate("convertedToEvent", "title");

    // Get total count for pagination
    const total = await Inquiry.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: inquiries,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    });
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get single inquiry
// @route   GET /api/v1/inquiries/:id
// @access  Private
const getInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate("assignedTo", "username")
      .populate("convertedToClient", "firstName lastName email")
      .populate("convertedToEvent", "title eventDate")
      .populate("communications.createdBy", "username");

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    res.status(200).json({
      success: true,
      data: inquiry,
    });
  } catch (error) {
    console.error("Error fetching inquiry:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Create new inquiry
// @route   POST /api/v1/inquiries
// @access  Public (from website contact form)
const createInquiry = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: errors.array(),
      });
    }

    // Extract client IP and user agent for tracking
    const clientIP =
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      "unknown";
    const userAgent = req.get("User-Agent") || "unknown";

    const inquiryData = {
      ...req.body,
      ipAddress: clientIP,
      userAgent: userAgent,
      leadSource: "website",
    };

    // If user is authenticated, set createdBy (only for database users, not environment admin)
    if (req.user && req.user.id !== "admin_user") {
      inquiryData.createdBy = req.user.id;
      console.log("Setting createdBy to:", req.user.id);
    } else {
      console.log(
        "Skipping createdBy field - user:",
        req.user ? req.user.id : "not authenticated"
      );
    }
    // For environment-based admin or unauthenticated users, leave createdBy empty

    console.log("Creating inquiry with data:", {
      ...inquiryData,
      message: inquiryData.message ? "[REDACTED]" : "none",
    });
    const inquiry = await Inquiry.create(inquiryData);

    res.status(201).json({
      success: true,
      data: inquiry,
      message: "Inquiry submitted successfully",
    });
  } catch (error) {
    console.error("Error creating inquiry:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update inquiry
// @route   PUT /api/v1/inquiries/:id
// @access  Private
const updateInquiry = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: errors.array(),
      });
    }

    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    // Update fields
    const updateData = { ...req.body };
    updateData.updatedBy = req.user.id;

    const updatedInquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("assignedTo", "username");

    res.status(200).json({
      success: true,
      data: updatedInquiry,
      message: "Inquiry updated successfully",
    });
  } catch (error) {
    console.error("Error updating inquiry:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Delete inquiry
// @route   DELETE /api/v1/inquiries/:id
// @access  Private
const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    await Inquiry.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Inquiry deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting inquiry:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get inquiry statistics
// @route   GET /api/v1/inquiries/stats
// @access  Private
const getInquiryStats = async (req, res) => {
  try {
    const total = await Inquiry.countDocuments();
    const newCount = await Inquiry.countDocuments({ status: "new" });
    const contacted = await Inquiry.countDocuments({ status: "contacted" });
    const qualified = await Inquiry.countDocuments({ status: "qualified" });
    const converted = await Inquiry.countDocuments({ status: "converted" });

    const conversionRate = total > 0 ? (converted / total) * 100 : 0;

    // Calculate average response time (mock calculation)
    const avgResponseTime = 2.5; // hours

    res.status(200).json({
      success: true,
      data: {
        total,
        new: newCount,
        contacted,
        qualified,
        converted,
        conversionRate,
        avgResponseTime,
      },
    });
  } catch (error) {
    console.error("Error fetching inquiry stats:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Convert inquiry to client
// @route   POST /api/v1/inquiries/:id/convert
// @access  Private
const convertInquiry = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: errors.array(),
      });
    }

    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    if (inquiry.status === "converted") {
      return res.status(400).json({
        success: false,
        message: "Inquiry is already converted",
      });
    }

    const { createClient = true, createEvent = false } = req.body;
    let clientId = null;
    let eventId = null;

    // Create client if requested
    if (createClient) {
      const Client = require("../models/Client");
      const [firstName, ...lastNameParts] = inquiry.fullName.split(" ");
      const lastName = lastNameParts.join(" ") || "";

      const clientData = {
        firstName,
        lastName,
        email: inquiry.email,
        phone: inquiry.phone,
        status: "prospect",
        leadSource: inquiry.leadSource,
        createdBy: req.user.id,
      };

      const client = await Client.create(clientData);
      clientId = client._id;
    }

    // Create event if requested
    if (createEvent && clientId) {
      const Event = require("../models/Event");

      const eventData = {
        title: `${inquiry.fullName} - ${inquiry.eventType}`,
        eventType: inquiry.eventType,
        eventDate: inquiry.eventDate,
        guestCount: inquiry.guestCount,
        client: clientId,
        status: "planning",
        description: inquiry.message,
        createdBy: req.user.id,
      };

      const event = await Event.create(eventData);
      eventId = event._id;
    }

    // Update inquiry
    const updateData = {
      status: "converted",
      convertedToClient: clientId,
      convertedToEvent: eventId,
      conversionDate: new Date(),
      updatedBy: req.user.id,
    };

    const updatedInquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
      .populate("convertedToClient", "firstName lastName")
      .populate("convertedToEvent", "title");

    res.status(200).json({
      success: true,
      data: updatedInquiry,
      message: "Inquiry converted successfully",
    });
  } catch (error) {
    console.error("Error converting inquiry:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Add communication to inquiry
// @route   POST /api/v1/inquiries/:id/communications
// @access  Private
const addInquiryCommunication = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: errors.array(),
      });
    }

    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    const communicationData = {
      ...req.body,
      createdBy: req.user.id,
      createdAt: new Date(),
    };

    inquiry.communications.push(communicationData);
    inquiry.lastContactDate = new Date();
    inquiry.followUpCount += 1;
    inquiry.updatedBy = req.user.id;

    await inquiry.save();

    res.status(201).json({
      success: true,
      data: inquiry,
      message: "Communication added successfully",
    });
  } catch (error) {
    console.error("Error adding communication:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  getInquiries,
  getInquiry,
  createInquiry,
  updateInquiry,
  deleteInquiry,
  getInquiryStats,
  convertInquiry,
  addInquiryCommunication,
};
