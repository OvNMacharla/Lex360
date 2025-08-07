import { apiService } from './api';

export const chatService = {
  async sendMessage(message, sessionId = null) {
    try {
      return await apiService.sendChatMessage(message, sessionId);
    } catch (error) {
      console.error('Chat service error:', error);
      throw error;
    }
  },

  async getChatHistory(sessionId) {
    try {
      return await apiService.request(`/ai/chat/history/${sessionId}`);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  },

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
};