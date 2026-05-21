const express  = require('express');
const crypto   = require('crypto');
const { body, validationResult } = require('express-validator');
const User      = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const router = express.Router();

// @route   POST /api/auth/forgot-password
// @desc    Send password-reset email
// @access  Public
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Please enter a valid email')],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const user = await User.findOne({ email: req.body.email })
        .select('+resetPasswordToken +resetPasswordExpire');

      // Always respond with 200 to prevent email enumeration
      if (!user) {
        return res.json({
          message: 'If that email is registered you will receive a reset link shortly.',
        });
      }

      const rawToken = user.generatePasswordResetToken();
      await user.save({ validateBeforeSave: false });

      // Build reset URL — use CLIENT_URL env var or fall back
      const clientUrl =
        process.env.CLIENT_URL ||
        (process.env.NODE_ENV === 'production'
          ? 'https://team-task-manager-three-eta.vercel.app'
          : 'http://localhost:5000');

      const resetUrl = `${clientUrl}/reset-password/${rawToken}`;

      const html = `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"></head>
          <body style="font-family:Inter,sans-serif;background:#0F172B;margin:0;padding:40px 0;">
            <div style="max-width:520px;margin:0 auto;background:#1E293B;border-radius:16px;overflow:hidden;border:1px solid #334155;">
              <div style="background:linear-gradient(135deg,#064e3b,#0f766e);padding:32px 40px;">
                <div style="display:flex;align-items:center;gap:10px;">
                  <div style="width:36px;height:36px;background:linear-gradient(135deg,#34d399,#0d9488);border-radius:10px;display:flex;align-items:center;justify-content:center;">
                    <span style="font-size:18px;">⚡</span>
                  </div>
                  <span style="color:#fff;font-size:20px;font-weight:900;letter-spacing:-0.5px;">TaskFlow.</span>
                </div>
              </div>
              <div style="padding:40px;">
                <h2 style="color:#f1f5f9;font-size:22px;font-weight:800;margin:0 0 8px;">Reset your password</h2>
                <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 28px;">
                  We received a request to reset the password for your TaskFlow account.
                  Click the button below — this link expires in <strong style="color:#34d399;">1 hour</strong>.
                </p>
                <a href="${resetUrl}"
                   style="display:inline-block;background:linear-gradient(135deg,#10b981,#0d9488);color:#fff;text-decoration:none;
                          font-weight:800;font-size:13px;padding:14px 32px;border-radius:12px;letter-spacing:0.3px;">
                  Reset Password
                </a>
                <p style="color:#475569;font-size:12px;margin:28px 0 0;line-height:1.6;">
                  If you didn't request this, you can safely ignore this email — your password won't change.<br><br>
                  Or copy this link: <span style="color:#34d399;word-break:break-all;">${resetUrl}</span>
                </p>
              </div>
              <div style="padding:20px 40px;border-top:1px solid #1e293b;">
                <p style="color:#334155;font-size:11px;margin:0;">&copy; ${new Date().getFullYear()} TaskFlow Inc. — Sent to ${user.email}</p>
              </div>
            </div>
          </body>
        </html>
      `;

      try {
        await sendEmail({ to: user.email, subject: 'TaskFlow — Reset your password', html });
      } catch (emailErr) {
        // Roll back token if email fails so the user can retry
        user.resetPasswordToken  = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        console.error('Email send error:', emailErr.message);
        return res.status(500).json({ message: 'Could not send reset email. Please check your email configuration.' });
      }

      res.json({ message: 'If that email is registered you will receive a reset link shortly.' });
    } catch (err) {
      next(err);
    }
  }
);

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password using token
// @access  Public
router.post(
  '/reset-password/:token',
  [
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      // Hash the raw URL token to compare against DB
      const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

      const user = await User.findOne({
        resetPasswordToken:  hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
      }).select('+resetPasswordToken +resetPasswordExpire +password');

      if (!user) {
        return res.status(400).json({ message: 'Reset link is invalid or has expired.' });
      }

      user.password            = req.body.password;
      user.resetPasswordToken  = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      res.json({ message: 'Password reset successfully. You can now sign in.' });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
