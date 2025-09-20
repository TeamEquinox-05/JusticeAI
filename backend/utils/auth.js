const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const authConfig = require('../config/auth.json');

// Load users from config file
const loadUsers = () => {
  try {
    const usersPath = path.join(__dirname, '../config/users.json');
    const usersData = fs.readFileSync(usersPath, 'utf8');
    return JSON.parse(usersData);
  } catch (error) {
    console.error('Error loading users:', error);
    return { users: [] };
  }
};

// Save users to config file
const saveUsers = (usersData) => {
  try {
    const usersPath = path.join(__dirname, '../config/users.json');
    fs.writeFileSync(usersPath, JSON.stringify(usersData, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving users:', error);
    return false;
  }
};

// Generate JWT token
const generateToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    name: user.name
  };

  return jwt.sign(payload, authConfig.jwt.secret, {
    expiresIn: authConfig.jwt.expiresIn
  });
};

// Hash password
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(authConfig.bcrypt.saltRounds);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error('Error hashing password');
  }
};

// Compare password
const comparePassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error('Error comparing password');
  }
};

// Authenticate user
const authenticateUser = async (username, password) => {
  try {
    const usersData = loadUsers();
    const user = usersData.users.find(u => u.username === username);

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return { success: false, message: 'Invalid password' };
    }

    // Generate token
    const token = generateToken(user);

    return {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name
      }
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, message: 'Authentication failed' };
  }
};

// Get user by ID
const getUserById = (id) => {
  const usersData = loadUsers();
  const user = usersData.users.find(u => u.id === parseInt(id));
  
  if (user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  return null;
};

// Get user by username
const getUserByUsername = (username) => {
  const usersData = loadUsers();
  const user = usersData.users.find(u => u.username === username);
  
  if (user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  return null;
};

module.exports = {
  loadUsers,
  saveUsers,
  generateToken,
  hashPassword,
  comparePassword,
  authenticateUser,
  getUserById,
  getUserByUsername
};