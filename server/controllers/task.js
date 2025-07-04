import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { sendTaskCreatedEmail } from '../service/email.js';

// Create a new task (only managers can create tasks)
export const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, project, assignedTo } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (!project) {
      return res.status(400).json({ message: 'Project is required' });
    }

    // Verify project exists
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Create task data
    const taskData = {
      title,
      description: description || '',
      status: status || 'To Do',
      priority: priority || 'Medium',
      project,
      createdBy: req.user.id
    };

    // Add optional fields
    if (dueDate) {
      taskData.dueDate = new Date(dueDate);
    }

    if (assignedTo) {
      // Verify assigned user exists
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser) {
        return res.status(404).json({ message: 'Assigned user not found' });
      }
      taskData.assignedTo = assignedTo;
    }

    const task = new Task(taskData);
    await task.save();

    // Populate the task with project and user details
    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    // Send email notification if task is assigned
    if (assignedTo) {
      try {
        await sendTaskCreatedEmail(populatedTask);
      } catch (emailError) {
        console.error('Error sending task creation email:', emailError);
        // Don't fail the task creation if email fails
      }
    }

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
};

// Update a task (only managers can update tasks)
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate, project, assignedTo } = req.body;

    // Find the task
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify project exists if being updated
    if (project && project !== task.project.toString()) {
      const projectExists = await Project.findById(project);
      if (!projectExists) {
        return res.status(404).json({ message: 'Project not found' });
      }
    }

    // Verify assigned user exists if being updated
    if (assignedTo && assignedTo !== task.assignedTo?.toString()) {
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser) {
        return res.status(404).json({ message: 'Assigned user not found' });
      }
    }

    // Update task fields
    const updateData = {
      title: title || task.title,
      description: description !== undefined ? description : task.description,
      status: status || task.status,
      priority: priority || task.priority,
      project: project || task.project,
      updatedAt: new Date()
    };

    if (dueDate !== undefined) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    }

    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo || null;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};

// Delete a task (only managers can delete tasks)
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.findByIdAndDelete(id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
};

// Get a single task
export const getTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    const task = await Task.findById(id)
      .populate('project', 'name description')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Error fetching task', error: error.message });
  }
};

// Get all tasks
export const getTasks = async (req, res) => {
  try {
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    const tasks = await Task.find()
      .populate('project', 'name description')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
};

// Assign task to team members by manager
export const assignTask = async (req, res) => {
  try {
    const { taskId, assignedTo } = req.body;

    if (!taskId || !assignedTo) {
      return res.status(400).json({ message: 'Task ID and assigned user are required' });
    }

    // Find the task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify assigned user exists
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return res.status(404).json({ message: 'Assigned user not found' });
    }

    // Update task with assigned user
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { 
        assignedTo,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    )
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    // Send email notification
    try {
      await sendTaskCreatedEmail(updatedTask);
    } catch (emailError) {
      console.error('Error sending task assignment email:', emailError);
      // Don't fail the assignment if email fails
    }

    res.json(updatedTask);
  } catch (error) {
    console.error('Error assigning task:', error);
    res.status(500).json({ message: 'Error assigning task', error: error.message });
  }
};
