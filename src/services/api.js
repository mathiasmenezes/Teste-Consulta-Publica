const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  }

  // Auth endpoints
  async login(email, password) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return this.handleResponse(response);
  }

  async register(email, password, name) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    return this.handleResponse(response);
  }

  async socialLogin(email, name, socialProvider, socialId) {
    const response = await fetch(`${this.baseURL}/auth/social-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, socialProvider, socialId })
    });
    return this.handleResponse(response);
  }

  async requestPasswordReset(email) {
    const response = await fetch(`${this.baseURL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return this.handleResponse(response);
  }

  async resetPassword(token, newPassword) {
    const response = await fetch(`${this.baseURL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });
    return this.handleResponse(response);
  }

  async validateResetToken(token) {
    const response = await fetch(`${this.baseURL}/auth/validate-reset-token/${token}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    return this.handleResponse(response);
  }

  // Forms endpoints
  async getAllForms() {
    const response = await fetch(`${this.baseURL}/forms`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getActiveForms() {
    const response = await fetch(`${this.baseURL}/forms/active`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getFormById(id) {
    const response = await fetch(`${this.baseURL}/forms/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async createForm(formData) {
    const response = await fetch(`${this.baseURL}/forms`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(formData)
    });
    return this.handleResponse(response);
  }

  async updateForm(id, formData) {
    const response = await fetch(`${this.baseURL}/forms/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(formData)
    });
    return this.handleResponse(response);
  }

  async deleteForm(id) {
    const response = await fetch(`${this.baseURL}/forms/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async submitFormResponse(formId, data) {
    const response = await fetch(`${this.baseURL}/forms/${formId}/responses`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ data })
    });
    return this.handleResponse(response);
  }

  async submitResponse(formId, data) {
    const response = await fetch(`${this.baseURL}/forms/${formId}/responses`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ data })
    });
    return this.handleResponse(response);
  }

  async hasUserResponded(formId, userId) {
    const response = await fetch(`${this.baseURL}/forms/${formId}/responses/check`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async exportResponses(formId, format = 'csv') {
    const response = await fetch(`${this.baseURL}/forms/${formId}/responses/export?format=${format}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getFormResponses(formId) {
    const response = await fetch(`${this.baseURL}/forms/${formId}/responses`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getFormResponseCount(formId) {
    const response = await fetch(`${this.baseURL}/forms/${formId}/responses/count`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getStatistics() {
    const response = await fetch(`${this.baseURL}/forms/stats/overview`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getFormAnalytics(formId) {
    const response = await fetch(`${this.baseURL}/forms/${formId}/analytics`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async exportFormAnalytics(formId) {
    const response = await fetch(`${this.baseURL}/forms/${formId}/analytics/export`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getUserResponses() {
    const response = await fetch(`${this.baseURL}/forms/user/responses`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  // Users endpoints
  async getAllUsers() {
    const response = await fetch(`${this.baseURL}/users`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getUserProfile() {
    const response = await fetch(`${this.baseURL}/users/profile`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async updateUserProfile(profileData) {
    const response = await fetch(`${this.baseURL}/users/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    return this.handleResponse(response);
  }

  async changePassword(currentPassword, newPassword) {
    const response = await fetch(`${this.baseURL}/users/change-password`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return this.handleResponse(response);
  }

  async getUserById(id) {
    const response = await fetch(`${this.baseURL}/users/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async updateUserRole(id, role) {
    const response = await fetch(`${this.baseURL}/users/${id}/role`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ role })
    });
    return this.handleResponse(response);
  }

  async deleteUser(id) {
    const response = await fetch(`${this.baseURL}/users/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  // Admin user registration
  async registerNewUser(userData) {
    const response = await fetch(`${this.baseURL}/users/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return this.handleResponse(response);
  }

  // Health check
  async healthCheck() {
    const response = await fetch(`${this.baseURL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    return this.handleResponse(response);
  }
}

const apiService = new ApiService();
export default apiService;
