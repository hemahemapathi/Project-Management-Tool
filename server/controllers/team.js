import Team from '../models/Team.js';
import User from '../models/User.js';

export const createTeam = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'manager') {
      return res.status(403).json({ message: 'Only managers can create teams' });
    }

    const newTeam = new Team({
      ...req.body,
      manager: userId
    });

    const savedTeam = await newTeam.save();
    
    const populatedTeam = await Team.findById(savedTeam._id)
      .populate('manager', 'name email')
      .populate('members', 'name email');

    res.status(201).json(populatedTeam);
  } catch (error) {
    console.error('Error creating team:', error);
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return res.status(400).json({ message: 'Invalid JSON in request body' });
    }
    res.status(400).json({ message: error.message });
  }
};

export const getTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('manager', 'name email')
      .populate('members', 'name email');
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findById(id)
      .populate('manager', 'name email')
      .populate('members', 'name email');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ message: 'Error fetching team', error: error.message });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;
    
    console.log('Update team request:', { teamId: id, userId, body: req.body });
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'manager') {
      return res.status(403).json({ message: 'Only managers can update teams' });
    }

    // Find the existing team
    const existingTeam = await Team.findById(id);
    if (!existingTeam) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if the manager is updating their own team
    if (existingTeam.manager.toString() !== userId) {
      return res.status(403).json({ 
        message: 'You can only update teams you manage',
        teamManager: existingTeam.manager.toString(),
        currentUser: userId
      });
    }

    // Update the team
    const updatedTeam = await Team.findByIdAndUpdate(
      id,
      { ...req.body, manager: userId, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
    .populate('manager', 'name email')
    .populate('members', 'name email');

    res.json(updatedTeam);
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;
    
    console.log('Delete team request:', { teamId: id, userId });
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'manager') {
      return res.status(403).json({ message: 'Only managers can delete teams' });
    }

    // Find the existing team
    const existingTeam = await Team.findById(id);
    if (!existingTeam) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if the manager is deleting their own team
    if (existingTeam.manager.toString() !== userId) {
      return res.status(403).json({ 
        message: 'You can only delete teams you manage',
        teamManager: existingTeam.manager.toString(),
        currentUser: userId
      });
    }

    // Delete the team
    await Team.findByIdAndDelete(id);

    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ message: 'Error deleting team', error: error.message });
  }
};

export const addTeamMember = async (req, res) => {
  try {
    const { id: managerId } = req.user;
    const { id: teamId } = req.params;
    const { memberId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (team.manager.toString() !== managerId) {
      return res.status(403).json({ message: 'Only the team manager can add members to this team' });
    }

    const member = await User.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingTeam = await Team.findOne({ members: memberId });
    if (existingTeam) {
      return res.status(400).json({ message: 'This user is already a member of another team' });
    }

    team.members.push(memberId);
    await team.save();

    const updatedTeam = await Team.findById(teamId)
      .populate('manager', 'name email')
      .populate('members', 'name email');

    res.json(updatedTeam);
  } catch (error) {
    console.error('Error adding team member:', error);
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return res.status(400).json({ message: 'Invalid JSON in request body' });
    }
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid user or team ID format' });
    }
    res.status(400).json({ message: error.message });
  }
};
