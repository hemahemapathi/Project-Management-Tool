import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { FaArrowLeft, FaChartLine, FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { getProjects, createReport } from '../../services/api';
import './createreport.css';

const CreateReport = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [reportType, setReportType] = useState('');
  const [reportData, setReportData] = useState({});
  const [milestones, setMilestones] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPageVisible, setIsPageVisible] = useState(false);

  useEffect(() => {
    fetchProjects();
    // Add animation delay
    setTimeout(() => setIsPageVisible(true), 100);
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await getProjects();
      setProjects(response.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects. Please try again.');
    }
  };

  const reportTypes = [
    {
      id: 'Progress',
      title: 'Progress Report',
      description: 'Track project completion and milestones',
      icon: '📊',
      color: 'success'
    },
    {
      id: 'BudgetUtilization',
      title: 'Budget Report',
      description: 'Monitor budget allocation and expenses',
      icon: '💰',
      color: 'info'
    },
    {
      id: 'Timeline',
      title: 'Timeline Report',
      description: 'Analyze project timeline and deadlines',
      icon: '📅',
      color: 'warning'
    },
    {
      id: 'Performance',
      title: 'Performance Report',
      description: 'Evaluate team and project performance',
      icon: '⚡',
      color: 'primary'
    }
  ];

  const handleReportTypeSelect = (type) => {
    setReportType(type);
    setReportData({});
    setMilestones([]);
    initializeReportData(type);
  };

  const initializeReportData = (type) => {
    switch (type) {
      case 'Progress':
        setReportData({
          completedTasks: '',
          totalTasks: '',
          completionPercentage: '',
          upcomingDeadlines: ''
        });
        break;
      case 'BudgetUtilization':
        setReportData({
          totalBudget: '',
          usedBudget: '',
          remainingBudget: '',
          budgetUtilization: ''
        });
        break;
      case 'Timeline':
        setReportData({
          plannedStartDate: '',
          actualStartDate: '',
          plannedEndDate: '',
          estimatedEndDate: ''
        });
        break;
      case 'Performance':
        setReportData({
          teamEfficiency: '',
          taskCompletionRate: '',
          qualityScore: '',
          clientSatisfaction: ''
        });
        break;
      default:
        setReportData({});
    }
  };

  const handleDataChange = (field, value) => {
    setReportData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addMilestone = () => {
    const newMilestone = {
      id: Date.now(),
      name: '',
      status: 'pending',
      dueDate: '',
      description: ''
    };
    setMilestones(prev => [...prev, newMilestone]);
  };

  const updateMilestone = (id, field, value) => {
    setMilestones(prev =>
      prev.map(milestone =>
        milestone.id === id ? { ...milestone, [field]: value } : milestone
      )
    );
  };

  const removeMilestone = (id) => {
    setMilestones(prev => prev.filter(milestone => milestone.id !== id));
  };

  const validateForm = () => {
    if (!selectedProjectId) {
      setError('Please select a project');
      return false;
    }
    if (!reportType) {
      setError('Please select a report type');
      return false;
    }
    
    // Check if required data fields are filled
    const requiredFields = Object.keys(reportData);
    const emptyFields = requiredFields.filter(field => !reportData[field]);
    
    if (emptyFields.length > 0) {
      setError('Please fill in all required fields');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const reportPayload = {
        projectId: selectedProjectId,
        type: reportType,
        data: {
          ...reportData,
          milestones: milestones.length > 0 ? milestones : undefined
        }
      };

      await createReport(reportPayload);
      setSuccess('Report created successfully!');
      
      // Redirect after success
      setTimeout(() => {
        navigate('/reports');
      }, 2000);

    } catch (error) {
      console.error('Error creating report:', error);
      setError(error.response?.data?.message || 'Failed to create report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/reports');
  };

  const renderReportFields = () => {
    if (!reportType) return null;

    const fields = Object.keys(reportData);
    
    return (
      <div className="report-fields-container">
        <h6 className="fields-title">Report Data</h6>
        <Row>
          {fields.map((field, index) => (
            <Col md={6} key={field} className="mb-3">
              <Form.Group>
                <Form.Label className="form-label">
                  {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Form.Label>
                <Form.Control
                  type={field.includes('Date') ? 'date' : field.includes('Percentage') || field.includes('Rate') || field.includes('Score') ? 'number' : 'text'}
                  className="form-input"
                  value={reportData[field]}
                  onChange={(e) => handleDataChange(field, e.target.value)}
                  placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                  min={field.includes('Percentage') || field.includes('Rate') || field.includes('Score') ? '0' : undefined}
                  max={field.includes('Percentage') || field.includes('Rate') || field.includes('Score') ? '100' : undefined}
                />
              </Form.Group>
            </Col>
          ))}
        </Row>

        {/* Milestones Section */}
        <div className="milestones-section mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fields-title mb-0">Project Milestones</h6>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={addMilestone}
              className="add-milestone-btn"
            >
              <FaPlus className="me-1" />
              Add Milestone
            </Button>
          </div>

          {milestones.length === 0 ? (
            <div className="empty-milestones">
              <div className="text-center text-muted">
                <FaChartLine className="empty-icon" />
                <p className="empty-text">No milestones added yet</p>
                <p className="empty-subtext">Add milestones to track project progress</p>
              </div>
            </div>
          ) : (
            <div className="milestones-grid">
              {milestones.map((milestone) => (
                <Card key={milestone.id} className="milestone-card">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="milestone-badge bg-primary">
                        Milestone #{milestones.indexOf(milestone) + 1}
                      </span>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeMilestone(milestone.id)}
                        className="remove-milestone-btn"
                      >
                        <FaTrash />
                      </Button>
                    </div>
                    
                    <Row>
                      <Col md={6} className="mb-2">
                        <Form.Group>
                          <Form.Label className="form-label-sm">Name</Form.Label>
                          <Form.Control
                            type="text"
                            size="sm"
                            className="form-input-sm"
                            value={milestone.name}
                            onChange={(e) => updateMilestone(milestone.id, 'name', e.target.value)}
                            placeholder="Milestone name"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-2">
                        <Form.Group>
                          <Form.Label className="form-label-sm">Status</Form.Label>
                          <Form.Select
                            size="sm"
                            className="form-input-sm"
                            value={milestone.status}
                            onChange={(e) => updateMilestone(milestone.id, 'status', e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="delayed">Delayed</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-2">
                        <Form.Group>
                          <Form.Label className="form-label-sm">Due Date</Form.Label>
                          <Form.Control
                            type="date"
                            size="sm"
                            className="form-input-sm"
                            value={milestone.dueDate}
                            onChange={(e) => updateMilestone(milestone.id, 'dueDate', e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-2">
                        <Form.Group>
                          <Form.Label className="form-label-sm">Description</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            size="sm"
                            className="form-input-sm"
                            value={milestone.description}
                            onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
                            placeholder="Brief description"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`create-report-page ${isPageVisible ? 'animate-fade-in-up' : ''}`}>
      <Container className="create-report-container">
        {/* Page Header */}
        <div className="page-header-section">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h1 className="page-title">Create New Report</h1>
              <p className="page-subtitle">Generate comprehensive project reports with detailed analytics</p>
            </div>
            <Button
              variant="outline-secondary"
              onClick={handleCancel}
              className="back-btn"
            >
              <FaArrowLeft className="me-2" />
              <span>Back to Reports</span>
            </Button>
          </div>
        </div>

        {/* Success/Error Alerts */}
        {success && (
          <Alert variant="success" className="custom-alert">
            <div className="d-flex align-items-center">
              <FaChartLine className="me-2" />
              {success}
            </div>
          </Alert>
        )}

        {error && (
          <Alert variant="danger" className="custom-alert">
            <div className="d-flex align-items-center">
              <FaTimes className="me-2" />
              {error}
            </div>
          </Alert>
        )}

        {/* Main Form */}
        <Card className="report-form-card">
          {/* Form Header */}
          <div className="form-header">
            <div className="header-content">
              <div className="header-icon">
                <FaChartLine />
              </div>
              <div>
                <h4 className="form-title">Report Configuration</h4>
                <p className="form-subtitle">Configure your report settings and data parameters</p>
              </div>
            </div>
          </div>

          <Form onSubmit={handleSubmit} className="report-form">
            {/* Project Selection */}
            <div className="form-section">
              <h5 className="section-title">Project Selection</h5>
              <Form.Group className="form-group">
                <Form.Label className="form-label">Select Project *</Form.Label>
                <Form.Select
                  className="form-input"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  required
                >
                  <option value="">Choose a project...</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>

            {/* Report Type Selection */}
            <div className="form-section">
              <h5 className="section-title">Report Type</h5>
              <div className="report-types-grid">
                {reportTypes.map((type) => (
                  <Card
                    key={type.id}
                    className={`report-type-card ${reportType === type.id ? 'selected' : ''}`}
                    onClick={() => handleReportTypeSelect(type.id)}
                  >
                    <Card.Body className="text-center">
                      <div className="report-type-icon">
                        {type.icon}
                      </div>
                      <h6 className="report-type-title">{type.title}</h6>
                      <p className="report-type-description">{type.description}</p>
                      {reportType === type.id && (
                        <span className="selected-badge">Selected</span>
                      )}
                                          </Card.Body>
                  </Card>
                ))}
              </div>
            </div>

            {/* Report Fields */}
            {reportType && (
              <div className="form-section">
                <h5 className="section-title">Report Data</h5>
                {renderReportFields()}
              </div>
            )}

            {/* Form Actions */}
            <div className="form-actions">
              <Button
                type="button"
                variant="outline-secondary"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="cancel-btn"
              >
                <FaTimes className="me-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || !selectedProjectId || !reportType}
                className="submit-btn"
              >
                {isSubmitting ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Creating...
                  </>
                ) : (
                  <>
                    <FaSave className="me-2" />
                    Create Report
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card>
      </Container>
    </div>
  );
};

export default CreateReport;

