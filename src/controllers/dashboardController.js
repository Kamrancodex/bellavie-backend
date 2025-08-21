const Inquiry = require("../models/Inquiry");
const User = require("../models/User");

// @desc    Get dashboard statistics
// @route   GET /api/v1/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    // Inquiry statistics only (since we removed clients and events)
    const totalInquiries = await Inquiry.countDocuments();
    const newInquiries = await Inquiry.countDocuments({ status: "new" });
    const inquiriesThisMonth = await Inquiry.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    });

    const stats = {
      inquiries: {
        total: totalInquiries,
        new: newInquiries,
        thisMonth: inquiriesThisMonth,
      },
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get recent activity
// @route   GET /api/v1/dashboard/recent-activity
// @access  Private
const getRecentActivity = async (req, res) => {
  try {
    // Recent inquiries only (since we removed events and clients)
    const recentInquiries = await Inquiry.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("fullName email eventType eventDate guestCount status createdAt");

    res.status(200).json({
      success: true,
      data: {
        recentInquiries,
      },
    });
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get analytics data
// @route   GET /api/v1/dashboard/analytics
// @access  Private
const getAnalytics = async (req, res) => {
  try {
    const { period = "30" } = req.query;
    const days = parseInt(period);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Inquiries over time
    const inquiriesOverTime = await Inquiry.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
    ]);

    // Inquiries by event type
    const inquiriesByType = await Inquiry.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$eventType",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Conversion funnel
    const conversionFunnel = await Inquiry.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        inquiriesOverTime,
        inquiriesByType,
        conversionFunnel,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get performance metrics
// @route   GET /api/v1/dashboard/performance
// @access  Private
const getPerformanceMetrics = async (req, res) => {
  try {
    // Inquiry conversion rate
    const totalInquiries = await Inquiry.countDocuments();
    const convertedInquiries = await Inquiry.countDocuments({
      status: "converted",
    });
    const conversionRate =
      totalInquiries > 0 ? (convertedInquiries / totalInquiries) * 100 : 0;

    // Average response time (mock calculation - would need communication tracking)
    const avgResponseTime = 2.5; // hours

    const metrics = {
      conversionRate: conversionRate,
      avgResponseTime: avgResponseTime,
    };

    res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error("Error fetching performance metrics:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getRecentActivity,
  getAnalytics,
  getPerformanceMetrics,
};
