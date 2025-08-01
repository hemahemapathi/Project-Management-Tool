import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const managerDomains = ['manager.com', 'admin.com'];

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const domain = email.split('@')[1];
    const isManagerDomain = managerDomains.includes(domain);
  
    if ((isManagerDomain && role !== 'manager') || (!isManagerDomain && role !== 'team_member')) {
      return res.status(400).json({ message: 'Email domain does not match the selected role' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword, // Fixed: was using undefined hashedPassword
      role,
      emailDomain: domain
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const registerManager = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Manager already exists with this email' });
    }

    const domain = email.split('@')[1];
    
    if (!managerDomains.includes(domain)) {
      return res.status(400).json({ message: 'Invalid email domain for manager registration' });
    }

    if (role !== 'manager') {
      return res.status(400).json({ message: 'Role must be manager for manager registration' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'manager',
      emailDomain: domain
    });

    await user.save();

    res.status(201).json({ message: 'Manager registered successfully' });
  } catch (error) {
    console.error('Manager Registration Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const registerTeamMember = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Team member already exists with this email' });
    }

    const domain = email.split('@')[1];
    
    if (managerDomains.includes(domain)) {
      return res.status(400).json({ message: 'Invalid email domain for team member registration' });
    }

    if (role !== 'team_member') {
      return res.status(400).json({ message: 'Role must be team_member for team member registration' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'team_member',
      emailDomain: domain
    });

    await user.save();

    res.status(201).json({ message: 'Team member registered successfully' });
  } catch (error) {
    console.error('Team Member Registration Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
        emailDomain: user.emailDomain
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
      if (err) {
        console.error('JWT Sign Error:', err);
        return res.status(500).json({ message: 'Error generating token' });
      }
      
      const userDetails = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailDomain: user.emailDomain,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
      
      res.json({ token, user: userDetails });
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const loginManager = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email, role: 'manager' });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
        emailDomain: user.emailDomain
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
      if (err) {
        console.error('JWT Sign Error:', err);
        return res.status(500).json({ message: 'Error generating token' });
      }
      
      const userDetails = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailDomain: user.emailDomain,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
      
      res.json({ token, user: userDetails });
    });
  } catch (error) {
    console.error('Manager Login Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const loginTeamMember = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email, role: 'team_member' });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
        emailDomain: user.emailDomain
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
      if (err) {
        console.error('JWT Sign Error:', err);
        return res.status(500).json({ message: 'Error generating token' });
      }
      
      const userDetails = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailDomain: user.emailDomain,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
      
      res.json({ token, user: userDetails });
    });
  } catch (error) {
    console.error('Team Member Login Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication failed' });
    }
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied. Only managers can view all users.' });
    }

    const users = await User.find().select('-password');

    res.json(users);
  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user.role === 'manager' || req.user.id === user.id) {
      user.name = name || user.name;
      user.email = email || user.email;
      user.updatedAt = Date.now();

      await user.save();

      res.json({ message: 'User profile updated successfully', user });
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied. Only managers can delete users.' });
    }

    const userToDelete = await User.findById(req.params.id);

    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
