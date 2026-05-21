const express = require('express');
const { body, validationResult } = require('express-validator');
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

// @route   PATCH /api/users/profile
// @desc    Update current user's name and/or email
// @access  Private
router.patch(
  '/profile',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 50 }).withMessage('Name too long'),
    body('email').optional().isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { name, email } = req.body;
      const updates = {};
      if (name)  updates.name  = name;
      if (email) updates.email = email;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'Nothing to update.' });
      }

      // Check email uniqueness if changing email
      if (email && email !== req.user.email) {
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'That email is already in use.' });
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('name email role createdAt');

      res.json(user);
    } catch (err) {
      next(err);
    }
  }
);

// @route   PATCH /api/users/password
// @desc    Change current user's password (requires current password)
// @access  Private
router.patch(
  '/password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user._id).select('+password');
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect.' });
      }

      user.password = newPassword;
      await user.save();

      res.json({ message: 'Password updated successfully.' });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
