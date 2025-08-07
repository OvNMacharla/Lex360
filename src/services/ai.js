import api from './api';

export const sendToAI = async (message) => {
  try {
    const response = await api.post('/ai/message', { message });
    return response.data;
  } catch (error) {
    throw new Error('AI service failed');
  }
};
