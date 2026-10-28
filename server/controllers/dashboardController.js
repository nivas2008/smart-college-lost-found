const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');

// @desc    Get analytics for dashboard
// @route   GET /api/dashboard/analytics
// @access  Private
const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const lostItems = await Item.countDocuments({ type: 'lost' });
    const foundItems = await Item.countDocuments({ type: 'found' });
    const activeClaims = await Claim.countDocuments({ status: 'pending' });
    const successfulReturns = await Item.countDocuments({ status: { $in: ['returned', 'resolved'] } });
    
    // Monthly reports data for charts
    const monthlyData = await Item.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            type: "$type"
          },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalUsers,
      lostItems,
      foundItems,
      activeClaims,
      successfulReturns,
      monthlyData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get public real-time stats for landing page
// @route   GET /api/dashboard/public-stats
// @access  Public
const getPublicStats = async (req, res) => {
  try {
    const registeredStudents = await User.countDocuments();
    const itemsReturned = await Item.countDocuments({ status: { $in: ['returned', 'resolved'] } });
    const activeReports = await Item.countDocuments({ status: 'active' });
    const totalFound = await Item.countDocuments({ type: 'found' });
    const benchmarkBase = totalFound > 0 ? totalFound : 32;
    
    // Recovery Success Rate: Percentage of logged items successfully returned to verified owners
    const successRate = benchmarkBase > 0 
      ? `${Math.min(100, Math.round((itemsReturned / benchmarkBase) * 100))}%` 
      : '100%';

    res.json({
      itemsReturned,
      activeReports,
      registeredStudents,
      successRate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAnalytics, getPublicStats };
