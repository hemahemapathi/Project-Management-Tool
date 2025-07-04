import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Container, Row, Col, Card } from 'react-bootstrap';
import { FaRocket, FaTasks, FaUsers, FaChartLine, FaArrowRight, FaPlay, FaCheck, FaStar } from 'react-icons/fa';
import './landingpage.css';

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <FaTasks />,
      title: "Smart Task Management",
      description: "Organize, prioritize, and track tasks with intelligent automation"
    },
    {
      icon: <FaUsers />,
      title: "Team Collaboration",
      description: "Real-time collaboration with seamless communication tools"
    },
    {
      icon: <FaChartLine />,
      title: "Advanced Analytics",
      description: "Powerful insights and reporting to drive better decisions"
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "50K+", label: "Projects Completed" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Project Manager",
      company: "TechCorp",
      rating: 5,
      text: "ProjectHub transformed how our team collaborates. Productivity increased by 40%!"
    },
    {
      name: "Mike Chen",
      role: "Team Lead",
      company: "StartupXYZ",
      rating: 5,
      text: "The best project management tool we've ever used. Simple yet powerful."
    }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center min-vh-100">
            <Col lg={6} className="hero-content">
              <div className={`hero-text ${isVisible ? 'animate-in' : ''}`}>
                <div className="hero-badge">
                  <FaRocket className="me-2" />
                  <span>New: AI-Powered Project Insights</span>
                </div>
                <h1 className="hero-title">
                  Manage Projects Like a 
                  <span className="gradient-text"> Pro</span>
                </h1>
                <p className="hero-description">
                  Streamline your workflow, boost team productivity, and deliver projects 
                  on time with our intelligent project management platform.
                </p>
                <div className="hero-actions">
                  <Button 
                    size="lg" 
                    className="btn-primary-custom me-3"
                    onClick={() => navigate('/register')}
                  >
                    Get Started Free
                    <FaArrowRight className="ms-2" />
                  </Button>
                
                </div>
                <div className="hero-stats">
                  <div className="stat-item">
                    <FaCheck className="check-icon" />
                    <span>No credit card required</span>
                  </div>
                  <div className="stat-item">
                    <FaCheck className="check-icon" />
                    <span>14-day free trial</span>
                  </div>
                </div>
              </div>
            </Col>
            <Col lg={6} className="hero-visual">
              <div className={`hero-image ${isVisible ? 'animate-in-delay' : ''}`}>
                <div className="dashboard-mockup">
                  <div className="mockup-header">
                    <div className="mockup-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                  <div className="mockup-content">
                    <div className="mockup-sidebar"></div>
                    <div className="mockup-main">
                      <div className="mockup-cards">
                        <div className="mockup-card"></div>
                        <div className="mockup-card"></div>
                        <div className="mockup-card"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <Container>
          <Row>
            {stats.map((stat, index) => (
              <Col key={index} xs={6} lg={3} className="text-center">
                <div className="stat-card">
                  <h3 className="stat-number">{stat.number}</h3>
                  <p className="stat-label">{stat.label}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center mb-5">
              
              <p className="section-description">
                Powerful features designed to help teams collaborate better and deliver results faster.
              </p>
            </Col>
          </Row>
          <Row>
            {features.map((feature, index) => (
              <Col key={index} md={6} lg={4} className="mb-4">
                <Card className="feature-card h-100">
                  <Card.Body className="text-center">
                    <div className="feature-icon">
                      {feature.icon}
                    </div>
                    <h4 className="feature-title">{feature.title}</h4>
                    <p className="feature-description">{feature.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center mb-5">
              <h2 className="section-title text-white">
                Trusted by teams worldwide
              </h2>
            </Col>
          </Row>
          <Row>
            {testimonials.map((testimonial, index) => (
              <Col key={index} md={6} className="mb-4">
                <Card className="testimonial-card">
                  <Card.Body>
                    <div className="testimonial-rating mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <FaStar key={i} className="star-icon" />
                      ))}
                    </div>
                    <p className="testimonial-text">"{testimonial.text}"</p>
                    <div className="testimonial-author">
                      <div className="author-avatar">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div className="author-info">
                        <h6 className="author-name">{testimonial.name}</h6>
                        <p className="author-role">{testimonial.role} at {testimonial.company}</p>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center">
              <h2 className="cta-title">
                Ready to transform your project management?
              </h2>
              <p className="cta-description">
                Join thousands of teams already using ProjectHub to deliver better results.
              </p>
              <div className="cta-actions">
                <Button 
                  size="lg" 
                  className="btn-primary-custom me-3"
                  onClick={() => navigate('/register')}
                >
                  Start Free Trial
                  <FaArrowRight className="ms-2" />
                </Button>
                <Button 
                  variant="outline-primary" 
                  size="lg"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <Container>
          <Row>
            <Col className="text-center">
              <p className="footer-text">
                © 2024 Trek. All rights reserved.
              </p>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default LandingPage;
