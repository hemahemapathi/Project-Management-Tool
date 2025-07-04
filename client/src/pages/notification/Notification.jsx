import React, { useEffect, useState } from 'react';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { Container, Row, Col, Card, Badge, Button, Alert, Spinner, Toast } from 'react-bootstrap';
import { FaBell, FaCheck, FaCheckDouble, FaExclamationTriangle, FaInfoCircle, FaTrash } from 'react-icons/fa';
import './notification.css';

const Notifications = () => {
  const {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearError
  } = useNotifications();

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const showNotification = (message, variant = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      showNotification('Notification marked as read', 'success');
    } catch (error) {
      showNotification('Failed to mark notification as read', 'danger');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      showNotification('All notifications marked as read', 'success');
    } catch (error) {
      showNotification('Failed to mark all notifications as read', 'danger');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning':
        return <FaExclamationTriangle className="text-warning" />;
      case 'error':
        return <FaExclamationTriangle className="text-danger" />;
      case 'success':
        return <FaCheck className="text-success" />;
      default:
        return <FaInfoCircle className="text-info" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="notifications-wrapper">
        <Container fluid className="py-4">
          <div className="loading-container">
            <div className="loading-content">
              <Spinner animation="border" variant="primary" size="lg" />
              <p className="loading-text">Loading notifications...</p>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="notifications-wrapper">
      <Container fluid className="py-4">
        {/* Header Section */}
        <Row className="mb-4">
          <Col>
            <div className="notifications-header">
              <div className="header-content">
                <div className="header-left">
                  <h1 className="page-title">
                    <span className="title-text">Notifications</span>
                  
                  </h1>
                  <p className="page-subtitle">Stay updated with your latest activities</p>
                </div>
                <div className="header-right">
                  {unreadCount > 0 && (
                    <Button 
                      variant="outline-primary" 
                      onClick={handleMarkAllAsRead}
                      className="mark-all-btn"
                      size="sm"
                    >
                      <FaCheckDouble className="me-2" />
                      Mark All Read
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Error Alert */}
        {error && (
          <Row className="mb-4">
            <Col>
              <Alert variant="danger" dismissible onClose={clearError}>
                <FaExclamationTriangle className="me-2" />
                {error}
              </Alert>
            </Col>
          </Row>
        )}

        {/* Notifications List */}
        <Row>
          <Col>
            {notifications.length === 0 ? (
              <Card className="empty-state-card">
                <Card.Body className="text-center py-5">
                  <FaBell size={64} className="empty-icon mb-3" />
                  <h4 className="empty-title">No Notifications</h4>
                  <p className="empty-description">
                    You're all caught up! New notifications will appear here.
                  </p>
                </Card.Body>
              </Card>
            ) : (
              <div className="notifications-list">
                {notifications.map((notification) => (
                  <Card 
                    key={notification._id} 
                    className={`notification-card ${!notification.read ? 'unread' : 'read'}`}
                  >
                    <Card.Body className="notification-body">
                      <div className="notification-content">
                        <div className="notification-icon">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="notification-details">
                          <div className="notification-header">
                            <h6 className="notification-title">
                              {notification.title || 'Notification'}
                            </h6>
                            <div className="notification-meta">
                              <small className="notification-date">
                                {formatDate(notification.createdAt)}
                              </small>
                              {!notification.read && (
                                <Badge bg="primary" className="new-badge">
                                  New
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="notification-message">
                            {notification.message || 'No message available'}
                          </p>
                        </div>
                                               <div className="notification-actions">
                          {!notification.read && (
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="action-btn"
                            >
                              <FaCheck className="me-1" />
                              Mark Read
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            )}
          </Col>
        </Row>

        {/* Toast Notification */}
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={4000}
          autohide
          className={`toast-notification bg-${toastVariant}`}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
          }}
        >
          <Toast.Header closeButton={false} className={`bg-${toastVariant} text-white border-0`}>
            <strong className="toast-title">
              {toastVariant === 'success' ? '✓ Success' : '⚠ Error'}
            </strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            {toastMessage}
          </Toast.Body>
        </Toast>
      </Container>
    </div>
  );
};

export default Notifications;

