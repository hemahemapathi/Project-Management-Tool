// Notification service for managing in-app notifications
export const createNotification = (type, title, message, duration = 5000) => {
  return {
    id: Date.now() + Math.random(),
    type, // 'success', 'error', 'warning', 'info'
    title,
    message,
    timestamp: new Date(),
    duration,
    read: false
  };
};

export const filterExpiredNotifications = (notifications) => {
  const now = new Date();
  return notifications.filter(notification => {
    const notificationTime = new Date(notification.timestamp);
    const timeDiff = now - notificationTime;
    return timeDiff < notification.duration;
  });
};

export const markAsRead = (notifications, id) => {
  return notifications.map(notification => 
    notification.id === id 
      ? { ...notification, read: true }
      : notification
  );
};

export const removeNotification = (notifications, id) => {
  return notifications.filter(notification => notification.id !== id);
};

export const markAllAsRead = (notifications) => {
  return notifications.map(notification => ({
    ...notification,
    read: true
  }));
};

export const getUnreadCount = (notifications) => {
  return notifications.filter(notification => !notification.read).length;
};

export const sortNotificationsByDate = (notifications) => {
  return [...notifications].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

export const groupNotificationsByDate = (notifications) => {
  const groups = {};
  const sortedNotifications = sortNotificationsByDate(notifications);
  
  sortedNotifications.forEach(notification => {
    const date = new Date(notification.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
  });
  
  return groups;
};

export const getNotificationIcon = (type) => {
  switch (type) {
    case 'success':
      return 'fas fa-check-circle';
    case 'error':
      return 'fas fa-exclamation-circle';
    case 'warning':
      return 'fas fa-exclamation-triangle';
    case 'info':
      return 'fas fa-info-circle';
    case 'project':
      return 'fas fa-project-diagram';
    case 'task':
      return 'fas fa-tasks';
    case 'user':
      return 'fas fa-user';
    case 'system':
      return 'fas fa-cog';
    default:
      return 'fas fa-bell';
  }
};

export const getNotificationColor = (type) => {
  switch (type) {
    case 'success':
      return 'text-success';
    case 'error':
      return 'text-danger';
    case 'warning':
      return 'text-warning';
    case 'info':
      return 'text-info';
    case 'project':
      return 'text-primary';
    case 'task':
      return 'text-secondary';
    case 'user':
      return 'text-info';
    case 'system':
      return 'text-muted';
    default:
      return 'text-primary';
  }
};

export const formatNotificationTime = (timestamp) => {
  const now = new Date();
  const notificationTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now - notificationTime) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return notificationTime.toLocaleDateString();
  }
};
