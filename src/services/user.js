// services/user.js
import { API_BASE_URL } from '../utils/constants';

export const updateUserProfile = async (userId, data) => {
  const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to update profile');
  }

  return res.json();
};
