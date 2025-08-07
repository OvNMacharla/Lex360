import { apiService } from './api';

export const lawyerService = {
  async searchLawyers(filters = {}) {
    try {
      return await apiService.getLawyers(filters);
    } catch (error) {
      console.error('Error searching lawyers:', error);
      throw error;
    }
  },

  async getLawyerProfile(lawyerId) {
    try {
      return await apiService.getLawyerById(lawyerId);
    } catch (error) {
      console.error('Error fetching lawyer profile:', error);
      throw error;
    }
  },

  async bookConsultation(lawyerId, consultationData) {
    try {
      return await apiService.bookConsultation({
        lawyerId,
        ...consultationData
      });
    } catch (error) {
      console.error('Error booking consultation:', error);
      throw error;
    }
  },

  async rateLawyer(lawyerId, rating, comment = '') {
    try {
      return await apiService.request(`/lawyers/${lawyerId}/rate`, {
        method: 'POST',
        body: { rating, comment }
      });
    } catch (error) {
      console.error('Error rating lawyer:', error);
      throw error;
    }
  }
};