import express from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile, deleteUser, loginManager, loginTeamMember, registerManager, registerTeamMember, getUsers } from '../controllers/user.js';
import { authenticateManager, authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Register a new user
router.post('/register', registerUser);

//Register a new manager
router.post('/register/manager', registerManager);

//Register a new team member
router.post('/register/team-member', registerTeamMember);

// Login user
router.post('/login', loginUser);

//Allow user to login the existing manager
router.post('/login/manager', loginManager);

//Allow user to login the existing team member
router.post('/login/team-member', loginTeamMember);

// Get user profile (protected route)
router.get('/profile', authenticateUser, getUserProfile);

// Update user profile (protected route, manager only)
router.put('/profile', authenticateManager, updateUserProfile);

// Delete user (protected route, manager only)
router.delete('/', authenticateManager, deleteUser);

// Get all users (protected route, manager only)
router.get('/', authenticateManager, getUsers);

export default router;
