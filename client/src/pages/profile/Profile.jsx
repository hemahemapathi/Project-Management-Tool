import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge, ProgressBar, Table } from 'react-bootstrap';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
    department: '',
    bio: ''
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [stats, setStats] = useState({
    projects: 0,
    tasks: 0,
    teams: 0,
    completionRate: 0
  });

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        name: parsedUser.name || '',
        email: parsedUser.email || '',
        role: parsedUser.role || '',
        phone: parsedUser.phone || '',
        department: parsedUser.department || '',
        bio: parsedUser.bio || ''
      });
    }

    // Mock stats - in real app, fetch from API
    setStats({
      projects: 12,
      tasks: 45,
      teams: 3,
      completionRate: 78
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    try {
      // Update user data in localStorage
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      
      setAlertMessage('Profile updated successfully!');
      setAlertType('success');
      setShowAlert(true);
      
      // Hide alert after 3 seconds
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      setAlertMessage('Error updating profile. Please try again.');
      setAlertType('danger');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || '',
      phone: user?.phone || '',
      department: user?.department || '',
      bio: user?.bio || ''
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <Alert variant="warning" className="text-center">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Please log in to view your profile.
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-3 py-md-4">
      <Row className="justify-content-center">
        <Col xs={12} xl={10}>
          {showAlert && (
            <Alert variant={alertType} className="mb-3 mb-md-4">
              <i className={`fas ${alertType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2`}></i>
              {alertMessage}
            </Alert>
          )}

          {/* Profile Header Card */}
          <Card className="border-0 shadow-sm mb-3 mb-md-4">
            <Card.Header className="bg-white border-0 pb-0">
              <Row className="align-items-center">
                <Col xs={12} md={6}>
                  <h4 className="mb-2 mb-md-0">
                    <i className="fas fa-user me-2 text-primary"></i>
                    My Profile
                  </h4>
                </Col>
                <Col xs={12} md={6} className="text-md-end">
                  {!isEditing ? (
                    <Button 
                      variant="outline-primary" 
                      onClick={() => setIsEditing(true)}
                      className="w-100 w-md-auto"
                    >
                      <i className="fas fa-edit me-2"></i>
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="d-flex flex-column flex-md-row gap-2">
                      <Button 
                        variant="success" 
                        onClick={handleSave}
                        className="order-2 order-md-1"
                      >
                        <i className="fas fa-save me-2"></i>
                        Save
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        onClick={handleCancel}
                        className="order-1 order-md-2"
                      >
                        <i className="fas fa-times me-2"></i>
                        Cancel
                      </Button>
                    </div>
                  )}
                </Col>
              </Row>
            </Card.Header>

            <Card.Body className="pt-3 pt-md-4">
              {/* Profile Avatar and Basic Info */}
              <Row className="mb-4">
                <Col xs={12} className="text-center mb-3 mb-md-4">
                  <div className="user-avatar-xl mx-auto mb-3">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <h5 className="mb-2">{user.name || 'User'}</h5>
                  <Badge bg="success" className="mb-2 px-3 py-2">
                    {user.role || 'User'}
                  </Badge>
                  <div className="text-muted">
                    <small>
                      <i className="fas fa-calendar-alt me-1"></i>
                      Member since {new Date().getFullYear()}
                    </small>
                  </div>
                </Col>
              </Row>

              {/* Profile Form */}
              <Form>
                <Row>
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <i className="fas fa-user me-2"></i>
                        Full Name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter your full name"
                        size="lg"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <i className="fas fa-envelope me-2"></i>
                        Email Address
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter your email"
                        size="lg"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <i className="fas fa-phone me-2"></i>
                        Phone Number
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter your phone number"
                        size="lg"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <i className="fas fa-building me-2"></i>
                        Department
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter your department"
                        size="lg"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="fas fa-user-tag me-2"></i>
                    Role
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="role"
                    value={formData.role}
                    disabled={true}
                    placeholder="Your role"
                    size="lg"
                  />
                  <Form.Text className="text-muted">
                    Role cannot be changed. Contact administrator for role changes.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>
                    <i className="fas fa-info-circle me-2"></i>
                    Bio
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="bio"
                    value={formData.bio}
                                        onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                  />
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>

          {/* Statistics Cards */}
          <Row className="mb-3 mb-md-4">
            <Col xs={12}>
              <h5 className="mb-3">
                <i className="fas fa-chart-bar me-2"></i>
                Account Statistics
              </h5>
            </Col>
            <Col xs={6} md={3}>
              <Card className="stat-card border-0 shadow-sm h-100 text-center">
                <Card.Body className="py-3 py-md-4">
                  <i className="fas fa-project-diagram fa-2x text-primary mb-2 mb-md-3"></i>
                  <h4 className="mb-1 fw-bold">{stats.projects}</h4>
                  <small className="text-muted">Projects</small>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={6} md={3}>
              <Card className="stat-card border-0 shadow-sm h-100 text-center">
                <Card.Body className="py-3 py-md-4">
                  <i className="fas fa-tasks fa-2x text-success mb-2 mb-md-3"></i>
                  <h4 className="mb-1 fw-bold">{stats.tasks}</h4>
                  <small className="text-muted">Tasks</small>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={6} md={3}>
              <Card className="stat-card border-0 shadow-sm h-100 text-center">
                <Card.Body className="py-3 py-md-4">
                  <i className="fas fa-users fa-2x text-info mb-2 mb-md-3"></i>
                  <h4 className="mb-1 fw-bold">{stats.teams}</h4>
                  <small className="text-muted">Teams</small>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={6} md={3}>
              <Card className="stat-card border-0 shadow-sm h-100 text-center">
                <Card.Body className="py-3 py-md-4">
                  <i className="fas fa-chart-line fa-2x text-warning mb-2 mb-md-3"></i>
                  <h4 className="mb-1 fw-bold">{stats.completionRate}%</h4>
                  <small className="text-muted">Completion</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Activity Overview */}
          <Row>
            <Col xs={12} lg={6}>
              <Card className="border-0 shadow-sm mb-3 mb-lg-0">
                <Card.Header className="bg-white border-0">
                  <h6 className="mb-0">
                    <i className="fas fa-activity me-2 text-primary"></i>
                    Recent Activity
                  </h6>
                </Card.Header>
                <Card.Body>
                  <div className="activity-list">
                    <div className="activity-item d-flex align-items-center py-2 border-bottom">
                      <div className="activity-icon me-3">
                        <i className="fas fa-project-diagram text-primary"></i>
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-1 fw-medium">Created new project</p>
                        <small className="text-muted">2 hours ago</small>
                      </div>
                    </div>
                    <div className="activity-item d-flex align-items-center py-2 border-bottom">
                      <div className="activity-icon me-3">
                        <i className="fas fa-tasks text-success"></i>
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-1 fw-medium">Completed 3 tasks</p>
                        <small className="text-muted">5 hours ago</small>
                      </div>
                    </div>
                    <div className="activity-item d-flex align-items-center py-2">
                      <div className="activity-icon me-3">
                        <i className="fas fa-users text-info"></i>
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-1 fw-medium">Joined new team</p>
                        <small className="text-muted">1 day ago</small>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} lg={6}>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-0">
                  <h6 className="mb-0">
                    <i className="fas fa-chart-pie me-2 text-primary"></i>
                    Performance Overview
                  </h6>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <small className="fw-medium">Task Completion Rate</small>
                      <small className="text-muted">{stats.completionRate}%</small>
                    </div>
                    <ProgressBar 
                      now={stats.completionRate} 
                      variant="success"
                      className="mb-2"
                      style={{ height: '8px' }}
                    />
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <small className="fw-medium">Project Progress</small>
                      <small className="text-muted">65%</small>
                    </div>
                    <ProgressBar 
                      now={65} 
                      variant="info"
                      className="mb-2"
                      style={{ height: '8px' }}
                    />
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <small className="fw-medium">Team Collaboration</small>
                      <small className="text-muted">85%</small>
                    </div>
                    <ProgressBar 
                      now={85} 
                      variant="warning"
                      className="mb-2"
                      style={{ height: '8px' }}
                    />
                  </div>
                  <div>
                    <div className="d-flex justify-content-between mb-1">
                      <small className="fw-medium">Overall Performance</small>
                      <small className="text-muted">78%</small>
                    </div>
                    <ProgressBar 
                      now={78} 
                      variant="primary"
                      style={{ height: '8px' }}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Skills and Preferences */}
          <Row className="mt-3 mt-md-4">
            <Col xs={12} lg={6}>
              <Card className="border-0 shadow-sm mb-3 mb-lg-0">
                <Card.Header className="bg-white border-0">
                  <h6 className="mb-0">
                    <i className="fas fa-star me-2 text-primary"></i>
                    Skills & Expertise
                  </h6>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex flex-wrap gap-2">
                    <Badge bg="primary" className="skill-badge">Project Management</Badge>
                    <Badge bg="success" className="skill-badge">Team Leadership</Badge>
                    <Badge bg="info" className="skill-badge">Agile Methodology</Badge>
                    <Badge bg="warning" className="skill-badge">Risk Management</Badge>
                    <Badge bg="secondary" className="skill-badge">Strategic Planning</Badge>
                    <Badge bg="dark" className="skill-badge">Communication</Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} lg={6}>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-0">
                  <h6 className="mb-0">
                    <i className="fas fa-cog me-2 text-primary"></i>
                    Quick Settings
                  </h6>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="fw-medium">Email Notifications</small>
                    <Form.Check type="switch" id="email-switch" defaultChecked />
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="fw-medium">Task Reminders</small>
                    <Form.Check type="switch" id="reminder-switch" defaultChecked />
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="fw-medium">Team Updates</small>
                    <Form.Check type="switch" id="team-switch" />
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="fw-medium">Public Profile</small>
                    <Form.Check type="switch" id="public-switch" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;

