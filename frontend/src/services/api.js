const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('daycraft_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  let data = null;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = { message: await response.text() };
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('daycraft_token');
      localStorage.removeItem('daycraft_user');
      // Dispatch custom event to notify AuthContext without hard page reload
      window.dispatchEvent(new Event('daycraft_unauthorized'));
    }
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  async register(userData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  async login(credentials) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(res);
  },

  async getProfile() {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async updateProfile(profileData) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(res);
  },

  // Tasks
  async getTasks(params = {}) {
    const query = new URLSearchParams();
    if (params.date) query.append('date', params.date);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.priority && params.priority !== 'All') query.append('priority', params.priority);
    if (params.status && params.status !== 'all') query.append('status', params.status);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE}/tasks${queryString}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createTask(taskData) {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });
    return handleResponse(res);
  },

  async updateTask(id, taskData) {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });
    return handleResponse(res);
  },

  async deleteTask(id) {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async toggleTask(id) {
    const res = await fetch(`${API_BASE}/tasks/${id}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Streaks & Freezes
  async getStreakStats() {
    const res = await fetch(`${API_BASE}/streaks/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async useFreeze(freezeType, dateToProtect) {
    const res = await fetch(`${API_BASE}/streaks/use-freeze`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ freezeType, dateToProtect }),
    });
    return handleResponse(res);
  },

  // Badges
  async getBadges() {
    const res = await fetch(`${API_BASE}/badges`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Stats & Dashboard
  async getDashboardSummary() {
    const res = await fetch(`${API_BASE}/stats/dashboard`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getHistoryStats() {
    const res = await fetch(`${API_BASE}/stats/history`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};
