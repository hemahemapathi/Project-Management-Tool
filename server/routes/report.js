
import express from 'express';
import { authenticateManagerOrTeamMember } from '../middleware/auth.js';
import {
  createReport,
  generateProjectProgressReport,
  generateTaskCompletionReport,
  generateTimelineReport,
  generateBudgetUtilizationReport,
  deleteReport,
  updateReport,
  getReport,
  getReports,
  createTaskUpdate,
  generateTaskUpdateReport
} from '../controllers/report.js';

const router = express.Router();

router.post('/', authenticateManagerOrTeamMember, createReport);
router.get('/project-progress/:projectId', authenticateManagerOrTeamMember, generateProjectProgressReport);
router.get('/task-completion/:projectId', authenticateManagerOrTeamMember, generateTaskCompletionReport);
router.get('/timeline/:projectId', authenticateManagerOrTeamMember, generateTimelineReport);
router.get('/budget-utilization/:projectId', authenticateManagerOrTeamMember, generateBudgetUtilizationReport);
router.post('/task-update', authenticateManagerOrTeamMember, createTaskUpdate);
router.get('/task-update/:taskId', authenticateManagerOrTeamMember, generateTaskUpdateReport);
router.delete('/:reportId', authenticateManagerOrTeamMember, deleteReport);
router.put('/:reportId', authenticateManagerOrTeamMember, updateReport);
router.get('/:reportId', authenticateManagerOrTeamMember, getReport);
router.get('/', authenticateManagerOrTeamMember, getReports);

export default router;
