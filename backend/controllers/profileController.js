const { User } = require('../auth/models');

// GET /api/profile
// Returns the authenticated user's profile without sensitive fields.
async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.userId).select('-password -otp');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile,
};

