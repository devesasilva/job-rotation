import axios from "axios";

const API = import.meta.env.VITE_BACKEND_API || "http://localhost:3000";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  const headers = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return {
    withCredentials: true,
    headers,
  };
};

export const obterAvatar = async () => {
  const response = await axios.get(`${API}/api/users/avatar`, getAuthConfig());
  return response.data;
};

export const cadastrarAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await axios.post(
    `${API}/api/users/avatar`,
    formData,
    getAuthConfig()
  );
  return response.data;
};

export const substituirAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await axios.put(
    `${API}/api/users/avatar`,
    formData,
    getAuthConfig()
  );
  return response.data;
};

export const excluirAvatar = async () => {
  const response = await axios.delete(
    `${API}/api/users/avatar`,
    getAuthConfig()
  );
  return response.data;
};

export const obterStatusStorage = async () => {
  const response = await axios.get(
    `${API}/api/users/avatar/status`,
    getAuthConfig()
  );
  return response.data;
};
