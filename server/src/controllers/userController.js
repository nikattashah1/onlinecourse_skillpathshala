const User = require('../models/User');

exports.getProfile = async (req, res) => {
  res.json(req.user);
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;
    req.user.name = name || req.user.name;
    req.user.bio = bio || req.user.bio;
    await req.user.save();
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

// public instructor profile
exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name bio role');
    if (!user || user.role !== 'instructor') {
      return res.status(404).json({ message: 'Instructor not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch instructor', error: error.message });
  }
};

