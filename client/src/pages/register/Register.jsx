import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../services/auth.js';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaUser, FaEnvelope,FaUserTie, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaCheckCircle, FaRocket, FaUsers, FaShieldAlt, FaStar, FaUserPlus, FaBuilding } from 'react-icons/fa';
import './register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'team_member'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Add body class for consistent styling
    document.body.classList.add('register-body');
    
    // Trigger animations after component mounts
    setTimeout(() => setIsVisible(true), 100);
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('register-body');
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Calculate password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
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

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const getPasswordStrengthText = (strength) => {
    if (strength === 0) return '';
    if (strength <= 25) return 'Weak';
    if (strength <= 50) return 'Fair';
    if (strength <= 75) return 'Good';
    return 'Strong';
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength <= 25) return '#dc3545';
    if (strength <= 50) return '#fd7e14';
    if (strength <= 75) return '#ffc107';
    return '#198754';
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
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
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.role) {
      errors.role = 'Please select a role';
    }
    
    return errors;
  };

  // Handle successful registration with proper user data storage and event dispatch
  const handleRegisterSuccess = (userData) => {
    console.log('Registration successful, storing user data:', userData); // Debug log
    
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
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setLoading(true);
    try {
      const response = await registerUser(
        formData.name,
        formData.email,
        formData.password,
        formData.role
      );
      console.log('Registration response:', response); // Debug log
      
      if (response && response.token) {
        // Call the success handler which will store data and navigate
        handleRegisterSuccess(response);
      } else {
        // If no token, redirect to login with success message
        navigate('/login', { 
          state: { 
            message: 'Registration successful! Please sign in with your credentials.' 
          } 
        });
      }
    } catch (error) {
      console.error('Registration failed:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const getRoleInfo = () => {
    return [
      {
        value: 'team_member',
        label: 'Team Member',
        description: 'Join projects, manage tasks, collaborate with team',
        icon: <FaUsers />,
        domains: 'Any email domain'
      },
      {
        value: 'manager',
        label: 'Manager',
        description: 'Create projects, manage teams, full access',
        icon: <FaBuilding />,
        domains: '@manager.com, @admin.com'
      }
    ];
  };

  return (
    <div className="register-wrapper">
      <Container fluid className="register-container">
        <Row className="min-vh-100 g-0">
          {/* Left Side - Branding */}
          <Col lg={6} className="register-brand-side d-none d-lg-flex">
            <div className={`brand-content ${isVisible ? 'animate-slide-in-left' : ''}`}>
              <div className="brand-header">
                <div className="brand-logo animate-bounce-in">
                  <div className="logo-icon">
                    <FaCheckCircle />
                  </div>
                  <h2 className="brand-title">Trek</h2>
                </div>
                <p className="brand-subtitle animate-fade-in-up">Join thousands of teams already using ProjectPro</p>
              </div>
              
              <div className="features-list">
                <div className="feature-item animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <div className="feature-icon">
                    <FaRocket />
                  </div>
                  <div className="feature-text">
                    <h6>Advanced Project Management</h6>
                    <p>Organize tasks, set deadlines, and track progress with powerful tools</p>
                  </div>
                </div>
                
                <div className="feature-item animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                  <div className="feature-icon">
                    <FaUsers />
                  </div>
                  <div className="feature-text">
                    <h6>Real-time Collaboration</h6>
                    <p>Work together seamlessly with your team in real-time</p>
                  </div>
                </div>
                
                <div className="feature-item animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                  <div className="feature-icon">
                    <FaShieldAlt />
                  </div>
                  <div className="feature-text">
                    <h6>Enterprise Security</h6>
                    <p>Your data is protected with bank-level security measures</p>
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
                  "Trek has transformed how our team collaborates. We're 40% more productive and never miss deadlines!"
                </blockquote>
                <div className="testimonial-author">
                  <div className="author-avatar">S</div>
                  <div className="author-info">
                    <strong>Sarah Johnson</strong>
                    <span>Product Manager at TechCorp</span>
                  </div>
                </div>
              </div>
            </div>
          </Col>
          
          {/* Right Side - Registration Form */}
          <Col lg={6} className="register-form-side">
            <div className={`form-container ${isVisible ? 'animate-slide-in-right' : ''}`}>
              <div className="form-header">
                <div className="mobile-brand d-lg-none animate-bounce-in">
                  <div className="brand-logo">
                    <div className="logo-icon">
                    </div>
                    <h2 className="brand-title">Trek</h2>
                  </div>
                </div>
                
                <h1 className="form-title animate-fade-in-up">Create your account</h1>
                <p className="form-subtitle animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  Already have an account? 
                  <Link to="/login" className="login-link"> Sign in here</Link>
                </p>
              </div>

              {error && (
                <Alert variant="danger" className="custom-alert animate-shake">
                  <div className="alert-content">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                </Alert>
              )}

              <Form onSubmit={handleSubmit} className="register-form" noValidate>
                {/* Full Name */}
                <div className="form-group animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <Form.Label className="form-label">Full Name</Form.Label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                    </div>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      isInvalid={!!validationErrors.name}
                      className="form-input"
                      autoComplete="name"
                      autoFocus
                    />
                    <div className="input-focus-line"></div>
                  </div>
                  {validationErrors.name && (
                    <div className="invalid-feedback d-block animate-fade-in">
                      {validationErrors.name}
                    </div>
                  )}
                </div>

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
                    />
                    <div className="input-focus-line"></div>
                  </div>
                  {validationErrors.email && (
                    <div className="invalid-feedback d-block animate-fade-in">
                      {validationErrors.email}
                    </div>
                  )}
                </div>

                {/* Role Selection */}
                <div className="form-group animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                  <Form.Label className="form-label">Select Your Role</Form.Label>
                  <div className="role-selection">
                    <div 
                      className={`role-option ${formData.role === 'manager' ? 'selected' : ''} hover-lift`}
                      onClick={() => handleChange({ target: { name: 'role', value: 'manager' } })}
                    >
                      <div className="role-header">
                        <div className="role-icon manager">
                          <FaUserTie />
                        </div>
                        <div className="role-info">
                          <h6>Manager</h6>
                        </div>
                        <div className="role-radio">
                          <Form.Check
                            type="radio"
                            name="role"
                            value="manager"
                            checked={formData.role === 'manager'}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <p className="role-description">
                        Create and manage projects, assign tasks, and oversee team progress
                      </p>
                    </div>
                    
                    <div 
                      className={`role-option ${formData.role === 'team_member' ? 'selected' : ''} hover-lift`}
                      onClick={() => handleChange({ target: { name: 'role', value: 'team_member' } })}
                    >
                      <div className="role-header">
                        <div className="role-icon team-member">
                          <FaUsers />
                        </div>
                        <div className="role-info">
                          <h6>Team Member</h6>
                        </div>
                        <div className="role-radio">
                          <Form.Check
                            type="radio"
                            name="role"
                            value="team_member"
                            checked={formData.role === 'team_member'}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <p className="role-description">
                        Collaborate on projects, complete assigned tasks, and track your progress
                      </p>
                    </div>
                  </div>
                  {validationErrors.role && (
                    <div className="invalid-feedback d-block animate-fade-in">
                      {validationErrors.role}
                    </div>
                  )}
                </div>

                {/* Password */}
                <div className="form-group animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                  <Form.Label className="form-label">Password</Form.Label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                    </div>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleChange}
                      isInvalid={!!validationErrors.password}
                      className="form-input"
                      autoComplete="new-password"
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

                {/* Confirm Password */}
                <div className="form-group animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                  <Form.Label className="form-label">Confirm Password</Form.Label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                    </div>
                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      isInvalid={!!validationErrors.confirmPassword}
                      className="form-input"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle hover-scale"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    <div className="input-focus-line"></div>
                  </div>
                  {validationErrors.confirmPassword && (
                    <div className="invalid-feedback d-block animate-fade-in">
                      {validationErrors.confirmPassword}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="form-group animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
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
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <FaArrowRight className="ms-2" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Terms and Privacy */}
                <div className="form-footer animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                  <p className="terms-text">
                    By creating an account, you agree to our{' '}
                    <a href="#" className="terms-link">Terms of Service</a>{' '}
                    and{' '}
                    <a href="#" className="terms-link">Privacy Policy</a>
                  </p>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;

