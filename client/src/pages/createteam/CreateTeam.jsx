import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createTeam, getUsers, updateTeam, getUserProfile, getTeamById } from '../../services/api';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Badge, Modal } from 'react-bootstrap';
import { FaUsers, FaPlus, FaTimes, FaUserPlus, FaUserMinus, FaSave, FaArrowLeft, FaSearch } from 'react-icons/fa';
import './createteam.css'

const CreateTeam = ({ onTeamCreated, teamToEdit, onTeamUpdated, onCancel, isModal = false }) => {
  const navigate = useNavigate();
  const { id } = useParams(); // This will get the team ID from URL for editing
  const [teamData, setTeamData] = useState({
    name: '',
    description: '',
    members: [],
  });
  const [allUsers, setAllUsers] = useState([]);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [selectedMember, setSelectedMember] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTeam, setEditingTeam] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
    
    // Check if we're in edit mode (either from URL param or prop)
    if (id || teamToEdit) {
      setIsEditMode(true);
      if (id) {
        fetchTeamForEdit(id);
      }
    }
  }, [id, teamToEdit]);

  useEffect(() => {
    if (teamToEdit && allUsers.length > 0) {
      setTeamData({
        ...teamToEdit,
        members: teamToEdit.members.map(member => {
          const user = allUsers.find(user => user._id === member._id);
          return user ? { ...member, name: user.name } : member;
        })
      });
      setEditingTeam(teamToEdit);
    }
  }, [teamToEdit, allUsers]);

  useEffect(() => {
    if (editingTeam && allUsers.length > 0) {
      setTeamData({
        ...editingTeam,
        members: editingTeam.members.map(member => {
          const user = allUsers.find(user => user._id === member._id);
          return user ? { ...member, name: user.name } : member;
        })
      });
    }
  }, [editingTeam, allUsers]);

  const fetchTeamForEdit = async (teamId) => {
    try {
      setLoading(true);
      const response = await getTeamById(teamId);
      setEditingTeam(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching team for edit:', error);
      setError('Failed to fetch team details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setAllUsers(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users. Please ensure you have the necessary permissions.');
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await getUserProfile();
      setCurrentUser(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching current user:', error);
      setError('Failed to fetch current user. Please ensure you are logged in and have the necessary permissions.');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTeamData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleMemberAdd = () => {
    if (selectedMember && !teamData.members.some(member => member._id === selectedMember)) {
      const memberToAdd = allUsers.find(user => user._id === selectedMember);
      if (memberToAdd) {
        setTeamData(prevData => ({
          ...prevData,
          members: [...prevData.members, memberToAdd]
        }));
        setSelectedMember('');
        setShowMemberModal(false);
      }
    }
  };

  const handleMemberRemove = (memberId) => {
    setTeamData(prevData => ({
      ...prevData,
      members: prevData.members.filter(member => member._id !== memberId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const teamDataToSend = {
        ...teamData,
        members: teamData.members.map(member => member._id)
      };

      if (isEditMode) {
        // Get the team ID from either URL param or teamToEdit prop
        const teamId = id || teamToEdit?._id || editingTeam?._id;
        
        if (!teamId) {
          throw new Error('Team ID not found for update');
        }

        const response = await updateTeam(teamId, teamDataToSend);
        
        if (onTeamUpdated) {
          onTeamUpdated(response.data);
        }
        
        setNotification('Team updated successfully!');
        
        setTimeout(() => {
          if (!isModal) {
            navigate('/team');
          }
        }, 2000);
      } else {
        const response = await createTeam(teamDataToSend);
        
        if (onTeamCreated) {
          onTeamCreated(response.data);
        }
        
        setNotification('Team created successfully!');
        
        setTimeout(() => {
          if (!isModal) {
            navigate('/team');
          }
        }, 2000);
      }

      if (!isModal) {
        setTeamData({
          name: '',
          description: '',
          members: [],
        });
      }

      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      console.error('Error creating/updating team:', error);
      setError(error.response?.data?.message || 'Failed to create/update team. Please ensure you have the necessary permissions.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/team');
    }
  };

  const availableUsers = allUsers.filter(user => 
    !teamData.members.some(member => member._id === user._id) &&
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="create-team-loading">
        <div className="loading-spinner">
          <Spinner animation="border" variant="primary" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="create-team-loading">
        <div className="loading-spinner">
          <Spinner animation="border" variant="primary" />
          <p>Authenticating...</p>
        </div>
      </div>
    );
  }

  if (currentUser.role !== 'manager') {
    return (
      <div className="create-team-error">
        <div className="error-content">
          <FaUsers className="error-icon" />
          <h4>Access Denied</h4>
          <p>Only managers can create or edit teams.</p>
          <Button variant="primary" onClick={handleCancel}>
            <FaArrowLeft className="me-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const formContent = (
    <div className="create-team-container">
      <Container fluid className="p-0">
        <div className="team-form-wrapper">
          {/* Header */}
          <div className="form-header">
            <div className="header-content">
              <FaUsers className="header-icon" />
              <div className="header-text">
                <h2>{isEditMode ? 'Edit Team' : 'Create Team'}</h2>
                <p>{isEditMode ? 'Update team information' : 'Build your team'}</p>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <Alert variant="danger" className="alert-custom" dismissible onClose={() => setError(null)}>
              <FaTimes className="me-2" />
              {error}
            </Alert>
          )}
          
          {notification && (
            <Alert variant="success" className="alert-custom" dismissible onClose={() => setNotification(null)}>
              <FaSave className="me-2" />
              {notification}
            </Alert>
          )}

          {/* Form */}
          <Form onSubmit={handleSubmit} className="team-form">
            {/* Basic Info */}
            <div className="form-section">
              <h5 className="section-title">Basic Information</h5>
              
              <Row>
                <Col md={8} xs={12} className="mb-3">
                  <Form.Group>
                    <Form.Label>Team Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={teamData.name || ''}
                      onChange={handleChange}
                      placeholder="Enter team name"
                      required
                    />
                  </Form.Group>
                </Col>
                
                <Col md={4} xs={12} className="mb-3">
                  <Form.Group>
                    <Form.Label>Team Size</Form.Label>
                    <div className="team-size-display">
                      <Badge bg="primary" className="size-badge">
                        {teamData.members.length} member{teamData.members.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={teamData.description || ''}
                  onChange={handleChange}
                  placeholder="Describe the team's purpose"
                />
              </Form.Group>
            </div>

            {/* Team Members */}
            <div className="form-section">
              <div className="section-header">
                <h5 className="section-title">Team Members</h5>
                <Button
                  type="button"
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setShowMemberModal(true)}
                  className="add-member-btn"
                >
                  <FaUserPlus className="me-2" />
                  Add Member
                </Button>
              </div>

              {/* Members List */}
              <div className="members-container">
                {teamData.members.length === 0 ? (
                  <div className="empty-members">
                    <FaUsers className="empty-icon" />
                    <p>No team members yet</p>
                    <small>Add members to build your team</small>
                  </div>
                ) : (
                  <div className="members-list">
                    {teamData.members.map((member, index) => (
                      <div key={`${member._id}-${index}`} className="member-item">
                        <div className="member-info">
                          <div className="member-avatar">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="member-details">
                            <span className="member-name">{member.name}</span>
                            <small className="member-email">{member.email || 'No email'}</small>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleMemberRemove(member._id)}
                          className="remove-btn"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
                disabled={submitting || !teamData.name.trim()}
                className="submit-btn"
              >
                {submitting ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      className="me-2"
                    />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <FaSave className="me-2" />
                    {isEditMode ? 'Update Team' : 'Create Team'}
                  </>
                )}
              </Button>
            </div>
          </Form>
        </div>
      </Container>

      {/* Add Member Modal */}
      <Modal show={showMemberModal} onHide={() => setShowMemberModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Team Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Search Members</Form.Label>
            <div className="search-input">
              <FaSearch className="search-icon" />
              <Form.Control
                type="text"
                placeholder="Search by name..."
                                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </Form.Group>
          
          <Form.Group>
            <Form.Label>Available Members</Form.Label>
            <Form.Select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
            >
              <option value="">Choose a team member...</option>
              {availableUsers.map(user => (
                <option key={user._id} value={user._id}>{user.name}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMemberModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleMemberAdd}
            disabled={!selectedMember}
          >
            <FaUserPlus className="me-2" />
            Add Member
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );

  if (isModal) {
    return formContent;
  }

  return (
    <div className="create-team-page">
      {formContent}
    </div>
  );
};

export default CreateTeam;

