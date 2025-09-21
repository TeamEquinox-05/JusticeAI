const express = require('express');
const router = express.Router();
const { authenticateUser, getUserById } = require('../utils/auth');
const { verifyToken } = require('../middleware/auth');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Authenticate user
    const result = await authenticateUser(username, password);

    if (!result.success) {
      return res.status(401).json({
        success: false,
        message: result.message
      });
    }

    // Return success response with token
    res.json({
      success: true,
      message: 'Login successful',
      token: result.token,
      user: result.user
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify token endpoint
router.get('/verify', verifyToken, async (req, res) => {
  try {
    // If middleware passes, token is valid
    return res.json({
      success: true,
      message: 'Token is valid',
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        name: req.user.name
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Get current user info (protected route)
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: user
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Logout route (client-side token removal)
router.post('/logout', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// Verify token route
router.get('/verify', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    user: req.user
  });
});

module.exports = router;