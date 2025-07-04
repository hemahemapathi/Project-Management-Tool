import React, { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask, getProjects } from '../../services/api';
import {Button} from 'react-bootstrap'
import {FaPlus,FaUsers,FaList} from 'react-icons/fa'
import './tasklist.css';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [openDropdown, setOpenDropdown] = useState(null); // Add this for dropdown state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'To Do',
    priority: 'Medium',
    dueDate: '',
    project: ''
  });

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await getTasks();
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      showNotification('Failed to load tasks. Please try again.', 'error');
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await getProjects();
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      showNotification('Failed to load projects. Please try again.', 'error');
    }
  };

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      showNotification('Please enter a task title', 'error');
      return;
    }
    
    if (!formData.project) {
      showNotification('Please select a project', 'error');
      return;
    }

    try {
      if (editingTask) {
        await updateTask(editingTask._id, formData);
        showNotification('Task updated successfully!', 'success');
      } else {
        await createTask(formData);
        showNotification('Task created successfully!', 'success');
      }
      
      await fetchTasks();
      resetForm();
    } catch (error) {
      console.error('Error saving task:', error);
      const errorMessage = error.response?.data?.message || 'Error saving task. Please try again.';
      showNotification(errorMessage, 'error');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      project: task.project?._id || task.project || ''
    });
    setShowModal(true);
    setOpenDropdown(null); // Close dropdown
  };

  const handleDelete = async (taskId) => {
    setOpenDropdown(null); // Close dropdown
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        showNotification('Task deleted successfully!', 'success');
        await fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
        const errorMessage = error.response?.data?.message || 'Error deleting task. Please try again.';
        showNotification(errorMessage, 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'To Do',
      priority: 'Medium',
      dueDate: '',
      project: ''
    });
    setEditingTask(null);
    setShowModal(false);
  };

  const toggleDropdown = (taskId) => {
    setOpenDropdown(openDropdown === taskId ? null : taskId);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'To Do': 'bg-secondary',
      'In Progress': 'bg-warning text-dark',
      'Done': 'bg-success'
    };
    return statusClasses[status] || 'bg-secondary';
  };

  const getPriorityBadge = (priority) => {
    const priorityClasses = {
      'High': 'bg-danger',
      'Medium': 'bg-info',
      'Low': 'bg-light text-dark'
    };
    return priorityClasses[priority] || 'bg-secondary';
  };

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'info':
        return 'ℹ';
      default:
        return '✓';
    }
  };

  const getToastTitle = (type) => {
    switch (type) {
      case 'success':
        return 'Success';
      case 'error':
        return 'Error';
      case 'info':
        return 'Info';
      default:
        return 'Notification';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="task-container">
      <div className="container-fluid py-3">
        {/* Header Section - Fixed Alignment */}
                <div className="team-header">
                  <div className="header-content-wrapper">
                    <div className="header-left">
                      <div className="page-title-section">
                        <h1 className="page-title">
                          <FaList className="title-icon" />
                          <span className="title-text">Tasks</span>
                        </h1>
                        <p className="page-subtitle">Manage your project teams and members</p>
                      </div>
                    </div>
                      <Button 
                  variant="primary" 
                  size="lg"
                  className="create-team-btn"
                  onClick={() => setShowModal(true)}
                >
                 <FaPlus className="btn-icon" />
                                   <span className="btn-text">Create New Task</span>
                 </Button>
                  </div>
                </div>

        {/* Filters and Search */}
        <div className="row mb-3">
          <div className="col-lg-8 col-md-6 mb-2">
            <div className="search-box">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                className="form-control form-control-sm ps-5 rounded-pill"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-lg-4 col-md-6 mb-2">
            <select
              className="form-select form-select-sm rounded-pill"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Tasks</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="row g-3">
          {filteredTasks.length === 0 ? (
            <div className="col-12">
              <div className="empty-state text-center py-4">
                <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                <h4 className="text-muted">No tasks found</h4>
                <p className="text-muted">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'Create your first task to get started'
                  }
                </p>
              </div>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div key={task._id} className="col-xl-4 col-lg-6 col-md-6 mb-3">
                <div className="task-card h-100 rounded-4 shadow-sm">
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="flex-grow-1">
                        <h6 className="card-title fw-bold text-dark mb-2">{task.title}</h6>
                        <p className="card-text text-muted small">{task.description}</p>
                       
                      </div>
                      
                      {/* Fixed Dropdown */}
                      <div className="dropdown position-relative">
                        <button 
                          className="btn btn-link text-muted p-1 btn-sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDropdown(task._id);
                          }}
                          type="button"
                        >
                          <i className="fas fa-ellipsis-v"></i>
                        </button>
                        
                        {openDropdown === task._id && (
                          <div className="dropdown-menu show position-absolute" style={{ right: 0, top: '100%', zIndex: 1000 }}>
                            <button 
                              className="dropdown-item d-flex align-items-center" 
                              onClick={() => handleEdit(task)}
                              type="button"
                            >
                              <i className="fas fa-edit me-2 text-primary"></i>
                              Edit
                            </button>
                            <button 
                              className="dropdown-item d-flex align-items-center text-danger" 
                              onClick={() => handleDelete(task._id)}
                              type="button"
                            >
                              <i className="fas fa-trash me-2"></i>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="d-flex flex-wrap gap-1 mb-2">
                      <span className={`badge ${getStatusBadge(task.status)} px-2 py-1 rounded-pill small`}>
                        {task.status}
                      </span>
                      <span className={`badge ${getPriorityBadge(task.priority)} px-2 py-1 rounded-pill small`}>
                        {task.priority}
                      </span>
                    </div>
                    
                    {task.dueDate && (
                      <div className="d-flex align-items-center text-muted">
                        <i className="fas fa-calendar-alt me-2"></i>
                        <small>Due: {new Date(task.dueDate).toLocaleDateString()}</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h6 className="modal-title fw-bold text-dark">
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h6>
                <button type="button" className="btn-close btn-sm" onClick={resetForm}></button>
              </div>
              <div className="modal-body pt-0">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark small">Title *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm rounded-3"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                      placeholder="Enter task title"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark small">Project *</label>
                    <select
                      className="form-select form-select-sm rounded-3"
                      value={formData.project}
                      onChange={(e) => setFormData({...formData, project: e.target.value})}
                      required
                    >
                      <option value="">Select a project</option>
                      {projects.map((project) => (
                        <option key={project._id} value={project._id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-3">
                                        <label className="form-label fw-semibold text-dark small">Description</label>
                    <textarea
                      className="form-control form-control-sm rounded-3"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Enter task description (optional)"
                    ></textarea>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-semibold text-dark small">Status</label>
                      <select
                        className="form-select form-select-sm rounded-3"
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-semibold text-dark small">Priority</label>
                      <select
                        className="form-select form-select-sm rounded-3"
                        value={formData.priority}
                        onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-semibold text-dark small">Due Date</label>
                      <input
                        type="date"
                        className="form-control form-control-sm rounded-3"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  <div className="d-flex gap-2 justify-content-end">
                    <button type="button" className="btn btn-light btn-sm rounded-pill px-3" onClick={resetForm}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm rounded-pill px-3">
                      <i className={`fas ${editingTask ? 'fa-save' : 'fa-plus'} me-1`}></i>
                      {editingTask ? 'Update Task' : 'Create Task'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
          <div className={`toast show align-items-center text-white bg-${toastType === 'success' ? 'success' : toastType === 'error' ? 'danger' : 'info'} border-0 rounded-3 shadow-lg`} role="alert">
            <div className="d-flex">
              <div className="toast-body d-flex align-items-center">
                <span className="me-2 fw-bold fs-5">{getToastIcon(toastType)}</span>
                <div>
                  <div className="fw-bold small">{getToastTitle(toastType)}</div>
                  <div className="small opacity-75">{toastMessage}</div>
                </div>
              </div>
              <button 
                type="button" 
                className="btn-close btn-close-white me-2 m-auto" 
                onClick={() => setShowToast(false)}
                aria-label="Close"
              ></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;

