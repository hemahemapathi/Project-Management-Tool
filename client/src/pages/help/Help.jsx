import React, { useState } from 'react';
import { Container, Row, Col, Card, Accordion, Form, Button, Alert, Badge } from 'react-bootstrap';
import './Help.css';

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [showAlert, setShowAlert] = useState(false);

  const faqData = [
    {
      id: 1,
      category: 'projects',
      question: 'How do I create a new project?',
      answer: 'To create a new project, navigate to the Projects page and click the "Create Project" button. Fill in the required details such as project name, description, and team members.'
    },
    {
      id: 2,
      category: 'tasks',
      question: 'How can I assign tasks to team members?',
      answer: 'When creating or editing a task, you can select team members from the assignee dropdown. Make sure the team members are part of your project team first.'
    },
    {
      id: 3,
      category: 'teams',
      question: 'How do I add members to my team?',
      answer: 'Go to the Team page, select your team, and click "Add Member". You can search for users by email or name and send them an invitation to join your team.'
    },
    {
      id: 4,
      category: 'reports',
      question: 'How do I generate project reports?',
      answer: 'Visit the Reports page where you can generate various types of reports including project progress, budget utilization, and timeline reports. Select the report type and project to generate the report.'
    },
    {
      id: 5,
      category: 'general',
      question: 'How do I change my profile information?',
      answer: 'Click on your profile avatar in the top navigation bar and select "My Profile". You can edit your name and email address from there.'
    },
    {
      id: 6,
      category: 'general',
      question: 'How do I reset my password?',
      answer: 'On the login page, click "Forgot Password" and enter your email address. You will receive instructions to reset your password via email.'
    },
    {
      id: 7,
      category: 'projects',
      question: 'Can I delete a project?',
      answer: 'Yes, project managers can delete projects from the project settings. Note that this action cannot be undone and will remove all associated tasks and data.'
    },
    {
      id: 8,
      category: 'tasks',
      question: 'How do I track task progress?',
      answer: 'Tasks have different status levels: To Do, In Progress, and Done. You can update task status by editing the task or using the quick status update feature on the task board.'
    }
  ];

  const categories = [
    { value: 'all', label: 'All Categories', icon: 'fas fa-list' },
    { value: 'projects', label: 'Projects', icon: 'fas fa-project-diagram' },
    { value: 'tasks', label: 'Tasks', icon: 'fas fa-tasks' },
    { value: 'teams', label: 'Teams', icon: 'fas fa-users' },
    { value: 'reports', label: 'Reports', icon: 'fas fa-chart-bar' },
    { value: 'general', label: 'General', icon: 'fas fa-question-circle' }
  ];

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleContactFormChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    console.log('Contact form submitted:', contactForm);
    setShowAlert(true);
    setContactForm({ name: '', email: '', subject: '', message: '' });
    setShowContactForm(false);
    setTimeout(() => setShowAlert(false), 5000);
  };

  return (
    <Container fluid className="py-3 py-md-4">
      {showAlert && (
        <Row>
          <Col xs={12} lg={10} xl={8} className="mx-auto">
            <Alert variant="success" className="mb-3 mb-md-4">
              <i className="fas fa-check-circle me-2"></i>
              <span className="small">Thank you for contacting us! We'll get back to you within 24 hours.</span>
            </Alert>
          </Col>
        </Row>
      )}

      {/* Header Section */}
      <Row className="mb-4 mb-md-5">
        <Col xs={12}>
          <div className="text-center">
            <h1 className="h3 h2-md h1-lg fw-bold mb-2 mb-md-3">
              <i className="fas fa-life-ring me-2 me-md-3 text-primary fs-4 fs-3-md fs-2-lg"></i>
              Help & Support
            </h1>
            <p className="lead-sm lead-md text-muted mb-0">
              Find answers to common questions or get in touch with our support team
            </p>
          </div>
        </Col>
      </Row>

      {/* Search and Filter Section */}
      <Row className="mb-3 mb-md-4">
        <Col xs={12} lg={10} xl={8} className="mx-auto">
          {/* Search Bar */}
          <div className="search-help mb-3 mb-md-4">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="fas fa-search text-muted small"></i>
              </span>
              <Form.Control
                size="sm"
                type="text"
                placeholder="Search for help topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-start-0"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="category-filter">
            <div className="d-flex flex-wrap gap-1 gap-md-2 justify-content-center justify-content-md-center">
              {categories.map(category => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className="category-btn flex-shrink-0"
                >
                  <i className={`${category.icon} me-1 me-md-2 small`}></i>
                  <span className="small d-none d-sm-inline">{category.label}</span>
                  <span className="small d-sm-none">{category.label.split(' ')[0]}</span>
                </Button>
              ))}
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs={12} lg={10} xl={8} className="mx-auto">
          {/* FAQ Section */}
          <Card className="border-0 shadow-sm mb-3 mb-md-4">
            <Card.Header className="bg-white border-0 py-2 py-md-3">
              <h4 className="h5 h4-md mb-0">
                <i className="fas fa-question-circle me-2 text-primary small"></i>
                <span className="small">Frequently Asked Questions</span>
                <Badge bg="primary" className="ms-2 small">{filteredFAQs.length}</Badge>
              </h4>
            </Card.Header>
            <Card.Body className="p-0">
              {filteredFAQs.length > 0 ? (
                <Accordion flush>
                  {filteredFAQs.map((faq, index) => (
                    <Accordion.Item key={faq.id} eventKey={index.toString()}>
                      <Accordion.Header>
                        <div className="d-flex align-items-center w-100 flex-wrap flex-sm-nowrap">
                          <Badge 
                            bg="light" 
                            text="dark" 
                            className="me-2 me-md-3 text-capitalize small flex-shrink-0"
                          >
                            {faq.category}
                          </Badge>
                          <span className="fw-medium small">{faq.question}</span>
                        </div>
                      </Accordion.Header>
                      <Accordion.Body className="text-muted small">
                        {faq.answer}
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-4 py-md-5">
                  <i className="fas fa-search fa-2x fa-3x-md text-muted mb-2 mb-md-3"></i>
                  <h5 className="h6 h5-md text-muted">No results found</h5>
                  <p className="text-muted small mb-0">
                    Try adjusting your search terms or category filter
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Quick Actions */}
          <Row className="g-2 g-md-3 mb-3 mb-md-4">
            <Col xs={12} md={6}>
              <Card className="border-0 shadow-sm h-100 text-center">
                <Card.Body className="py-3 py-md-4">
                  <i className="fas fa-envelope fa-2x fa-3x-md text-primary mb-2 mb-md-3"></i>
                  <h5 className="h6 h5-md">Contact Support</h5>
                  <p className="text-muted mb-2 mb-md-3 small">
                    Can't find what you're looking for? Get in touch with our support team.
                  </p>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => setShowContactForm(!showContactForm)}
                  >
                    <i className="fas fa-paper-plane me-1 me-md-2 small"></i>
                    <span className="small">Contact Us</span>
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card className="border-0 shadow-sm h-100 text-center">
                <Card.Body className="py-3 py-md-4">
                  <i className="fas fa-book fa-2x fa-3x-md text-success mb-2 mb-md-3"></i>
                  <h5 className="h6 h5-md">User Guide</h5>
                  <p className="text-muted mb-2 mb-md-3 small">
                    Comprehensive documentation and tutorials to get you started.
                  </p>
                  <Button variant="success" size="sm">
                    <i className="fas fa-external-link-alt me-1 me-md-2 small"></i>
                    <span className="small">View Guide</span>
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Contact Form */}
          {showContactForm && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-primary text-white py-2 py-md-3">
                <h5 className="h6 h5-md mb-0">
                  <i className="fas fa-envelope me-1 me-md-2 small"></i>
                  <span className="small">Contact Support</span>
                </h5>
              </Card.Header>
              <Card.Body className="p-3 p-md-4">
                <Form onSubmit={handleContactSubmit}>
                  <Row className="g-2 g-md-3">
                    <Col xs={12} md={6}>
                      <Form.Group className="mb-2 mb-md-3">
                        <Form.Label className="small fw-semibold">Name *</Form.Label>
                        <Form.Control
                          size="sm"
                          type="text"
                          name="name"
                          value={contactForm.name}
                          onChange={handleContactFormChange}
                          required
                          placeholder="Your full name"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group className="mb-2 mb-md-3">
                        <Form.Label className="small fw-semibold">Email *</Form.Label>
                        <Form.Control
                          size="sm"
                          type="email"
                          name="email"
                          value={contactForm.email}
                          onChange={handleContactFormChange}
                          required
                          placeholder="your.email@example.com"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-2 mb-md-3">
                    <Form.Label className="small fw-semibold">Subject *</Form.Label>
                    <Form.Control
                      size="sm"
                      type="text"
                      name="subject"
                      value={contactForm.subject}
                      onChange={handleContactFormChange}
                      required
                      placeholder="Brief description of your issue"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold">Message *</Form.Label>
                    <Form.Control
                      size="sm"
                      as="textarea"
                      rows={3}
                      name="message"
                      value={contactForm.message}
                      onChange={handleContactFormChange}
                      required
                      placeholder="Please describe your issue or question in detail..."
                    />
                  </Form.Group>
                  <div className="d-flex flex-column flex-sm-row gap-2">
                    <Button type="submit" variant="primary" size="sm">
                      <i className="fas fa-paper-plane me-1 me-md-2 small"></i>
                      <span className="small">Send Message</span>
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => setShowContactForm(false)}
                    >
                      <i className="fas fa-times me-1 me-md-2 small"></i>
                      <span className="small">Cancel</span>
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>

  );
};

export default Help;
