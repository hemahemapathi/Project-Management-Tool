import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock API functions - replace with actual API calls when backend is ready
  const mockGetNotifications = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: [
            {
              _id: '1',
              title: 'Welcome!',
              message: 'Welcome to the Project Management Tool',
              type: 'info',
              read: false,
              createdAt: new Date().toISOString()
            },
            {
              _id: '2',
              title: 'Task Updated',
              message: 'Your task "Design Homepage" has been updated successfully',
              type: 'success',
              read: false,
              createdAt: new Date(Date.now() - 3600000).toISOString()
            },
            {
              _id: '3',
              title: 'Project Deadline',
              message: 'Project "Website Redesign" deadline is approaching in 2 days',
              type: 'warning',
              read: true,
              createdAt: new Date(Date.now() - 7200000).toISOString()
            },
            {
              _id: '4',
              title: 'Team Meeting',
              message: 'Team meeting scheduled for tomorrow at 10:00 AM',
              type: 'info',
              read: false,
              createdAt: new Date(Date.now() - 10800000).toISOString()
            }
          ]
        });
      }, 1000);
    });
  };

  const mockMarkAsRead = async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 500);
    });
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await mockGetNotifications();
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to fetch notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await mockMarkAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('Failed to mark notification as read');
      throw error;
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(notification => 
          mockMarkAsRead(notification._id)
        )
      );
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setError('Failed to mark all notifications as read');
      throw error;
    }
  };

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const removeNotification = (notificationId) => {
    setNotifications(prev => 
      prev.filter(notification => notification._id !== notificationId)
    );
  };

  const clearError = () => {
    setError(null);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const value = {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
    clearError
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
