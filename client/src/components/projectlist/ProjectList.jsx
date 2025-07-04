import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProjects, deleteProject, getTeams } from '../../services/api';
import FilterSort from '../filtersort/FilterSort';
import { filterProjects, sortProjects } from '../../services/filter';
import { Toast, ToastContainer, Dropdown, Container, Row, Col, Card, Badge, Button, Modal, Form, InputGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaClock, FaExclamationTriangle, FaSearch, FaFilter, FaSort, FaProjectDiagram, FaList, FaTh, FaEllipsisV,FaUsers, FaCheckCircle, FaTimes } from 'react-icons/fa';
import './projectlist.css'

const ProjectList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('name');
  const [userRole, setUserRole] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [teamMembers, setTeamMembers] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setUserRole(user ? user.user.role : null);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown')) {
        setOpenDropdown(null);
        setFilterDropdownOpen(false);
        setSortDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (location.state?.created) {
      showNotification('Project created successfully!', 'success');
      navigate('/projects', { replace: true });
    } else if (location.state?.updated) {
      showNotification('Project updated successfully!', 'success');
      navigate('/projects', { replace: true });
    }
  }, [location.state, navigate]);
  
  useEffect(() => {
    let result = filterProjects(projects, filter);
    
    if (searchTerm) {
      result = result.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    result = sortProjects(result, sort);
    setFilteredProjects(result);
  }, [projects, filter, sort, searchTerm]);

  const fetchProjects = async () => {
    try {
      const response = await getProjects();
      const updatedProjects = response.data.map(project => ({
        ...project,
        isCompleted: new Date(project.endDate) < new Date() && project.status !== 'Completed',
        remainingDays: calculateRemainingDays(project.endDate)
      }));
      setProjects(updatedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      showNotification('Error fetching projects', 'error');
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await getTeams();
      setTeamMembers(response.data);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await deleteProject(projectId);
      fetchProjects();
      showNotification('Project deleted successfully', 'success');
      setShowDeleteModal(false);
      setProjectToDelete(null);
      setOpenDropdown(null);
    } catch (error) {
      console.error('Error deleting project:', error);
      if (error.response && error.response.status === 403) {
        showNotification('Access denied', 'error');
      } else {
        showNotification('Delete failed', 'error');
      }
    }
  };

  const handleEditProject = (project) => {
    setOpenDropdown(null);
    const projectForEdit = {
      ...project,
      startDate: project.startDate ? new Date(project.startDate).toISOString() : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString() : '',
      team_members: project.team_members || []
    };
    
    console.log('Editing project:', projectForEdit);
    navigate('/create-project', { state: { project: projectForEdit } });
  };

  const showNotification = (message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const confirmDelete = (project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
    setOpenDropdown(null);
  };

  const handleCreateProject = () => {
    navigate('/create-project');
  };

  const toggleDropdown = (projectId) => {
    setOpenDropdown(openDropdown === projectId ? null : projectId);
    setFilterDropdownOpen(false);
    setSortDropdownOpen(false);
  };

  const toggleFilterDropdown = () => {
    setFilterDropdownOpen(!filterDropdownOpen);
    setSortDropdownOpen(false);
    setOpenDropdown(null);
  };

  const toggleSortDropdown = () => {
    setSortDropdownOpen(!sortDropdownOpen);
    setFilterDropdownOpen(false);
    setOpenDropdown(null);
  };

  const handleFilterSelect = (filterValue) => {
    setFilter(filterValue);
    setFilterDropdownOpen(false);
  };

  const handleSortSelect = (sortValue) => {
    setSort(sortValue);
    setSortDropdownOpen(false);
  };

  const filters = ['In-Progress', 'Completed', 'Not Started'];

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'endDate', label: 'End Date' },
    { value: 'status', label: 'Status' }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const calculateRemainingDays = (endDate) => {
    const today = new Date();
    const dueDate = new Date(endDate);
    const timeDiff = dueDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff > 0 ? daysDiff : 0;
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In-Progress': return 'primary';
      case 'Not Started': return 'warning';
      default: return 'secondary';
    }
  };

  const getProgressPercentage = (status) => {
    switch (status) {
      case 'Completed': return 100;
      case 'In-Progress': return 60;
      case 'Not Started': return 0;
      default: return 0;
    }
  };

  return (
    <div className="project-list-wrapper">
      <Container fluid className="project-container">
        {/* Header Section - Fixed Alignment */}
        <div className="team-header">
          <div className="header-content-wrapper">
            <div className="header-left">
              <div className="page-title-section">
                <h1 className="page-title">
                  <FaProjectDiagram className="title-icon" />
                  <span className="title-text">Projects</span>
                </h1>
                <p className="page-subtitle">Manage your project teams and members</p>
              </div>
            </div>
            <div className="header-right">
              {userRole === 'manager' && (
                <Button 
                  variant="primary" 
                  className="create-btn"
                  onClick={handleCreateProject}
                >
                  <FaPlus className="btn-icon" />
                  <span className="btn-text">New Project</span>
                </Button>
              )}
            </div>  
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
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-lg-4 col-md-6 mb-2">
            <select
              className="form-select form-select-sm rounded-pill"
              value={filter}
              onChange={(e) => handleFilterSelect(e.target.value)}
            >
              <option value="">All Projects</option>
              <option value="Completed">Completed</option>
              <option value="In-Progress">In Progress</option>
              <option value="Not Started">Not Started</option>
            </select>
          </div>
        </div>

        {/* Projects Grid/List */}
        <div className="projects-section">
          {filteredProjects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-content">
                <FaProjectDiagram className="empty-icon" />
                <h3 className="empty-title">No Projects Found</h3>
                <p className="empty-description">
                  {searchTerm || filter 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'Create your first project to get started'
                  }
                </p>
                {userRole === 'manager' && !searchTerm && !filter && (
                  <Button 
                    variant="primary" 
                    onClick={handleCreateProject}
                    className="empty-action-btn"
                  >
                    <FaPlus className="btn-icon" />
                    Create First Project
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className={`projects-grid ${viewMode}`}>
              {filteredProjects.map((project) => (
                <div key={project._id} className="project-card-wrapper">
                  <div className={`project-card ${project.isCompleted ? 'overdue' : ''}`}>
                    {/* Card Header */}
                    <div className="card-header">
                      <div className="status-section">
                        <Badge bg={getStatusVariant(project.status)} className="status-badge">
                          {project.status}
                        </Badge>
                        {project.isCompleted && (
                          <Badge bg="danger" className="overdue-badge">
                            <FaExclamationTriangle className="badge-icon" />
                            Overdue
                          </Badge>
                        )}
                      </div>
                      {userRole === 'manager' && (
                        <div className="project-dropdown">
                          <button 
                            className="dropdown-toggle-btn" 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDropdown(project._id);
                            }}
                            type="button"
                          >
                            <FaEllipsisV />
                          </button>
                          
                          {openDropdown === project._id && (
                            <div className="dropdown-menu show">
                              <button 
                                className="dropdown-item" 
                                onClick={() => handleEditProject(project)}
                                type="button"
                              >
                                <FaEdit className="me-2 text-primary" />
                                Edit
                              </button>
                              <button 
                                className="dropdown-item text-danger" 
                                onClick={() => confirmDelete(project)}
                                type="button"
                              >
                                <FaTrash className="me-2" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="card-body">
                      <h3 className="project-title">{project.name}</h3>
                      <p className="project-description">{project.description}</p>

                      {/* Progress Section */}
                      <div className="progress-section">
                        <div className="progress-header">
                          <span className="progress-label">Progress</span>
                          <span className="progress-value">{getProgressPercentage(project.status)}%</span>
                        </div>
                        <div className="progress-bar-wrapper">
                          <div 
                            className={`progress-bar ${getStatusVariant(project.status)}`}
                            style={{ width: `${getProgressPercentage(project.status)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Project Details */}
                      <div className="project-details">
                        <div className="detail-item">
                          <FaCalendarAlt className="detail-icon" />
                          <span className="detail-text">Due: {formatDate(project.endDate)}</span>
                        </div>
                        <div className="detail-item">
                          <FaClock className="detail-icon" />
                          <span className={`detail-text ${
                            project.remainingDays > 7 ? 'text-success' : 
                                                        project.remainingDays > 3 ? 'text-warning' : 'text-danger'
                          }`}>
                            {project.remainingDays > 0 ? `${project.remainingDays} days left` : 'Overdue'}
                          </span>
                        </div>
                        <div className="detail-item">
                          <FaUsers className="detail-icon" />
                          <span className="detail-text">
                            {project.team_members?.length || 0} members
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <FaExclamationTriangle className="text-warning me-2" />
              Confirm Delete
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete the project <strong>"{projectToDelete?.name}"</strong>?</p>
            <p className="text-muted small">This action cannot be undone.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={() => handleDeleteProject(projectToDelete?._id)}
            >
              <FaTrash className="me-2" />
              Delete Project
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Responsive Toast Container */}
        <ToastContainer 
          position="top-end" 
          className="toast-container-custom"
        >
          <Toast 
            show={showToast} 
            onClose={() => setShowToast(false)} 
            delay={3000} 
            autohide
            className={`toast-custom toast-${toastType}`}
          >
            <Toast.Header closeButton={true} className="toast-header-custom">
              <div className="toast-icon">
                {toastType === 'success' ? (
                  <FaCheckCircle className="text-success" />
                ) : toastType === 'error' ? (
                  <FaExclamationTriangle className="text-danger" />
                ) : (
                  <FaExclamationTriangle className="text-warning" />
                )}
              </div>
              <strong className="toast-title">
                {toastType === 'success' ? 'Success' : 
                 toastType === 'error' ? 'Error' : 'Info'}
              </strong>
            </Toast.Header>
            <Toast.Body className="toast-body-custom">
              {toastMessage}
            </Toast.Body>
          </Toast>
        </ToastContainer>
      </Container>
    </div>
  );
};

export default ProjectList;

                            
