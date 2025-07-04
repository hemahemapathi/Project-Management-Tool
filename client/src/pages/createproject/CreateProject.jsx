import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createProject, updateProject, getUsers } from '../../services/api';
import { 
  FaArrowLeft, 
  FaProjectDiagram, 
  FaInfoCircle, 
  FaCalendarAlt, 
  FaUsers, 
  FaSave, 
  FaTimes, 
  FaPlus, 
  FaEnvelope,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa';
import { Toast, ToastContainer } from 'react-bootstrap'; // Import Toast and ToastContainer
import './createproject.css';

const CreateProject = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const projectToEdit = location.state?.project;
  const isEditing = !!projectToEdit;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'Not Started',
    priority: 'Medium',
    team_members: []
  });

  // UI state
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ show: false, message: '', type: '' }); // Renamed from 'toast' to 'alert' for consistency with existing logic

  useEffect(() => {
    fetchUsers();
    
    if (isEditing && projectToEdit) {
      console.log('Loading project for edit:', projectToEdit);
      
      // Format dates for input fields
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        // Ensure date is treated as UTC to avoid timezone issues with toISOString
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      setFormData({
        name: projectToEdit.name || '',
        description: projectToEdit.description || '',
        startDate: formatDateForInput(projectToEdit.startDate),
        endDate: formatDateForInput(projectToEdit.endDate),
        status: projectToEdit.status || 'Not Started',
        priority: projectToEdit.priority || 'Medium',
        team_members: projectToEdit.team_members || []
      });
    }
  }, [isEditing, projectToEdit]);

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setAvailableUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      showAlert('Error fetching users. Some features may not work properly.', 'error');
    }
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: '' });
    }, 5000); // Toast will auto-hide after 5 seconds
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (endDate <= startDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddTeamMember = () => {
    if (!selectedUser) return;

    const userToAdd = availableUsers.find(user => user._id === selectedUser);
    if (!userToAdd) return;

    // Check if user is already added
    const isAlreadyAdded = formData.team_members.some(member => member._id === selectedUser);
    if (isAlreadyAdded) {
      showAlert('This user is already added to the team', 'error');
      return;
    }

    setFormData(prev => ({
      ...prev,
      team_members: [...prev.team_members, userToAdd]
    }));

    setSelectedUser('');
  };

  const handleRemoveTeamMember = (userId) => {
    setFormData(prev => ({
      ...prev,
      team_members: prev.team_members.filter(member => member._id !== userId)
    }));
  };

  const calculateRemainingDays = () => {
    if (!formData.endDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date to start of day
    const endDate = new Date(formData.endDate);
    endDate.setHours(0, 0, 0, 0); // Normalize end date to start of day

    const timeDiff = endDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return daysDiff;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showAlert('Please fix the errors below', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for submission
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        priority: formData.priority,
        team_members: formData.team_members.map(member => member._id)
      };

      console.log('Submitting project data:', submitData);

      let response;
      if (isEditing) {
        response = await updateProject(projectToEdit._id, submitData);
        console.log('Update response:', response);
      } else {
        response = await createProject(submitData);
        console.log('Create response:', response);
      }

      showAlert(
        `Project ${isEditing ? 'updated' : 'created'} successfully!`, 
        'success'
      );

      // Navigate back to projects list with success state
      setTimeout(() => {
        navigate('/projects', { 
          state: { 
            [isEditing ? 'updated' : 'created']: true 
          } 
        });
      }, 1500);

    } catch (error) {
      console.error('Error saving project:', error);
      
      let errorMessage = 'Failed to create/update project. Please check your permissions and try again.';
      
      if (error.response) {
        console.error('Error response:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
        
        if (error.response.status === 403) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (error.response.status === 400) {
          errorMessage = 'Invalid project data. Please check all fields.';
        } else if (error.response.status === 404 && isEditing) {
          errorMessage = 'Project not found. It may have been deleted.';
        }
      }
      
      showAlert(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/projects');
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In-Progress': return 'primary';
      case 'Not Started': return 'secondary';
      default: return 'secondary';
    }
  };

    const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'High': return 'danger';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'secondary';
    }
  };

  const remainingDays = calculateRemainingDays();

  return (
    <div className="create-project-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <button 
            type="button" 
            className="back-btn" 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>
          
          <div className="header-title">
            <div className="title-icon">
              <FaProjectDiagram />
            </div>
            <div>
              <h1>{isEditing ? 'Edit Project' : 'Create New Project'}</h1>
              <p>{isEditing ? 'Update your project details' : 'Set up a new project for your team'}</p>
            </div>
          </div>
        </div>

        {/* Alert/Toast Notification */}
        <ToastContainer 
          position="top-end" 
          className="toast-container-custom"
        >
          <Toast 
            show={alert.show} 
            onClose={() => setAlert({ show: false, message: '', type: '' })} 
            delay={5000} 
            autohide
            className={`toast-custom toast-${alert.type}`}
          >
            <Toast.Header closeButton={true} className="toast-header-custom">
              <div className="toast-icon">
                {alert.type === 'success' ? (
                  <FaCheckCircle className="text-success" />
                ) : (
                  <FaExclamationTriangle className="text-danger" />
                )}
              </div>
              <strong className="toast-title">
                {alert.type === 'success' ? 'Success' : 'Error'}
              </strong>
            </Toast.Header>
            <Toast.Body className="toast-body-custom">
              {alert.message}
            </Toast.Body>
          </Toast>
        </ToastContainer>

        <form onSubmit={handleSubmit} className="project-form">
          {/* Basic Information */}
          <div className="form-section">
            <div className="section-title">
              <FaInfoCircle />
              <span>Basic Information</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Project Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter project name"
                  className={errors.name ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <span className={`priority-badge ${getPriorityBadgeClass(formData.priority)}`}>
                  {formData.priority}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your project goals and objectives"
                rows="4"
                className={errors.description ? 'error' : ''}
                disabled={isSubmitting}
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>
          </div>

          {/* Timeline */}
          <div className="form-section">
            <div className="section-title">
              <FaCalendarAlt />
              <span>Timeline</span>
              {remainingDays !== null && (
                <span className={`days-remaining ${remainingDays < 0 ? 'overdue' : remainingDays < 7 ? 'warning' : 'normal'}`}>
                  {remainingDays < 0 ? `${Math.abs(remainingDays)} days overdue` : 
                   remainingDays === 0 ? 'Due today' : 
                   `${remainingDays} days remaining`}
                </span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Start Date *</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={errors.startDate ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {errors.startDate && <span className="error-message">{errors.startDate}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="endDate">End Date *</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={errors.endDate ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {errors.endDate && <span className="error-message">{errors.endDate}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In-Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <span className={`status-badge ${getStatusBadgeClass(formData.status)}`}>
                  {formData.status}
                </span>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="form-section">
            <div className="section-title">
              <FaUsers />
              <span>Team Members</span>
              <span className="member-count">
                {formData.team_members.length} member{formData.team_members.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="add-member">
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="">Select a team member</option>
                {availableUsers.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="add-btn"
                onClick={handleAddTeamMember}
                disabled={!selectedUser || isSubmitting}
              >
                <FaPlus />                Add Member
              </button>
            </div>

            <div className="team-members-list">
              {formData.team_members.length === 0 ? (
                <div className="empty-members">
                  <FaUsers />
                  <p>No team members added yet</p>
                </div>
              ) : (
                formData.team_members.map(member => (
                  <div key={member._id} className="member-item">
                    <div className="member-avatar">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="member-info">
                      <div className="member-name">{member.name}</div>
                      <div className="member-email">
                        <FaEnvelope />
                        {member.email}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => handleRemoveTeamMember(member._id)}
                      disabled={isSubmitting}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-cancel"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              <FaTimes />
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <FaSave />
                  {isEditing ? 'Update Project' : 'Create Project'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;

