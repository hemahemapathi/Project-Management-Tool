import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { loginUser } from '../../services/auth.js';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaCheckCircle, FaRocket, FaUsers, FaShieldAlt, FaStar, FaSignInAlt } from 'react-icons/fa';
import './login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Add body class for consistent styling
    document.body.classList.add('login-body');
    
    // Check for success message from registration
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the state to prevent showing message on refresh
      window.history.replaceState({}, document.title);
    }
    
    // Trigger animations after component mounts
    setTimeout(() => setIsVisible(true), 100);
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('login-body');
    };
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general error
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    return errors;
  };

  // Handle successful login with proper user data storage and event dispatch
  const handleLoginSuccess = (userData) => {
    console.log('Login successful, storing user data:', userData); // Debug log
    
    // Store user data and token
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
    
    // Dispatch custom event to notify navbar and other components
    window.dispatchEvent(new Event('userLogin'));
    
    // Navigate to dashboard
    navigate('/home');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setLoading(true);
    try {
      const response = await loginUser(formData.email, formData.password);
      console.log('Login response:', response); // Debug log
      
      if (response && response.token) {
        // Call the success handler which will store data and navigate
        handleLoginSuccess(response);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const getDemoCredentials = () => {
    return [
      { role: 'Manager', email: 'manager@manager.com', password: 'password123' },
      { role: 'Team Member', email: 'user@example.com', password: 'password123' }
    ];
  };

  const fillDemoCredentials = (email, password) => {
    setFormData({ email, password });
  };

  return (
    <div className="login-wrapper">
      <Container fluid className="login-container">
        <Row className="min-vh-100 g-0">
          {/* Left Side - Branding */}
          <Col lg={6} className="login-brand-side d-none d-lg-flex">
            <div className={`brand-content ${isVisible ? 'animate-slide-in-left' : ''}`}>
              <div className="brand-header">
                <div className="brand-logo animate-bounce-in">
                  <div className="logo-icon">
                    <FaCheckCircle />
                  </div>
                  <h2 className="brand-title">Trek</h2>
                </div>
                <p className="brand-subtitle animate-fade-in-up">Welcome back! Sign in to continue your journey</p>
              </div>
              
              <div className="features-list">
                <div className="feature-item animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <div className="feature-icon">
                    <FaRocket />
                  </div>
                  <div className="feature-text">
                    <h6>Boost Productivity</h6>
                    <p>Streamline your workflow and get more done in less time</p>
                  </div>
                </div>
                
                <div className="feature-item animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                  <div className="feature-icon">
                    <FaUsers />
                  </div>
                  <div className="feature-text">
                    <h6>Team Collaboration</h6>
                    <p>Connect with your team and work together seamlessly</p>
                  </div>
                </div>
                
                <div className="feature-item animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                  <div className="feature-icon">
                    <FaShieldAlt />
                  </div>
                  <div className="feature-text">
                    <h6>Secure & Reliable</h6>
                    <p>Your data is protected with enterprise-grade security</p>
                  </div>
                </div>
              </div>
              
              <div className="testimonial animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="star-icon" />
                  ))}
                </div>
                <blockquote>
                  "Trek has revolutionized how we manage our projects. It's intuitive, powerful, and reliable!"
                </blockquote>
                <div className="testimonial-author">
                  <div className="author-avatar">M</div>
                  <div className="author-info">
                    <strong>Michael Chen</strong>
                    <span>Engineering Manager at InnovateTech</span>
                  </div>
                </div>
              </div>
            </div>
          </Col>
          
          {/* Right Side - Login Form */}
          <Col lg={6} className="login-form-side">
            <div className={`form-container ${isVisible ? 'animate-slide-in-right' : ''}`}>
              <div className="form-header">
                <div className="mobile-brand d-lg-none animate-bounce-in">
                  <div className="brand-logo">
                    <div className="logo-icon">
                      <FaCheckCircle />
                    </div>
                    <h2 className="brand-title">Trek</h2>
                  </div>
                </div>
                
                <h1 className="form-title animate-fade-in-up">Welcome back</h1>
                <p className="form-subtitle animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  Don't have an account? 
                  <Link to="/register" className="register-link"> Create one here</Link>
                </p>
              </div>

              {/* Success Message */}
              {successMessage && (
                <Alert variant="success" className="custom-alert success-alert animate-fade-in">
                  <div className="alert-content">
                    <FaCheckCircle className="me-2" />
                    {successMessage}
                  </div>
                </Alert>
              )}

              {/* Error Message */}
              {error && (
                <Alert variant="danger" className="custom-alert error-alert animate-shake">
                  <div className="alert-content">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                </Alert>
              )}

             

              <Form onSubmit={handleSubmit} className="login-form" noValidate>
                {/* Email */}
                <div className="form-group animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  <Form.Label className="form-label">Email Address</Form.Label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                    </div>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleChange}
                      isInvalid={!!validationErrors.email}
                      className="form-input"
                      autoComplete="email"
                      autoFocus
                    />
                    <div className="input-focus-line"></div>
                  </div>
                  {validationErrors.email && (
                    <div className="invalid-feedback d-block animate-fade-in">
                      {validationErrors.email}
                    </div>
                  )}
                </div>

                {/* Password */}
                <div className="form-group animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                  <Form.Label className="form-label">Password</Form.Label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                    </div>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      isInvalid={!!validationErrors.password}
                      className="form-input"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="password-toggle hover-scale"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    <div className="input-focus-line"></div>
                  </div>
                  {validationErrors.password && (
                    <div className="invalid-feedback d-block animate-fade-in">
                      {validationErrors.password}
                    </div>
                  )}
                </div>

                {/* Forgot Password */}
                <div className="form-options animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                  <div className="remember-me">
                    <Form.Check
                      type="checkbox"
                      id="remember-me"
                      label="Remember me"
                      className="custom-checkbox"
                    />
                  </div>
                  <Link to="#" className="forgot-password-link">
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <div className="form-group animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                  <Button 
                    type="submit" 
                    className="submit-btn hover-lift" 
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          className="me-2"
                        />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <FaSignInAlt className="me-2" />
                        Sign In
                        <FaArrowRight className="ms-2" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Register Button */}
                <div className="form-group animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
                  <Button 
                    type="button" 
                    variant="outline-primary"
                    className="register-btn hover-lift" 
                    onClick={handleRegister}
                    size="lg"
                  >
                    <FaUsers className="me-2" />
                    Create New Account
                  </Button>
                </div>

                {/* Divider */}
                <div className="divider animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                  <span className="divider-text">or continue with</span>
                </div>

                {/* Social Login */}
                <div className="social-login animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
                  <button type="button" className="social-btn google-btn hover-lift">
                    <i className="fab fa-google"></i>
                    <span>Google</span>
                  </button>
                                    <button type="button" className="social-btn microsoft-btn hover-lift">
                    <i className="fab fa-microsoft"></i>
                    <span>Microsoft</span>
                  </button>
                  <button type="button" className="social-btn github-btn hover-lift">
                    <i className="fab fa-github"></i>
                    <span>GitHub</span>
                  </button>
                </div>
              </Form>

              {/* Footer */}
              <div className="form-footer animate-fade-in-up" style={{ animationDelay: '1s' }}>
                <p className="footer-text">
                  By signing in, you agree to our{' '}
                  <Link to="#" className="footer-link">Terms of Service</Link>{' '}
                  and{' '}
                  <Link to="#" className="footer-link">Privacy Policy</Link>
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;

                  
                  
