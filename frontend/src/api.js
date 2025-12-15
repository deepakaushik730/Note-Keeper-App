import axios from "axios"

// single axios instance for both local and production
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

// attach token on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// ---------- auth ----------

export const signup = async (email, password) => {
  try {
    const res = await api.post("/api/auth/signup", { email, password })
    localStorage.setItem("token", res.data.token)
    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      error: err.response?.data?.error || "signup failed"
    }
  }
}

export const signin = async (email, password) => {
  try {
    const res = await api.post("/api/auth/login", { email, password })
    localStorage.setItem("token", res.data.token)
    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      error: err.response?.data?.error || "invalid credentials"
    }
  }
}

export const signout = () => {
  localStorage.removeItem("token")
}

// ---------- tasks ----------

export const fetch_tasks = async () => {
  try {
    const res = await api.get("/api/tasks")
    return res.data
  } catch (err) {
    if (err.response?.status === 401) signout()
    return []
  }
}

export const create_task = async (title) => {
  try {
    const res = await api.post("/api/tasks", { title })
    return res.data
  } catch (err) {
    if (err.response?.status === 401) signout()
  }
}

export const reorder_tasks = async (payload) => {
  try {
    const res = await api.post("/api/tasks/reorder", {
      columns: payload
    })
    return res.data
  } catch (err) {
    if (err.response?.status === 401) signout()
  }
}

export const updateTask = async (id, updatedData) => {
  try {
    const res = await api.put(`/api/tasks/${id}`, updatedData)
    return res.data
  } catch (err) {
    if (err.response?.status === 401) signout()
  }
}

export const deleteTask = async (id) => {
  try {
    const res = await api.delete(`/api/tasks/${id}`)
    return res.data
  } catch (err) {
    if (err.response?.status === 401) signout()
  }
}

export default api
