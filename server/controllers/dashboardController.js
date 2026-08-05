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
    const successfulReturns = await Item.countDocuments({ status: 'returned' });
    
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

module.exports = { getAnalytics };
