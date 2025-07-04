import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Badge, Button } from 'react-bootstrap';
import { getProjects, getTasks, getTeams, getReports } from '../../services/api';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { 
  FaProjectDiagram, 
  FaTasks, 
  FaUsers, 
  FaChartBar, 
  FaClock, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt,
  FaBell,
  FaEye,
  FaPlus
} from 'react-icons/fa';
import './home.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Home = () => {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    projects: [],
    tasks: [],
    teams: [],
    reports: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('7days');

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser.user || parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Fetch dashboard data
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [projectsRes, tasksRes, teamsRes, reportsRes] = await Promise.allSettled([
        getProjects(),
        getTasks(),
        getTeams(),
        getReports()
      ]);

      const newData = {
        projects: projectsRes.status === 'fulfilled' ? projectsRes.value.data : [],
        tasks: tasksRes.status === 'fulfilled' ? tasksRes.value.data : [],
        teams: teamsRes.status === 'fulfilled' ? teamsRes.value.data : [],
        reports: reportsRes.status === 'fulfilled' ? reportsRes.value.data : []
      };

      setDashboardData(newData);
      setError('');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    const { projects, tasks, teams, reports } = dashboardData;
    
    return {
      totalProjects: projects.length,
      totalTasks: tasks.length,
      totalTeams: teams.length,
      totalReports: reports.length,
      completedTasks: tasks.filter(task => task.status === 'Done' || task.status === 'Completed').length,
      inProgressTasks: tasks.filter(task => task.status === 'In Progress' || task.status === 'In-Progress').length,
      pendingTasks: tasks.filter(task => task.status === 'To Do' || task.status === 'Not Started').length,
      completedProjects: projects.filter(project => project.status === 'Completed').length,
      inProgressProjects: projects.filter(project => project.status === 'In-Progress').length,
      overdueTasks: tasks.filter(task => {
        if (!task.dueDate) return false;
        return new Date(task.dueDate) < new Date() && task.status !== 'Done' && task.status !== 'Completed';
      }).length
    };
  };

  const stats = getStats();

  // Enhanced chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          color: '#64748b',
          font: {
            size: 12,
            family: 'Inter, sans-serif'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(0,0,0,0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11
          }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          color: '#64748b',
          font: {
            size: 11,
            family: 'Inter, sans-serif'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        cornerRadius: 8
      }
    },
    cutout: '65%'
  };

  const getTaskStatusChartData = () => {
    return {
      labels: ['Completed', 'In Progress', 'Pending', 'Overdue'],
      datasets: [
        {
          label: 'Tasks',
          data: [stats.completedTasks, stats.inProgressTasks, stats.pendingTasks, stats.overdueTasks],
          backgroundColor: [
            '#10b981',
            '#3b82f6',
            '#f59e0b',
            '#ef4444'
          ],
          borderColor: [
            '#059669',
            '#2563eb',
            '#d97706',
            '#dc2626'
          ],
          borderWidth: 2,
          hoverOffset: 4
        }
      ]
    };
  };

  const getProjectStatusChartData = () => {
    return {
      labels: ['Completed', 'In Progress', 'Not Started'],
      datasets: [
        {
          label: 'Projects',
          data: [
            stats.completedProjects,
            stats.inProgressProjects,
            stats.totalProjects - stats.completedProjects - stats.inProgressProjects
          ],
          backgroundColor: [
            '#8b5cf6',
            '#06b6d4',
            '#94a3b8'
          ],
          borderColor: [
            '#7c3aed',
            '#0891b2',
            '#64748b'
          ],
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false
        }
      ]
    };
  };

  // Updated activity timeline data with working time range functionality
  const getActivityTimelineData = () => {
    const getDaysArray = (days) => {
      return Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        return {
          label: days <= 7 ? date.toLocaleDateString('en-US', { weekday: 'short' }) : 
                 days <= 30 ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) :
                 date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          date: date
        };
      });
    };

    const generateMockData = (days, baseValue = 5) => {
      return Array.from({ length: days }, () => {
        return Math.floor(Math.random() * baseValue) + 1;
      });
    };

    let daysCount;
    let labels;
    let tasksData;
    let projectsData;

    switch (selectedTimeRange) {
      case '7days':
        daysCount = 7;
        labels = getDaysArray(7).map(d => d.label);
        tasksData = generateMockData(7, 8);
        projectsData = generateMockData(7, 4);
        break;
      case '30days':
        daysCount = 30;
        labels = getDaysArray(30).map(d => d.label);
        tasksData = generateMockData(30, 12);
        projectsData = generateMockData(30, 6);
        break;
      case '90days':
        daysCount = 90;
        labels = getDaysArray(90).map(d => d.label);
        tasksData = generateMockData(90, 15);
        projectsData = generateMockData(90, 8);
        break;
      default:
        daysCount = 7;
        labels = getDaysArray(7).map(d => d.label);
        tasksData = generateMockData(7, 8);
        projectsData = generateMockData(7, 4);
    }

    return {
      labels: labels,
      datasets: [
        {
          label: 'Tasks Completed',
          data: tasksData,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          fill: true
        },
        {
          label: 'Projects Updated',
          data: projectsData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          fill: true
        }
      ]
    };
  };

  const getRecentProjects = () => {
    return dashboardData.projects
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  };

  const getRecentActivity = () => {
    const activities = [];
    
    dashboardData.projects.slice(0, 3).forEach(project => {
      activities.push({
        id: `project-${project._id}`,
        type: 'project',
        icon: 'fas fa-project-diagram',
        iconColor: 'text-primary',
        message: `Project "${project.name}" was created`,
        time: getTimeAgo(project.createdAt)
      });
    });

    dashboardData.tasks.slice(0, 3).forEach(task => {
      activities.push({
        id: `task-${task._id}`,
        type: 'task',
        icon: 'fas fa-tasks',
        iconColor: task.status === 'Done' ? 'text-success' : 'text-warning',
        message: `Task "${task.title || task.name}" was ${task.status === 'Done' ? 'completed' : 'updated'}`,
        time: getTimeAgo(task.updatedAt || task.createdAt)
      });
    });

    return activities
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);
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

  const getCompletionRate = () => {
    if (stats.totalTasks === 0) return 0;
    return Math.round((stats.completedTasks / stats.totalTasks) * 100);
  };

  const getProductivityTrend = () => {
    // Mock data - in real app, calculate from historical data
    const lastWeekCompleted = 15;
    const thisWeekCompleted = stats.completedTasks;
    const trend = thisWeekCompleted - lastWeekCompleted;
    return { value: Math.abs(trend), isPositive: trend >= 0 };
  };

  // Handle time range change
  const handleTimeRangeChange = (range) => {
    setSelectedTimeRange(range);
  };

  if (loading) {
    return (
      <div className="modern-loading-container">
        <div className="loading-content">
          <div className="loading-spinner-modern">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <h4 className="loading-title">Loading Dashboard</h4>
          <p className="loading-subtitle">Preparing your workspace...</p>
        </div>
      </div>
    );
  }

  const productivity = getProductivityTrend();

  return (
    <div className="modern-dashboard">
      {/* Header Section */}
      <div className="dashboard-header-modern">
        <Container fluid>
          <div className="header-content-modern">
            <div className="welcome-section">
              <h1 className="welcome-title">
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name || 'User'}! 👋
              </h1>
              <p className="welcome-subtitle">
                Here's your project overview for today. Stay productive and keep track of your progress.
              </p>
            </div>
          </div>
          
          {error && (
            <Alert variant="danger" className="modern-alert" dismissible onClose={() => setError('')}>
              <FaExclamationTriangle className="me-2" />
              {error}
            </Alert>
          )}
        </Container>
      </div>

      <Container fluid>
        {/* Stats Cards - Fixed Size */}
        <Row className="g-4 mb-5">
          <Col xs={12} sm={6} xl={3}>
            <Card className="modern-stat-card stat-primary">
              <Card.Body>
                <div className="stat-header">
                  <div className="stat-icon">
                    <FaProjectDiagram />
                  </div>
                  <div className="stat-trend">
                    <FaArrowUp className="trend-icon positive" />
                    <span className="trend-value">+{stats.inProgressProjects}</span>
                  </div>
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{stats.totalProjects}</h3>
                  <p className="stat-label">Total Projects</p>
                  <div className="stat-details">
                    <span className="detail-item">
                      <span className="detail-value">{stats.inProgressProjects}</span>
                      <span className="detail-label">Active</span>
                    </span>
                    <span className="detail-item">
                      <span className="detail-value">{stats.completedProjects}</span>
                      <span className="detail-label">Completed</span>
                    </span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} xl={3}>
            <Card className="modern-stat-card stat-success">
              <Card.Body>
                <div className="stat-header">
                  <div className="stat-icon">
                    <FaTasks />
                  </div>
                  <div className="stat-trend">
                    <FaArrowUp className="trend-icon positive" />
                    <span className="trend-value">+{productivity.value}</span>
                  </div>
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{stats.totalTasks}</h3>
                  <p className="stat-label">Total Tasks</p>
                  <div className="progress-bar-modern">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${getCompletionRate()}%` }}
                    ></div>
                  </div>
                  <small className="progress-text">{getCompletionRate()}% completed</small>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} xl={3}>
            <Card className="modern-stat-card stat-warning">
              <Card.Body>
                <div className="stat-header">
                  <div className="stat-icon">
                    <FaUsers />
                  </div>
                  <div className="stat-trend">
                    <FaArrowUp className="trend-icon positive" />
                    <span className="trend-value">+5</span>
                  </div>
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{stats.totalTeams}</h3>
                  <p className="stat-label">Active Teams</p>
                  <div className="stat-details">
                    <span className="detail-item">
                      <span className="detail-value">{Math.round(stats.totalTasks / Math.max(stats.totalTeams, 1))}</span>
                      <span className="detail-label">Avg Tasks</span>
                    </span>
                    <span className="detail-item">
                      <span className="detail-value">{stats.totalTeams}</span>
                      <span className="detail-label">Teams</span>
                    </span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} xl={3}>
            <Card className="modern-stat-card stat-info">
              <Card.Body>
                <div className="stat-header">
                  <div className="stat-icon">
                    <FaChartBar />
                  </div>
                  <div className="stat-trend">
                    {stats.overdueTasks > 0 ? (
                      <>
                        <FaArrowDown className="trend-icon negative" />
                        <span className="trend-value">-{stats.overdueTasks}</span>
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="trend-icon positive" />
                        <span className="trend-value">On Track</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{stats.totalReports}</h3>
                  <p className="stat-label">Reports Generated</p>
                  <div className="stat-details">
                    <span className="detail-item">
                      <span className="detail-value">{stats.overdueTasks}</span>
                      <span className="detail-label">Overdue</span>
                    </span>
                    <span className="detail-item">
                      <span className="detail-value">{stats.totalReports}</span>
                      <span className="detail-label">Reports</span>
                    </span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Main Dashboard Content */}
        <Row className="g-4 mb-4">
          {/* Activity Timeline with Working Time Range */}
          <Col xs={12} lg={8}>
            <Card className="modern-chart-card">
              <Card.Header className="modern-card-header">
                <div className="header-left">
                  <h5 className="card-title">
                    <FaChartBar className="me-2" />
                    Activity Overview
                  </h5>
                  <p className="card-subtitle">Your productivity trends over time</p>
                </div>
                <div className="header-right">
                  <div className="time-range-selector">
                    <Button 
                      variant={selectedTimeRange === '7days' ? 'primary' : 'outline-secondary'}
                      size="sm"
                      onClick={() => handleTimeRangeChange('7days')}
                    >
                      7D
                    </Button>
                    <Button 
                      variant={selectedTimeRange === '30days' ? 'primary' : 'outline-secondary'}
                      size="sm"
                      onClick={() => handleTimeRangeChange('30days')}
                    >
                      30D
                    </Button>
                    <Button 
                      variant={selectedTimeRange === '90days' ? 'primary' : 'outline-secondary'}
                      size="sm"
                      onClick={() => handleTimeRangeChange('90days')}
                    >
                      90D
                    </Button>
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                {stats.totalTasks > 0 || stats.totalProjects > 0 ? (
                  <div className="chart-container-modern">
                    <Line data={getActivityTimelineData()} options={chartOptions} />
                  </div>
                ) : (
                  <div className="empty-state-modern">
                    <div className="empty-icon">
                      <FaChartBar />
                    </div>
                    <h6>No Activity Data</h6>
                    <p>Start working on projects and tasks to see your activity timeline</p>
                    <Button variant="primary" size="sm">
                      <FaPlus className="me-2" />
                      Create First Task
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Task Status Overview */}
          <Col xs={12} lg={4}>
            <Card className="modern-chart-card">
              <Card.Header className="modern-card-header">
                <div className="header-left">
                  <h5 className="card-title">
                    <FaTasks className="me-2" />
                    Task Distribution
                  </h5>
                  <p className="card-subtitle">Current task status breakdown</p>
                </div>
              </Card.Header>
              <Card.Body>
                {stats.totalTasks > 0 ? (
                  <div className="doughnut-container">
                    <Doughnut data={getTaskStatusChartData()} options={doughnutOptions} />
                    <div className="doughnut-center">
                      <div className="center-value">{stats.totalTasks}</div>
                      <div className="center-label">Total Tasks</div>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state-modern">
                    <div className="empty-icon">
                      <FaTasks />
                    </div>
                    <h6>No Tasks Yet</h6>
                    <p>Create your first task to see the distribution</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4 mb-4">
          {/* Recent Projects */}
          <Col xs={12} lg={6}>
            <Card className="modern-list-card">
              <Card.Header className="modern-card-header">
                <div className="header-left">
                  <h5 className="card-title">
                    <FaProjectDiagram className="me-2" />
                    Recent Projects
                  </h5>
                  <p className="card-subtitle">Latest project updates</p>
                </div>
              </Card.Header>
              <Card.Body>
                {getRecentProjects().length > 0 ? (
                  <div className="modern-list">
                    {getRecentProjects().map((project, index) => (
                      <div key={project._id} className="list-item">
                        <div className="item-avatar">
                          <FaProjectDiagram />
                        </div>
                        <div className="item-content">
                          <h6 className="item-title">{project.name}</h6>
                          <p className="item-subtitle">
                            {project.description || 'No description available'}
                          </p>
                          <div className="item-meta">
                            <Badge 
                              bg={
                                project.status === 'Completed' ? 'success' :
                                project.status === 'In-Progress' ? 'primary' : 'secondary'
                              }
                              className="status-badge"
                            >
                              {project.status}
                            </Badge>
                            <span className="meta-time">
                              <FaClock className="me-1" />
                              {getTimeAgo(project.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state-modern">
                    <div className="empty-icon">
                      <FaProjectDiagram />
                    </div>
                    <h6>No Projects Yet</h6>
                    <p>Create your first project to get started</p>
                    <Button variant="primary" size="sm">
                      <FaPlus className="me-2" />
                      Create Project
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Recent Activity */}
          <Col xs={12} lg={6}>
            <Card className="modern-list-card">
              <Card.Header className="modern-card-header">
                <div className="header-left">
                  <h5 className="card-title">
                    <FaClock className="me-2" />
                    Recent Activity
                  </h5>
                  <p className="card-subtitle">Latest updates and changes</p>
                </div>
              </Card.Header>
              <Card.Body>
                {getRecentActivity().length > 0 ? (
                  <div className="activity-timeline">
                    {getRecentActivity().map((activity, index) => (
                      <div key={activity.id} className="timeline-item">
                        <div className="timeline-marker">
                          <i className={`${activity.icon} ${activity.iconColor}`}></i>
                        </div>
                        <div className="timeline-content">
                          <p className="activity-message">
                            {activity.message.split('"')[0]}
                            <strong>"{activity.message.split('"')[1]}"</strong>
                            {activity.message.split('"')[2]}
                          </p>
                          <small className="activity-time">{activity.time}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state-modern">
                    <div className="empty-icon">
                      <FaClock />
                    </div>
                    <h6>No Recent Activity</h6>
                    <p>Your recent activities will appear here</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Bottom Row - Project Status & Quick Stats */}
        <Row className="g-4 mb-4">
          <Col xs={12} lg={8}>
            <Card className="modern-chart-card">
              <Card.Header className="modern-card-header">
                <div className="header-left">
                  <h5 className="card-title">
                    <FaProjectDiagram className="me-2" />
                    Project Status Overview
                  </h5>
                  <p className="card-subtitle">Distribution of project statuses</p>
                </div>
              </Card.Header>
              <Card.Body>
                {stats.totalProjects > 0 ? (
                  <div className="chart-container-modern">
                    <Bar data={getProjectStatusChartData()} options={chartOptions} />
                  </div>
                ) : (
                  <div className="empty-state-modern">
                    <div className="empty-icon">
                      <FaProjectDiagram />
                    </div                    >
                    <h6>No Project Data</h6>
                    <p>Create projects to see status distribution</p>
                    <Button variant="primary" size="sm">
                      <FaPlus className="me-2" />
                      Create Project
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Quick Stats Summary */}
          <Col xs={12} lg={4}>
            <Card className="modern-stats-summary">
              <Card.Header className="modern-card-header">
                <div className="header-left">
                  <h5 className="card-title">
                    <FaChartBar className="me-2" />
                    Quick Stats
                  </h5>
                  <p className="card-subtitle">Key performance indicators</p>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="quick-stats">
                  <div className="quick-stat-item">
                    <div className="stat-icon-small success">
                      <FaCheckCircle />
                    </div>
                    <div className="stat-info">
                      <div className="stat-value">{stats.completedTasks}</div>
                      <div className="stat-label">Completed</div>
                    </div>
                  </div>

                  <div className="quick-stat-item">
                    <div className="stat-icon-small warning">
                      <FaClock />
                    </div>
                    <div className="stat-info">
                      <div className="stat-value">{stats.inProgressTasks}</div>
                      <div className="stat-label">In Progress</div>
                    </div>
                  </div>

                  <div className="quick-stat-item">
                    <div className="stat-icon-small info">
                      <FaCalendarAlt />
                    </div>
                    <div className="stat-info">
                      <div className="stat-value">{stats.pendingTasks}</div>
                      <div className="stat-label">Pending</div>
                    </div>
                  </div>

                  <div className="quick-stat-item">
                    <div className="stat-icon-small primary">
                      <FaExclamationTriangle />
                    </div>
                    <div className="stat-info">
                      <div className="stat-value">{stats.overdueTasks}</div>
                      <div className="stat-label">Overdue</div>
                    </div>
                  </div>
                </div>

                <div className="productivity-meter">
                  <h6 className="meter-title">Productivity Score</h6>
                  <div className="meter-container">
                    <div className="meter-bar">
                      <div 
                        className="meter-fill" 
                        style={{ width: `${Math.min(getCompletionRate() + 20, 100)}%` }}
                      ></div>
                    </div>
                    <span className="meter-value">{Math.min(getCompletionRate() + 20, 100)}/100</span>
                  </div>
                  <p className="meter-description">
                    {getCompletionRate() > 80 ? 'Excellent performance!' : 
                     getCompletionRate() > 60 ? 'Good progress!' : 
                     'Room for improvement'}
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;


