import User from '../models/User.js';
import passport from '../config/passport.js';

// Register a new user
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.email === email 
          ? 'User already exists with this email' 
          : 'Username is already taken'
      });
    }

    // Create new user
    const newUser = new User({ username, email, password });
    await newUser.save();
    
    // Log in the user automatically after registration
    req.login(newUser, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to log in after registration' });
      }
      res.status(201).json({ 
        message: 'User registered successfully',
        user: { 
          id: newUser._id, 
          username: newUser.username, 
          email: newUser.email 
        }
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    
    res.status(500).json({ error: 'Failed to register user' });
  }
};

// Login user
export const login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Authentication error' });
    }
    if (!user) {
      return res.status(401).json({ error: info.message || 'Invalid credentials' });
    }
    
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to log in' });
      }
      res.json({ 
        message: 'Logged in successfully',
        user: { 
          id: user._id, 
          username: user.username, 
          email: user.email 
        }
      });
    });
  })(req, res, next);
};

// Logout user
export const logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to log out' });
    }
    res.json({ message: 'Logged out successfully' });
  });
};

// Get current user
export const getCurrentUser = (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ 
      user: { 
        id: req.user._id, 
        username: req.user.username, 
        email: req.user.email 
      } 
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
};