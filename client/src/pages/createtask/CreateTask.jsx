import React, { useState, useEffect } from 'react';
import { createTask, getProjects, getUsers, updateTask } from '../../services/api';
import './createtask.css'; // Keep this import for the new CSS
import { Container, Row, Col, Button, Form, Alert, Spinner } from 'react-bootstrap'; // Import Bootstrap components
import { FaTasks, FaSave, FaArrowLeft } from 'react-icons/fa'; // Import icons

// Add isModal prop to the component signature
const CreateTask = ({ onTaskCreated, taskToEdit, onTaskUpdated, onCancel, isModal = false }) => {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    status: 'To Do',
    priority: 'Medium',
    dueDate: '',
    project: '',
    assignedTo: '',
  });
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // This is correctly defined
  const [submitting, setSubmitting] = useState(false); // Add submitting state for button loading
  const [loading, setLoading] = useState(true); // Add loading state for initial data fetch

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchProjects();
      await fetchUsers();
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (taskToEdit) {
      setTaskData(taskToEdit);
      setIsEditing(true);
    } else {
      resetTaskData();
      setIsEditing(false);
    }
  }, [taskToEdit]);

  const resetTaskData = () => {
    setTaskData({
      title: '',
      description: '',
      status: 'To Do',
      priority: 'Medium',
      dueDate: '',
      project: '',
      assignedTo: '',
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const fetchProjects = async () => {
    try {
      const response = await getProjects();
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to fetch projects.');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      const teamMembers = response.data.filter(user => user.role === 'team_member');
      setUsers(teamMembers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'dueDate') {
      setTaskData(prevData => ({
        ...prevData,
        [name]: value ? new Date(value).toISOString() : '' // Handle empty date input
      }));
    } else {
      setTaskData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setNotification(null);
    setSubmitting(true);

    try {
      let response;
      if (isEditing) {
        response = await updateTask(taskData._id, taskData);
        if (onTaskUpdated) onTaskUpdated(response.data);
      } else {
        response = await createTask(taskData);
        if (onTaskCreated) onTaskCreated(response.data);
      }
      setNotification(isEditing ? 'Task updated successfully!' : 'Task created successfully!');
      resetTaskData();
      setIsEditing(false);
      setTimeout(() => {
        setNotification(null);
        if (onCancel) onCancel(); // Close modal/form after success
      }, 2000); // Shorter timeout for better UX
    } catch (error) {
      console.error('Error creating/updating task:', error);
      setError(error.response?.data?.message || 'Failed to create/update task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      // Optionally navigate back or clear form if not in modal
      resetTaskData();
      setIsEditing(false);
    }
  };

  // The form content itself, which will be rendered either directly or inside a modal
  const formContent = (
    // These class names (create-team-container, team-form-wrapper, team-form)
    // are expected to be styled by createtask.css (which seems to be a copy of createteam.css)
    <div className="create-team-container">
      <Container fluid className="p-0">
        <div className="team-form-wrapper">
          {/* Header */}
          <div className="form-header">
            <div className="header-content">
              <FaTasks className="header-icon" />
              <div className="header-text">
                <h2>{isEditing ? 'Edit Task' : 'Create New Task'}</h2>
                <p>{isEditing ? 'Update task details' : 'Define a new task for your project'}</p>
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <Alert variant="danger" className="alert-custom" dismissible onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            {notification && (
              <Alert variant="success" className="alert-custom" dismissible onClose={() => setNotification(null)}>
                {notification}
              </Alert>
            )}

            {/* Form */}
            <Form onSubmit={handleSubmit} className="team-form">
              {/* Basic Information */}
              <div className="form-section">
                <h5 className="section-title">Task Details</h5>
                <Row>
                  <Col md={12} className="mb-3">
                    <Form.Group controlId="taskTitle">
                      <Form.Label>Task Title *</Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={taskData.title}
                        onChange={handleChange}
                        placeholder="Enter task title"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12} className="mb-3">
                    <Form.Group controlId="taskDescription">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="description"
                        value={taskData.description}
                        onChange={handleChange}
                        placeholder="Provide a detailed description of the task"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              {/* Status & Priority */}
              <div className="form-section">
                <h5 className="section-title">Status & Priority</h5>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group controlId="taskStatus">
                      <Form.Label>Status *</Form.Label>
                      <Form.Select
                        name="status"
                        value={taskData.status}
                        onChange={handleChange}
                        required
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group controlId="taskPriority">
                      <Form.Label>Priority *</Form.Label>
                      <Form.Select
                        name="priority"
                        value={taskData.priority}
                        onChange={handleChange}
                        required
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              {/* Assignment & Due Date */}
              <div className="form-section">
                <h5 className="section-title">Assignment & Schedule</h5>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group controlId="taskProject">
                      <Form.Label>Project *</Form.Label>
                      <Form.Select
                        name="project"
                        value={taskData.project}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Project</option>
                        {projects.map(project => (
                          <option key={project._id} value={project._id}>{project.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group controlId="taskAssignedTo">
                      <Form.Label>Assign To</Form.Label>
                      <Form.Select
                        name="assignedTo"
                        value={taskData.assignedTo}
                        onChange={handleChange}
                      >
                        <option value="">Assign To</option>
                        {users.map(user => (
                          <option key={user._id} value={user._id}>{user.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={12} className="mb-3">
                    <Form.Group controlId="taskDueDate">
                      <Form.Label>Due Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="dueDate"
                        value={formatDate(taskData.dueDate)}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={handleCancel}
                  disabled={submitting}
                  className="cancel-btn"
                >
                  <FaArrowLeft className="me-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting || !taskData.title.trim() || !taskData.project}
                  className="submit-btn"
                >
                  {submitting ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <FaSave className="me-2" />
                      {isEditing ? 'Update Task' : 'Create Task'}
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </Container>
    </div>
  );

  if (loading) {
    return (
      <div className="create-team-loading">
        <div className="loading-spinner">
          <Spinner animation="border" variant="primary" />
          <p>Loading form data...</p>
        </div>
      </div>
    );
  }

  // Conditionally render based on isModal prop
  if (isModal) {
    return formContent;
  }

  return (
    <div className="create-team-page">
      {formContent}
    </div>
  );
};

export default CreateTask;
