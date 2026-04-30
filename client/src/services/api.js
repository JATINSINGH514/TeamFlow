import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (data) => api.post('/auth/login', data);
export const signup = (data) => api.post('/auth/signup', data);
export const getAllUsers = () => api.get('/auth/users');

// Projects
export const getProjects = () => api.get('/projects');
export const createProject = (data) => api.post('/projects', data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);
export const addMemberToProject = (data) => api.put('/projects/add-member', data);
export const removeMemberFromProject = (data) => api.put('/projects/remove-member', data);
export const getProjectAnalytics = () => api.get('/projects/analytics');

// Tasks
export const getProjectTasks = (projectId) => api.get(`/tasks/project/${projectId}`);
export const createTask = (data) => api.post('/tasks', data);
export const assignTask = (id, memberId) => api.put(`/tasks/assign/${id}`, { memberId });
export const updateTaskStatus = (id, status) => api.put(`/tasks/status/${id}`, { status });

export default api;
