import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const registerUser = async (name, email, password, role) => {
  let registerEndpoint = `${API_URL}/user/register`;

  if (role === 'manager') {
    if (!email.endsWith('@manager.com')) {
      throw new Error('Managers must use an email ending with @manager.com');
    }
    registerEndpoint = `${API_URL}/user/register/manager`;
  } else if (role === 'team_member') {
    if (!email.endsWith('@example.com')) {
      throw new Error('Team members must use an email ending with @example.com');
    }
    registerEndpoint = `${API_URL}/user/register/team-member`;
  } else {
    throw new Error('Invalid role. Please choose either manager or team-member');
  }

  try {
    const response = await axios.post(registerEndpoint, {
      name,
      email,
      password,
      role
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      throw new Error(error.response.data.message || 'Registration failed. Please check your input and try again.');
    }
    throw error;
  }
};

export const loginUser = async (email, password) => {
  let loginEndpoint = `${API_URL}/user/login`;
  
  if (email.endsWith('@manager.com')) {
    loginEndpoint = `${API_URL}/user/login/manager`;
  } else if (email.endsWith('@example.com')) {
    loginEndpoint = `${API_URL}/user/login/team-member`;
  }

  const response = await axios.post(loginEndpoint, {
    email,
    password
  });
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
    localStorage.setItem('userRole', response.data.user.role);
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('userRole');
};

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};
