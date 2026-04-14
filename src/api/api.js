// API client — calls http://localhost:4000 (intercepted by MSW in dev)
// When real backend is ready, remove MSW and this file works unchanged.

const BASE_URL = "http://localhost:4000";

const getToken = () => localStorage.getItem("tf_token");

// ── HTTP helpers ─────────────────────────────────────────────────────────────
const request = async (method, path, body = null, auth = true) => {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (!token) throw new Error("unauthorized");
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  // 204 No Content
  if (res.status === 204) return null;

  const data = await res.json();

  if (!res.ok) {
    // Surface validation field errors as readable message
    if (data.fields) {
      const msg = Object.entries(data.fields)
        .map(([k, v]) => `${k} ${v}`)
        .join(", ");
      throw new Error(msg);
    }
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
};

const get = (path) => request("GET", path);
const post = (path, body) => request("POST", path, body);
const patch = (path, body) => request("PATCH", path, body);
const del = (path) => request("DELETE", path);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const registerUser = async ({ name, email, password }) => {
  const data = await request("POST", "/auth/register", { name, email, password }, false);
  _saveSession(data.token, data.user);
  return data;
};

export const loginUser = async ({ email, password }) => {
  const data = await request("POST", "/auth/login", { email, password }, false);
  _saveSession(data.token, data.user);
  return data;
};

export const getMe = () => {
  try {
    const raw = localStorage.getItem("tf_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const isAuthenticated = () => !!getToken() && !!getMe();

export const logout = () => {
  localStorage.removeItem("tf_token");
  localStorage.removeItem("tf_user");
};

const _saveSession = (token, user) => {
  localStorage.setItem("tf_token", token);
  localStorage.setItem("tf_user", JSON.stringify(user));
};

// ── Projects ─────────────────────────────────────────────────────────────────
export const fetchProjects = () => get("/projects").then((d) => d.projects);

export const createProject = (data) => post("/projects", data);

export const fetchProject = (id) => get(`/projects/${id}`);

export const updateProject = (id, data) => patch(`/projects/${id}`, data);

export const deleteProject = (id) => del(`/projects/${id}`);

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const fetchTasks = (projectId, filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return get(`/projects/${projectId}/tasks${params ? `?${params}` : ""}`).then((d) => d.tasks);
};

export const createTask = (projectId, data) => post(`/projects/${projectId}/tasks`, data);

export const updateTask = (taskId, data) => patch(`/tasks/${taskId}`, data);

export const deleteTask = (taskId) => del(`/tasks/${taskId}`);