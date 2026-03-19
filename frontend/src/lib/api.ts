const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Store tokens
let accessToken: string | null = null;
let refreshToken: string | null = null;

// Initialize tokens from localStorage
if (typeof window !== 'undefined') {
  accessToken = localStorage.getItem('accessToken');
  refreshToken = localStorage.getItem('refreshToken');
}

// Set tokens
export const setTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  }
};

// Clear tokens
export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

// Get access token
export const getAccessToken = () => accessToken;

// Generic fetch wrapper with auth header
const authenticatedFetch = async (endpoint: string, options: RequestInit = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If 401, try to refresh token
  if (response.status === 401 && refreshToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry with new token
      headers['Authorization'] = `Bearer ${accessToken}`;
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
    } else {
      // Refresh failed, clear tokens and redirect to login
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  return response;
};

// ============== AUTH ENDPOINTS ==============

export const register = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  return response.json();
};

export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  const data = await response.json();
  setTokens(data.accessToken, data.refreshToken);
  return data;
};

export const refreshAccessToken = async () => {
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: refreshToken }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    accessToken = data.accessToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', data.accessToken);
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const logout = async (userId: string) => {
  try {
    await authenticatedFetch('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearTokens();
  }
};

// ============== TASK ENDPOINTS ==============

export interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  createdAt: string;
  userId: string;
}

export const getTasks = async (
  page: number = 1,
  limit: number = 10,
  search: string = '',
  status: string = 'all'
) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search,
    status,
  });

  const response = await authenticatedFetch(`/tasks?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch tasks');
  }

  return response.json();
};

export const getTask = async (id: string) => {
  const response = await authenticatedFetch(`/tasks/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch task');
  }

  return response.json();
};

export const createTask = async (title: string, description?: string) => {
  const response = await authenticatedFetch('/tasks', {
    method: 'POST',
    body: JSON.stringify({ title, description }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create task');
  }

  return response.json();
};

export const updateTask = async (
  id: string,
  title?: string,
  description?: string,
  isCompleted?: boolean
) => {
  const body: any = {};
  if (title) body.title = title;
  if (description !== undefined) body.description = description;
  if (isCompleted !== undefined) body.isCompleted = isCompleted;

  const response = await authenticatedFetch(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update task');
  }

  return response.json();
};

export const toggleTask = async (id: string) => {
  const response = await authenticatedFetch(`/tasks/${id}/toggle`, {
    method: 'PATCH',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to toggle task');
  }

  return response.json();
};

export const deleteTask = async (id: string) => {
  const response = await authenticatedFetch(`/tasks/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete task');
  }

  return response.json();
};
