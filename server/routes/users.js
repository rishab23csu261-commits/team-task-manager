const express = require('express');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const User = require('../models/User');

const router = express.Router();

router.use(protect);

// @route   GET /api/users
// @desc    Get all users (for assigning tasks/members)
// @access  Admin only
router.get('/', authorize('admin'), async (req, res, next) => {
  try {
    const users = await User.find().select('name email role').sort('name');
    res.json(users);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
