import axiosInstance from '../utils/axiosInstance';

export const login = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await axiosInstance.post('/auth/register', userData);
  return response.data;
};

export const getProfile = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};

export const updateProfile = async (userData) => {
  const response = await axiosInstance.put('/auth/profile', userData);
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post('/auth/logout');
  return response.data;
};
