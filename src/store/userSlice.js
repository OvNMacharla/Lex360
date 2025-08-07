import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profile: null,
  preferences: {},
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { 
  updateProfile, 
  updatePreferences, 
  setLoading, 
  setError 
} = userSlice.actions;

export default userSlice.reducer;