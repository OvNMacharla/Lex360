import { API_BASE_URL } from '../utils/constants';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
  }

  setAuthToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: userData,
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // User endpoints
  async getProfile() {
    return this.request('/user/profile');
  }

  async updateProfile(profileData) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: profileData,
    });
  }

  // Lawyers endpoints
  async getLawyers(filters = {}) {
    const queryString = new URLSearchParams(filters).toString();
    return this.request(`/lawyers?${queryString}`);
  }

  async getLawyerById(id) {
    return this.request(`/lawyers/${id}`);
  }

  // Questions endpoints
  async getQuestions(category = null) {
    const endpoint = category ? `/questions?category=${category}` : '/questions';
    return this.request(endpoint);
  }

  async askQuestion(questionData) {
    return this.request('/questions', {
      method: 'POST',
      body: questionData,
    });
  }

  async answerQuestion(questionId, answer) {
    return this.request(`/questions/${questionId}/answer`, {
      method: 'POST',
      body: { answer },
    });
  }

  // AI Chat endpoints
  async sendChatMessage(message, sessionId = null) {
    return this.request('/ai/chat', {
      method: 'POST',
      body: { message, sessionId },
    });
  }

  // Consultations endpoints
  async getConsultations() {
    return this.request('/consultations');
  }

  async bookConsultation(consultationData) {
    return this.request('/consultations', {
      method: 'POST',
      body: consultationData,
    });
  }

  // Posts endpoints
  async getPosts(category = null) {
    const endpoint = category ? `/posts?category=${category}` : '/posts';
    return this.request(endpoint);
  }

  async createPost(postData) {
    return this.request('/posts', {
      method: 'POST',
      body: postData,
    });
  }
}

export const apiService = new ApiService();