import express from 'express';
import { 
  createProject, 
  updateProject, 
  deleteProject, 
  getProject, 
  getProjects,
  getProjectsByManager,
  getProjectsByTeamMember
} from '../controllers/project.js';
import { authenticateUser, authenticateManager, authenticateManagerOrTeamMember } from '../middleware/auth.js';

const router = express.Router();

// Create a new project (only managers can create projects)
router.post('/', authenticateManager, createProject);

// Update a project (only the manager who created it can update)
router.put('/:id', authenticateManager, updateProject);

// Delete a project (only the manager who created it can delete)
router.delete('/:id', authenticateManager, deleteProject);

// Get a single project (managers and team members can view)
router.get('/:id', authenticateManagerOrTeamMember, getProject);

// Get all projects (managers and team members can view)
router.get('/', authenticateManagerOrTeamMember, getProjects);

// Get projects by manager (only for the authenticated manager)
router.get('/manager/my-projects', authenticateManager, getProjectsByManager);

// Get projects where user is a team member
router.get('/member/my-projects', authenticateUser, getProjectsByTeamMember);

export default router;
