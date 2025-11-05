import axios from "axios";

const API_URL = "http://localhost:4000";

// create axios instance (no static Authorization header)
const axiosAuth = axios.create({
  baseURL: API_URL,
});

// request interceptor: read token each time (keeps it fresh after login)
axiosAuth.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// --- auth ---
export const signup = async (email, password) => {
  try {
    const res = await axios.post(`${API_URL}/api/auth/signup`, { email, password });
    if (res.data.token) localStorage.setItem("token", res.data.token);
    return { ok: true };
  } catch (err) {
    console.error("Signup error:", err.response?.data || err.message);
    return { ok: false, error: err.response?.data?.error || "Signup failed" };
  }
};

export const signin = async (email, password) => {
  try {
    const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    if (res.data.token) localStorage.setItem("token", res.data.token);
    return { ok: true };
  } catch (err) {
    console.error("Signin error:", err.response?.data || err.message);
    return { ok: false, error: err.response?.data?.error || "Signin failed" };
  }
};

export const signout = () => {
  localStorage.removeItem("token");
};

// --- tasks ---
export const fetch_tasks = async () => {
  try {
    const res = await axiosAuth.get("/tasks");
    return res.data;
  } catch (err) {
    console.error("Error fetching tasks:", err.response?.data || err.message);
    if (err.response?.status === 401) signout();
    return [];
  }
};

export const create_task = async (title) => {
  try {
    const res = await axiosAuth.post("/tasks", { title });
    return res.data;
  } catch (err) {
    console.error("Error adding task:", err.response?.data || err.message);
    if (err.response?.status === 401) signout();
  }
};

export const reorder_tasks = async (payload) => {
  try {
    const res = await axiosAuth.post("/tasks/reorder", { columns: payload });
    return res.data;
  } catch (err) {
    console.error("Error reordering tasks:", err.response?.data || err.message);
    if (err.response?.status === 401) signout();
  }
};

export const updateTask = async (id, updatedData) => {
  try {
    const res = await axiosAuth.put(`/tasks/${id}`, updatedData);
    return res.data;
  } catch (err) {
    console.error("Error updating task:", err.response?.data || err.message);
    if (err.response?.status === 401) signout();
  }
};

export const deleteTask = async (id) => {
  try {
    const res = await axiosAuth.delete(`/tasks/${id}`);
    return res.data;
  } catch (err) {
    console.error("Error deleting task:", err.response?.data || err.message);
    if (err.response?.status === 401) signout();
  }
};
