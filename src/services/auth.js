import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './api';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const authService = {
  async login(email, password) {
    try {
      const response = await apiService.login(email, password);
      
      if (response.token) {
        await this.setAuthData(response.token, response.user);
        apiService.setAuthToken(response.token);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  async register(userData) {
    try {
      const response = await apiService.register(userData);
      
      if (response.token) {
        await this.setAuthData(response.token, response.user);
        apiService.setAuthToken(response.token);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  async logout() {
    try {
      await apiService.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      await this.clearAuthData();
      apiService.setAuthToken(null);
    }
  },

  async setAuthData(token, user) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  async getAuthData() {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const userData = await AsyncStorage.getItem(USER_KEY);
      
      if (token && userData) {
        const user = JSON.parse(userData);
        apiService.setAuthToken(token);
        return { token, user };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting auth data:', error);
      return null;
    }
  },

  async clearAuthData() {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  },

  async isAuthenticated() {
    const authData = await this.getAuthData();
    return !!authData;
  }
};