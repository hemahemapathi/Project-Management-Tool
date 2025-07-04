import React, { useState, useEffect } from 'react';
import { 
  Navbar as BootstrapNavbar, 
  Container, 
  Dropdown, 
  Badge, 
  Button, 
  Offcanvas,
  Form,
  ListGroup
} from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProjects, getTasks } from '../../services/api';
import './navbar.css';

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [allProjects, setAllProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  
  // Mobile states
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileNotifications, setShowMobileNotifications] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [mobileSearchResults, setMobileSearchResults] = useState([]);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Function to get user data from localStorage
  const getUserFromStorage = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log('User data from storage:', parsedUser); // Debug log
        
        // Handle different user data structures
        if (parsedUser.user) {
          return parsedUser.user; // If user data is nested under 'user' key
        } else if (parsedUser.name || parsedUser.email) {
          return parsedUser; // If user data is at root level
        }
      }
      return null;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      return null;
    }
  };

  // Function to update user state
  const updateUserState = () => {
    const userData = getUserFromStorage();
    console.log('Updating user state with:', userData); // Debug log
    setUser(userData);
  };

  useEffect(() => {
    // Initial load
    updateUserState();
    
    // Fetch real notifications and data for search
    fetchNotifications();
    fetchSearchData();

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        updateUserState();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Listen for custom events (when user logs in/out in same tab)
    const handleUserChange = () => {
      updateUserState();
    };

    window.addEventListener('userLogin', handleUserChange);
    window.addEventListener('userLogout', handleUserChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleUserChange);
      window.removeEventListener('userLogout', handleUserChange);
    };
  }, []);

  // Also update user when location changes (after login redirect)
  useEffect(() => {
    updateUserState();
  }, [location.pathname]);

  const fetchNotifications = async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.allSettled([
        getProjects(),
        getTasks()
      ]);

      const notifications = [];
      
      if (projectsRes.status === 'fulfilled' && projectsRes.value.data) {
        const recentProjects = projectsRes.value.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3);
        
        recentProjects.forEach(project => {
          notifications.push({
            id: `project-${project._id}`,
            type: 'project',
            icon: 'fas fa-project-diagram',
            iconColor: 'text-primary',
            title: `Project "${project.name}" created`,
            time: getTimeAgo(project.createdAt),
            data: project
          });
        });
      }

      if (tasksRes.status === 'fulfilled' && tasksRes.value.data) {
        const recentTasks = tasksRes.value.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3);
        
        recentTasks.forEach(task => {
          notifications.push({
            id: `task-${task._id}`,
            type: 'task',
            icon: 'fas fa-tasks',
            iconColor: task.status === 'Done' ? 'text-success' : 'text-warning',
            title: `Task "${task.title || task.name}" ${task.status === 'Done' ? 'completed' : 'updated'}`,
            time: getTimeAgo(task.updatedAt || task.createdAt),
            data: task
          });
        });
      }

      const sortedNotifications = notifications
        .sort((a, b) => new Date(b.data.createdAt || b.data.updatedAt) - new Date(a.data.createdAt || a.data.updatedAt))
        .slice(0, 5);

      setNotifications(sortedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([
        {
          id: 'default-1',
          type: 'system',
          icon: 'fas fa-info-circle',
          iconColor: 'text-info',
          title: 'Welcome to ProjectHub',
          time: 'Just now',
          data: {}
        }
      ]);
    }
  };

  const fetchSearchData = async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.allSettled([
        getProjects(),
        getTasks()
      ]);

      if (projectsRes.status === 'fulfilled' && projectsRes.value.data) {
        setAllProjects(projectsRes.value.data);
      }

      if (tasksRes.status === 'fulfilled' && tasksRes.value.data) {
        setAllTasks(tasksRes.value.data);
      }
    } catch (error) {
      console.error('Error fetching search data:', error);
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    performSearch(query, setSearchResults, setShowSearchResults, setIsSearching);
  };

  const handleMobileSearch = (query) => {
    setMobileSearchQuery(query);
    performSearch(query, setMobileSearchResults, () => {}, () => {});
  };

  const performSearch = (query, setResults, setShowResults, setSearching) => {
    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setSearching && setSearching(true);
    
    setTimeout(() => {
      const results = [];
      const searchTerm = query.toLowerCase();

      allProjects.forEach(project => {
        if (project.name?.toLowerCase().includes(searchTerm) || 
            project.description?.toLowerCase().includes(searchTerm)) {
          results.push({
            id: project._id,
            type: 'project',
            title: project.name,
            subtitle: project.description || 'No description',
            icon: 'fas fa-project-diagram',
            iconColor: 'text-primary',
            onClick: () => navigate('/projects')
          });
        }
      });

      allTasks.forEach(task => {
        if (task.title?.toLowerCase().includes(searchTerm) || 
            task.name?.toLowerCase().includes(searchTerm) ||
            task.description?.toLowerCase().includes(searchTerm)) {
          results.push({
            id: task._id,
            type: 'task',
            title: task.title || task.name,
            subtitle: task.description || `Status: ${task.status || 'Unknown'}`,
            icon: 'fas fa-tasks',
            iconColor: task.status === 'Done' ? 'text-success' : 'text-warning',
            onClick: () => navigate('/tasks')
          });
        }
      });

      setResults(results.slice(0, 8));
      setShowResults && setShowResults(true);
      setSearching && setSearching(false);
    }, 300);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    
    // Dispatch custom event for logout
    window.dispatchEvent(new Event('userLogout'));
    
    navigate('/');
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/home':
        return 'Dashboard';
      case '/projects':
        return 'Projects';
      case '/tasks':
        return 'Tasks';
      case '/team':
        return 'Team';
      case '/reports':
        return 'Reports';
      default:
        return 'Dashboard';
    }
  };

  const handleTitleClick = () => {
    navigate('/home');
  };

  const handleSearchResultClick = (result) => {
    result.onClick();
    setShowSearchResults(false);
    setSearchQuery('');
    setShowMobileSearch(false);
    setMobileSearchQuery('');
  };

  const handleNotificationClick = (notification) => {
    if (notification.type === 'project') {
      navigate('/projects');
    } else if (notification.type === 'task') {
      navigate('/tasks');
    }
    setShowMobileNotifications(false);
  };

  const handleMobileSearchShow = () => {
    setShowMobileSearch(true);
  };

  const handleMobileSearchHide = () => {
    setShowMobileSearch(false);
    setMobileSearchQuery('');
    setMobileSearchResults([]);
  };

  const handleMobileNotificationsShow = () => {
    setShowMobileNotifications(true);
  };

  const handleMobileNotificationsHide = () => {
    setShowMobileNotifications(false);
  };

  // Helper functions to get user display data
  const getUserName = () => {
    if (!user) return 'User';
    return user.name || user.username || 'User';
  };

  const getUserEmail = () => {
    if (!user) return 'user@example.com';
    return user.email || 'user@example.com';
  };

  const getUserRole = () => {
    if (!user) return 'User';
    return user.role || 'User';
  };

  const getUserInitial = () => {
    const name = getUserName();
    return name.charAt(0).toUpperCase();
  };

  console.log('Current user state:', user); // Debug log

  return (
    <>
      <BootstrapNavbar expand="lg" className="custom-navbar" fixed="top">
        <Container fluid className="navbar-container">
          {/* Left Section - Sidebar Toggle & Brand */}
          <div className="navbar-left">
            <Button
              variant="outline-light"
              className="sidebar-toggle"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </Button>
            
            <BootstrapNavbar.Brand 
              className="brand-text" 
              onClick={handleTitleClick} 
              style={{ cursor: 'pointer' }}
              title="ProjectHub"
            >
              <i className="fas fa-project-diagram brand-icon"></i>
              <span className="brand-name">Trek</span>
            </BootstrapNavbar.Brand>
          </div>

          {/* Right Section - Search, Notifications, Profile */}
          <div className="navbar-right">
            {/* Desktop Search Bar */}
            <div className="search-container d-none d-lg-block">
              <div className="search-input-group">
                <i className="fas fa-search search-icon"></i>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search projects, tasks..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => searchQuery && setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                />
                {isSearching && (
                  <div className="search-loading">
                    <i className="fas fa-spinner fa-spin"></i>
                  </div>
                )}
              </div>
              
              {/* Desktop Search Results Dropdown */}
              {showSearchResults && (
                <div className="search-results-dropdown">
                  {searchResults.length > 0 ? (
                    <>
                      <div className="search-results-header">
                        <small className="text-muted">Search Results</small>
                      </div>
                      {searchResults.map((result) => (
                        <div
                          key={result.id}
                          className="search-result-item"
                          onClick={() => handleSearchResultClick(result)}
                        >
                          <i className={`${result.icon} ${result.iconColor} me-2`}></i>
                          <div className="search-result-content">
                            <div className="search-result-title">{result.title}</div>
                            <small className="search-result-subtitle text-muted">
                              {result.subtitle}
                            </small>
                          </div>
                          <Badge bg="light" text="dark" className="ms-2">
                            {result.type}
                          </Badge>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="search-no-results">
                      <i className="fas fa-search text-muted me-2"></i>
                      <span className="text-muted">No results found for "{searchQuery}"</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Search Button */}
            <Button
              variant="outline-light"
              className="mobile-action-btn d-lg-none"
                            onClick={handleMobileSearchShow}
              aria-label="Search"
            >
              <i className="fas fa-search"></i>
            </Button>

            {/* Notifications */}
            <div className="d-none d-md-block">
              <Dropdown align="end">
                <Dropdown.Toggle variant="outline-light" className="notification-btn">
                  <i className="fas fa-bell"></i>
                  {notifications.length > 0 && (
                    <Badge bg="danger" className="notification-badge">
                      {notifications.length}
                    </Badge>
                  )}
                </Dropdown.Toggle>

                <Dropdown.Menu className="notification-dropdown">
                  <Dropdown.Header>
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Notifications</span>
                      <Badge bg="primary" className="ms-2">{notifications.length}</Badge>
                    </div>
                  </Dropdown.Header>
                  
                  {notifications.length > 0 ? (
                    <>
                      {notifications.map((notification) => (
                        <Dropdown.Item
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="notification-item">
                            <i className={`${notification.icon} ${notification.iconColor} me-2`}></i>
                            <div className="notification-content">
                              <div className="notification-title">{notification.title}</div>
                              <small className="text-muted">{notification.time}</small>
                            </div>
                          </div>
                        </Dropdown.Item>
                      ))}
                      <Dropdown.Divider />
                      <Dropdown.Item className="text-center" onClick={() => navigate('/notifications')}>
                        <small>View all notifications</small>
                      </Dropdown.Item>
                    </>
                  ) : (
                    <div className="notification-empty">
                      <div className="text-center py-3">
                        <i className="fas fa-bell-slash text-muted fa-2x mb-2"></i>
                        <p className="text-muted mb-0">No notifications yet</p>
                      </div>
                    </div>
                  )}
                </Dropdown.Menu>
              </Dropdown>
            </div>

            {/* Mobile Notifications Button */}
            <Button
              variant="outline-light"
              className="mobile-action-btn d-md-none position-relative"
              onClick={handleMobileNotificationsShow}
              aria-label="Notifications"
            >
              <i className="fas fa-bell"></i>
             
            </Button>

            {/* User Profile */}
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-light" className="profile-btn">
                <div className="user-avatar">
                  {getUserInitial()}
                </div>
                <span className="user-name d-none d-md-inline">
                  {getUserName()}
                </span>
              </Dropdown.Toggle>

              <Dropdown.Menu className="profile-dropdown">
                <Dropdown.Header>
                  <div className="user-info">
                    <div className="user-avatar-large">
                      {getUserInitial()}
                    </div>
                    <div className="user-details">
                      <div className="user-name-large">{getUserName()}</div>
                      <small className="user-email text-muted">{getUserEmail()}</small>
                      <div className="user-role-container">
                        <Badge bg="success" className="user-role-badge">
                          {getUserRole()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Dropdown.Header>
                <Dropdown.Divider />
                <Dropdown.Item onClick={() => navigate('/profile')}>
                  <i className="fas fa-user me-2"></i>My Profile
                </Dropdown.Item>
                <Dropdown.Item onClick={() => navigate('/help')}>
                  <i className="fas fa-question-circle me-2"></i>Help & Support
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="text-danger">
                  <i className="fas fa-sign-out-alt me-2"></i>Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Container>
      </BootstrapNavbar>

      {/* Mobile Search Offcanvas */}
      <Offcanvas 
        show={showMobileSearch} 
        onHide={handleMobileSearchHide} 
        placement="top"
        className="mobile-search-offcanvas"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <i className="fas fa-search me-2"></i>
            Search
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Search projects, tasks..."
              value={mobileSearchQuery}
              onChange={(e) => handleMobileSearch(e.target.value)}
              className="mobile-search-input"
              autoFocus
            />
          </Form.Group>
          
          <div className="mobile-search-results">
            {mobileSearchResults.length > 0 ? (
              <ListGroup variant="flush">
                {mobileSearchResults.map((result) => (
                  <ListGroup.Item
                    key={result.id}
                    action
                    onClick={() => handleSearchResultClick(result)}
                    className="mobile-search-result-item"
                  >
                    <div className="d-flex align-items-center">
                      <i className={`${result.icon} ${result.iconColor} me-3`}></i>
                      <div className="search-result-content">
                        <div className="search-result-title">{result.title}</div>
                        <small className="search-result-subtitle text-muted">{result.subtitle}</small>
                      </div>
                      <Badge bg="light" text="dark" className="ms-2">
                        {result.type}
                      </Badge>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : mobileSearchQuery ? (
              <div className="mobile-empty-state">
                <i className="fas fa-search fa-2x text-muted mb-3"></i>
                <p className="text-muted">No results found for "{mobileSearchQuery}"</p>
              </div>
            ) : (
              <div className="mobile-empty-state">
                <i className="fas fa-search fa-2x text-muted mb-3"></i>
                <p className="text-muted">Start typing to search projects and tasks</p>
              </div>
            )}
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Mobile Notifications Offcanvas */}
      <Offcanvas 
        show={showMobileNotifications} 
        onHide={handleMobileNotificationsHide} 
        placement="end"
        className="mobile-notifications-offcanvas"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <i className="fas fa-bell me-2"></i>
            Notifications
            {notifications.length > 0 && (
              <Badge bg="primary" className="ms-2">
                {notifications.length}
              </Badge>
            )}
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          {notifications.length > 0 ? (
            <div className="mobile-notification-list">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="mobile-notification-item"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="d-flex align-items-start">
                    <i className={`${notification.icon} ${notification.iconColor} me-3 mt-1`}></i>
                    <div className="notification-content">
                      <div className="notification-title">{notification.title}</div>
                      <small className="text-muted">{notification.time}</small>
                    </div>
                  </div>
                </div>
              ))}
              <div className="mobile-notification-footer">
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  className="w-100"
                  onClick={() => {
                    navigate('/notifications');
                    handleMobileNotificationsHide();
                  }}
                >
                  View All Notifications
                </Button>
              </div>
            </div>
          ) : (
            <div className="mobile-empty-state">
              <i className="fas fa-bell-slash fa-2x text-muted mb-3"></i>
              <p className="text-muted">No notifications yet</p>
              <small className="text-muted">You'll see notifications here when you have updates</small>
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Navbar;

              
