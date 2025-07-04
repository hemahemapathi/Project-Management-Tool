import express from 'express';
import { createTeam, getTeams, getTeamById, updateTeam, deleteTeam, addTeamMember } from '../controllers/team.js';
import { authenticateToken, authenticateManager } from '../middleware/auth.js';

const router = express.Router();

// Create team (only managers)
router.post('/', authenticateManager, createTeam);

// Get all teams (authenticated users)
router.get('/', authenticateToken, getTeams);

// Get team by ID (authenticated users)
router.get('/:id', authenticateToken, getTeamById);

// Update team (only managers)
router.put('/:id', authenticateManager, updateTeam);

// Delete team (only managers)
router.delete('/:id', authenticateManager, deleteTeam);

// Add team member (only managers)
router.post('/:id/members', authenticateManager, addTeamMember);

export default router;
