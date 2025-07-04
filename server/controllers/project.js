import Project from '../models/Project.js';
import User from '../models/User.js';
import { sendProjectCreatedEmail } from '../service/email.js';

export const createProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate, status, priority, team_members } = req.body;
    const { id: managerId } = req.user;

    // Validate required fields
    if (!name || !description || !startDate || !endDate) {
      return res.status(400).json({ 
        message: 'Name, description, start date, and end date are required' 
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) {
      return res.status(400).json({ 
        message: 'End date must be after start date' 
      });
    }

    // Validate team members if provided
    let validatedTeamMembers = [];
    if (team_members && team_members.length > 0) {
      const users = await User.find({ _id: { $in: team_members } });
      if (users.length !== team_members.length) {
        return res.status(400).json({ 
          message: 'One or more team members not found' 
        });
      }
      validatedTeamMembers = team_members;
    }

    const newProject = new Project({
      name: name.trim(),
      description: description.trim(),
      startDate: start,
      endDate: end,
      status: status || 'Not Started',
      priority: priority || 'Medium',
      manager: managerId,
      team_members: validatedTeamMembers
    });

    const savedProject = await newProject.save();
    
    // Populate the saved project with team member details
    const populatedProject = await Project.findById(savedProject._id)
      .populate('manager', 'name email')
      .populate('team_members', 'name email');

    res.status(201).json({
      message: 'Project created successfully',
      project: populatedProject
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ 
      message: 'Error creating project',
      error: error.message 
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, startDate, endDate, status, priority, team_members } = req.body;
    const { id: userId, role } = req.user;

    // Find the existing project
    const existingProject = await Project.findById(id);
    if (!existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check permissions - only manager who created the project can update it
    if (role !== 'manager' || existingProject.manager.toString() !== userId) {
      return res.status(403).json({ 
        message: 'You do not have permission to update this project' 
      });
    }

    // Validate required fields
    if (!name || !description || !startDate || !endDate) {
      return res.status(400).json({ 
        message: 'Name, description, start date, and end date are required' 
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) {
      return res.status(400).json({ 
        message: 'End date must be after start date' 
      });
    }

    // Validate team members if provided
    let validatedTeamMembers = [];
    if (team_members && team_members.length > 0) {
      const users = await User.find({ _id: { $in: team_members } });
      if (users.length !== team_members.length) {
        return res.status(400).json({ 
          message: 'One or more team members not found' 
        });
      }
      validatedTeamMembers = team_members;
    }

    // Update the project
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        description: description.trim(),
        startDate: start,
        endDate: end,
        status: status || existingProject.status,
        priority: priority || existingProject.priority,
        team_members: validatedTeamMembers,
        updatedAt: new Date()
      },
      { 
        new: true, 
        runValidators: true 
      }
    ).populate('manager', 'name email')
     .populate('team_members', 'name email');

    res.json({
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error('Error updating project:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid project ID format' });
    }
    
    res.status(500).json({ 
      message: 'Error updating project',
      error: error.message 
    });
  }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('manager', 'name email')
      .populate('team_members', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ 
      message: 'Error fetching projects',
      error: error.message 
    });
  }
};

export const getProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await Project.findById(id)
      .populate('manager', 'name email')
      .populate('team_members', 'name email');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);

        if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid project ID format' });
    }
    
    res.status(500).json({ 
      message: 'Error fetching project',
      error: error.message 
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

    // Find the project first
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check permissions - only manager who created the project can delete it
    if (role !== 'manager' || project.manager.toString() !== userId) {
      return res.status(403).json({ 
        message: 'You do not have permission to delete this project' 
      });
    }

    await Project.findByIdAndDelete(id);
    
    res.json({ 
      message: 'Project deleted successfully',
      deletedProject: { id, name: project.name }
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid project ID format' });
    }
    
    res.status(500).json({ 
      message: 'Error deleting project',
      error: error.message 
    });
  }
};

export const getProjectsByManager = async (req, res) => {
  try {
    const { id: managerId } = req.user;
    
    const projects = await Project.find({ manager: managerId })
      .populate('manager', 'name email')
      .populate('team_members', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(projects);
  } catch (error) {
    console.error('Error fetching manager projects:', error);
    res.status(500).json({ 
      message: 'Error fetching projects',
      error: error.message 
    });
  }
};

export const getProjectsByTeamMember = async (req, res) => {
  try {
    const { id: userId } = req.user;
    
    const projects = await Project.find({ team_members: userId })
      .populate('manager', 'name email')
      .populate('team_members', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(projects);
  } catch (error) {
    console.error('Error fetching team member projects:', error);
    res.status(500).json({ 
      message: 'Error fetching projects',
      error: error.message 
    });
  }
};

