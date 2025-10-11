import axios from "axios";

const API_URL = "http://localhost:4000";

// --- get all tasks ---
export const fetch_tasks = async () => {
  try {
    const res = await axios.get(`${API_URL}/tasks`);
    return res.data;
  } catch (err) {
    console.error("Error fetching tasks:", err);
    return [];
  }
};

// --- create a new task ---
export const create_task = async (title) => {
  try {
    const res = await axios.post(`${API_URL}/tasks`, { title });
    return res.data;
  } catch (err) {
    console.error("Error adding task:", err);
  }
};

// --- reorder tasks (used in drag-and-drop) ---
export const reorder_tasks = async (payload) => {
  try {
    // Backend expects { columns: { todo: [...], inprogress: [...], completed: [...] } }
    const res = await axios.post(`${API_URL}/tasks/reorder`, { columns: payload });
    return res.data;
  } catch (err) {
    console.error("Error reordering tasks:", err);
  }
};

// --- update a single task (title/status/position) ---
export const updateTask = async (id, updatedData) => {
  try {
    const res = await axios.put(`${API_URL}/tasks/${id}`, updatedData);
    return res.data;
  } catch (err) {
    console.error("Error updating task:", err);
  }
};

// --- delete task ---
export const deleteTask = async (id) => {
  try {
    const res = await axios.delete(`${API_URL}/tasks/${id}`);
    return res.data;
  } catch (err) {
    console.error("Error deleting task:", err);
  }
};
