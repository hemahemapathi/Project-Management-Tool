import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Report from '../models/Report.js';
import User from '../models/User.js';
import TaskUpdate from '../models/TaskUpdate.js';

export const createReport = async (req, res) => {
  try {
    const { projectId, type, data } = req.body;
    
    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (req.user.role !== 'manager' && req.user.role !== 'team_member') {
      return res.status(403).json({ message: "Only managers and team members can create reports" });
    }

    const newReport = new Report({
      project: projectId,
      type,
      data,
      generatedBy: req.user.id
    });
    const savedReport = await newReport.save();
    res.status(201).json(savedReport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const generateProjectProgressReport = async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'team_member') {
      return res.status(403).json({ message: "Only managers and team members can generate project progress reports" });
    }

    const { projectId } = req.params;
    const project = await Project.findById(projectId).populate('tasks');
    
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(task => task.status === 'Done').length;
    const progressPercentage = (completedTasks / totalTasks) * 100;

    const report = new Report({
      project: projectId,
      type: 'Progress',
      data: {
        projectName: project.name,
        totalTasks,
        completedTasks,
        progressPercentage
      },
      generatedBy: req.user.id
    });

    await report.save();

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error generating project progress report', error: error.message });
  }
};

export const generateTaskCompletionReport = async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'team_member') {
      return res.status(403).json({ message: "Access denied. Only managers and team members can generate task completion reports" });
    }

    const { projectId } = req.params;
    const tasks = await Task.find({ project: projectId }).populate('assignedTo');

    const completedTasks = tasks.filter(task => task.status === 'Done');
    const taskCompletionData = completedTasks.map(task => ({
      taskName: task.title,
      completedBy: task.assignedTo.name,
      completedDate: task.updatedAt
    }));

    const report = new Report({
      project: projectId,
      type: 'TaskCompletion',
      data: taskCompletionData,
      generatedBy: req.user.id
    });

    await report.save();

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error generating task completion report', error: error.message });
  }
};

export const generateTimelineReport = async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'team_member') {
      return res.status(403).json({ message: "Only managers and team members can generate timeline reports" });
    }

    const { projectId } = req.params;
    const project = await Project.findById(projectId).populate('tasks');

    const timelineData = project.tasks.map(task => ({
      taskName: task.title,
      startDate: task.createdAt,
      endDate: task.dueDate,
      status: task.status
    }));

    const report = new Report({
      project: projectId,
      type: 'Timeline',
      data: timelineData,
      generatedBy: req.user.id
    });

    await report.save();

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error generating timeline report', error: error.message });
  }
};

export const generateBudgetUtilizationReport = async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'team_member') {
      return res.status(403).json({ message: "Only managers and team members can generate budget utilization reports" });
    }

    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    const budgetUtilization = (project.expenses / project.budget) * 100;

    const report = new Report({
      project: projectId,
      type: 'BudgetUtilization',
      data: {
        projectName: project.name,
        totalBudget: project.budget,
        expensesToDate: project.expenses,
        utilizationPercentage: budgetUtilization
      },
      generatedBy: req.user.id
    });

    await report.save();

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error generating budget utilization report', error: error.message });
  }
};

export const generateTaskUpdateReport = async (req, res) => {
  try {
    if (req.user.role !== 'team_member') {
      return res.status(403).json({ message: "Only team members can generate task update reports" });
    }

    const { taskId } = req.params;
    const userId = req.user.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.assignedTo.toString() !== userId) {
      return res.status(403).json({ message: 'You are not assigned to this task' });
    }

    const updates = await TaskUpdate.find({
      task: taskId,
      date: { $lte: task.dueDate }
    }).sort({ date: 1 });

    const report = new Report({
      project: task.project,
      type: 'TaskUpdate',
      data: {
        taskName: task.title,
        assignedTo: req.user.name,
        status: task.status,
        dueDate: task.dueDate,
        updates: updates.map(update => ({
          date: update.date,
          content: update.content
        }))
      },
      generatedBy: req.user.id
    });

    await report.save();

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error generating task update report', error: error.message });
  }
};

export const createTaskUpdate = async (req, res) => {
  try {
    if (req.user.role !== 'team_member') {
      return res.status(403).json({ message: "Only team members can create task updates" });
    }

    const { taskId, content } = req.body;
    const userId = req.user.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.assignedTo.toString() !== userId) {
      return res.status(403).json({ message: 'You are not assigned to this task' });
    }

    const update = new TaskUpdate({
      task: taskId,
      user: userId,
      content
    });

    await update.save();

    res.status(201).json({ message: 'Task update submitted successfully', update });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteReport = async (req, res) => {
  const { reportId } = req.params;
  
  try {
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (req.user.role !== 'manager' && req.user.role !== 'team_member') {
      return res.status(403).json({ message: "Only managers and team members can delete reports" });
    }

    await Report.findByIdAndDelete(reportId);
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting report', error: error.message });
  }
};

export const updateReport = async (req, res) => {
  const { reportId } = req.params;
  const { data } = req.body;
  
  try {
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (req.user.role !== 'manager' && req.user.role !== 'team_member') {
      return res.status(403).json({ message: "Only managers and team members can update reports" });
    }

    const updatedReport = await Report.findByIdAndUpdate(
      reportId,
      { data },
      { new: true, runValidators: true }
    );
    res.json(updatedReport);
  } catch (error) {
    res.status(500).json({ message: 'Error updating report', error: error.message });
  }
};

export const getReport = async (req, res) => {
  const { reportId } = req.params;
  
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'team_member') {
      return res.status(403).json({ message: "Only managers and team members can get reports" });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error getting report', error: error.message });
  }
};

export const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('project', 'name')
      .populate('generatedBy', 'name');
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error getting all reports', error: error.message });
  }
};

