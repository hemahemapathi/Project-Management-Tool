import express from 'express';
import { createTask, updateTask, deleteTask, getTask, getTasks, assignTask } from '../controllers/task.js';
import { authenticateManager, authenticateManagerOrTeamMember } from '../middleware/auth.js';

const router = express.Router();

// Create a new task (only managers can create tasks)
router.post('/', authenticateManager, createTask);

// Update a task (only managers can update tasks)
router.put('/:id', authenticateManager, updateTask);

// Delete a task (only managers can delete tasks)
router.delete('/:id', authenticateManager, deleteTask);

// Get a single task
router.get('/:id',authenticateManagerOrTeamMember, getTask);

// Get all tasks
router.get('/', authenticateManagerOrTeamMember,getTasks);

// Assign task to team members by manager
router.post('/assign', authenticateManager, assignTask);

export default router;
