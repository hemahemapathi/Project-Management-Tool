import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTeams, getTeamById, deleteTeam, getUserProfile } from '../../services/api';
import { Container, Row, Col, Card, Button, Modal, Toast, Badge, Spinner, Alert, ToastContainer } from 'react-bootstrap';
import { FaUsers, FaEdit, FaTrash, FaPlus, FaEye, FaUserTie, FaEnvelope } from 'react-icons/fa';
import CreateTeam from '../../pages/createteam/CreateTeam';
import './teamlist.css';

const TeamList = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeams();
    checkUserRole();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await getTeams();
      setTeams(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching teams:', error);
      setError('Failed to load teams. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkUserRole = async () => {
    try {
      const user = await getUserProfile();
      setIsManager(user.data.role === 'manager');
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const handleViewMembers = async (teamId) => {
    try {
      const response = await getTeamById(teamId);
      setSelectedTeam(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching team details:', error);
      showNotification('Error fetching team details', 'danger');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTeam(null);
  };

  const handleDeleteTeam = async (teamId, teamName) => {
    // Truncate team name for mobile display
    const displayName = teamName.length > 20 ? `${teamName.substring(0, 20)}...` : teamName;
    
    if (window.confirm(`Are you sure you want to delete "${displayName}"?`)) {
      try {
        await deleteTeam(teamId);
        await fetchTeams(); // Refresh the teams list
        showNotification('Team deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting team:', error);
        showNotification(
          error.response?.data?.message || 'Error deleting team', 
          'danger'
        );
      }
    }
  };

  const handleCreateTeam = () => {
    navigate('/team/create');
  };

  const handleEditTeam = (team) => {
    // Navigate to edit page with team ID
    navigate(`/team/edit/${team._id}`);
  };

  const handleTeamCreated = (newTeam) => {
    setTeams([...teams, newTeam]);
    setShowCreateModal(false);
    showNotification('Team created successfully', 'success');
  };

  const handleTeamUpdated = (updatedTeam) => {
    setTeams(teams.map(team => team._id === updatedTeam._id ? updatedTeam : team));
    setShowCreateModal(false);
    showNotification('Team updated successfully', 'success');
  };

  const showNotification = (message, variant = 'success') => {
    // Truncate message for mobile view
    const isMobile = window.innerWidth <= 768;
    const truncatedMessage = isMobile && message.length > 50 
      ? `${message.substring(0, 50)}...` 
      : message;
    
    setToastMessage(truncatedMessage);
    setToastVariant(variant);
    setShowToast(true);
  };

  if (loading) {
    return (
      <div className="team-list-wrapper">
        <div className="team-container">
          <div className="loading-container">
            <div className="loading-content">
              <Spinner animation="border" variant="primary" size="lg" />
              <p className="loading-text">Loading teams...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="team-list-wrapper">
      <div className="team-container">
        {/* Header Section - Fixed Alignment */}
        <div className="team-header">
          <div className="header-content-wrapper">
            <div className="header-left">
              <div className="page-title-section">
                <h1 className="page-title">
                  <FaUsers className="title-icon" />
                  <span className="title-text">Teams</span>
                </h1>
                <p className="page-subtitle">Manage your project teams and members</p>
              </div>
            </div>
            <div className="header-right">
              {isManager && (
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={handleCreateTeam}
                  className="create-team-btn"
                >
                  <FaPlus className="btn-icon" />
                  <span className="btn-text">Create New Team</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="error-section">
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          </div>
        )}

        {/* Teams Section */}
        <div className="teams-section">
          {teams.length === 0 ? (
            <div className="empty-state">
              <Card className="empty-card text-center border-0 shadow-sm">
                <Card.Body className="py-5">
                  <FaUsers className="empty-icon" />
                  <h4 className="empty-title">No Teams Found</h4>
                  <p className="empty-description">
                    {isManager ? 'Create your first team to get started!' : 'No teams available at the moment.'}
                  </p>
                  {isManager && (
                    <Button 
                      variant="primary" 
                      onClick={handleCreateTeam} 
                      className="empty-action-btn"
                    >
                      <FaPlus className="me-2" />
                      Create First Team
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </div>
          ) : (
            <div className="teams-grid">
              {teams.map((team) => (
                <div key={team._id} className="team-item">
                  <Card className="team-card border-0 shadow-sm">
                    <Card.Header className="team-card-header border-0">
                      <div className="team-header-content">
                        <h5 className="team-name">{team.name}</h5>
                        <Badge bg="primary" className="member-count">
                          {team.members?.length || 0} members
                        </Badge>
                      </div>
                    </Card.Header>
                    
                    <Card.Body className="team-card-body">
                      <div className="team-info">
                        <div className="manager-info">
                          <small className="manager-label">Team Manager</small>
                          <div className="manager-details">
                            <FaUserTie className="manager-icon" />
                            <span className="manager-name">
                              {team.manager?.name || 'Not assigned'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="team-actions">
                        <Button 
                          variant="outline-primary" 
                          onClick={() => handleViewMembers(team._id)}
                          className="action-btn view-btn"
                        >
                          <FaEye className="me-2" />
                          View Members
                        </Button>
                        
                        {isManager && (
                          <div className="manager-actions">
                            <Button 
                              variant="outline-warning" 
                              onClick={() => handleEditTeam(team)}
                              className="action-btn edit-btn"
                            >
                              <FaEdit className="me-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              onClick={() => handleDeleteTeam(team._id, team.name)}
                              className="action-btn delete-btn"
                            >
                              <FaTrash className="me-1" />
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View Members Modal */}
        <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
          <Modal.Header closeButton className="modal-header-custom border-0 pb-0">
            <Modal.Title className="modal-title-custom d-flex align-items-center">
              <FaUsers className="me-2 text-primary" />
              {selectedTeam?.name} - Team Members
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-body-custom pt-2">
            {selectedTeam?.members && selectedTeam.members.length > 0 ? (
              <div className="members-grid">
                {selectedTeam.members.map((member) => (
                  <div key={member._id} className="member-item">
                    <Card className="member-card border-0">
                      <Card.Body className="member-card-body">
                        <div className="member-content">
                          <div className="member-avatar">
                            <div className="avatar-circle">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="member-details">
                            <h6 className="member-name">{member.name}</h6>
                            <div className="member-email">
                              <FaEnvelope className="email-icon" />
                              <small>{member.email}</small>
                            </div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-members">
                <FaUsers className="no-members-icon" />
                <h5 className="no-members-title">No Members</h5>
                <p className="no-members-description">This team doesn't have any members yet.</p>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="modal-footer-custom border-0">
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Create/Edit Team Modal */}
        {isManager && (
          <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg" centered>
            <Modal.Header closeButton className="modal-header-custom border-0">
              <Modal.Title className="modal-title-custom">
                {teamToEdit ? (
                  <>
                    <FaEdit className="me-2 text-warning" />
                    Edit Team
                  </>
                ) : (
                  <>
                    <FaPlus className="me-2 text-primary" />
                    Create New Team
                  </>
                )}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-body-custom">
              <CreateTeam
                onTeamCreated={handleTeamCreated}
                onTeamUpdated={handleTeamUpdated}
                teamToEdit={teamToEdit}
                isModal={true}
                onCancel={() => setShowCreateModal(false)}
              />
            </Modal.Body>
          </Modal>
        )}

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
            className={`toast-custom toast-${toastVariant}`}
          >
            <Toast.Header closeButton className="toast-header-custom">
              <strong className="toast-title">
                {toastVariant === 'success' ? '✓ Success' : '⚠ Error'}
              </strong>
            </Toast.Header>
            <Toast.Body className="toast-body-custom">
              {toastMessage}
            </Toast.Body>
          </Toast>
        </ToastContainer>
      </div>
    </div>
  );
};

export default TeamList;
