import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../services/database/userService';
import ErrorHandler from '../utils/errorHandler';

// Async thunks for user operations
export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async ({ userId, updateData }, { rejectWithValue }) => {
    try {
      const result = await userService.updateUserProfile(userId, updateData);
      if (result.success) {
        return updateData;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      ErrorHandler.logError(error, { context: 'update_user_profile' });
      return rejectWithValue(ErrorHandler.handleFirebaseError(error));
    }
  }
);

export const uploadProfileImage = createAsyncThunk(
  'user/uploadProfileImage',
  async ({ userId, imageUri }, { rejectWithValue }) => {
    try {
      const result = await userService.uploadProfileImage(userId, imageUri);
      if (result.success) {
        return { photoURL: result.url };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      ErrorHandler.logError(error, { context: 'upload_profile_image' });
      return rejectWithValue(ErrorHandler.handleFirebaseError(error));
    }
  }
);

export const getLawyers = createAsyncThunk(
  'user/getLawyers',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const result = await userService.getLawyers(filters);
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      ErrorHandler.logError(error, { context: 'get_lawyers' });
      return rejectWithValue(ErrorHandler.handleFirebaseError(error));
    }
  }
);

export const getAllUsers = createAsyncThunk(
  'user/getAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const result = await userService.getAllUsers();
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      ErrorHandler.logError(error, { context: 'get_all_users' });
      return rejectWithValue(ErrorHandler.handleFirebaseError(error));
    }
  }
);

export const searchUsers = createAsyncThunk(
  'user/searchUsers',
  async ({ searchTerm, userType }, { rejectWithValue }) => {
    try {
      const result = await userService.searchUsers(searchTerm, userType);
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      ErrorHandler.logError(error, { context: 'search_users' });
      return rejectWithValue(ErrorHandler.handleFirebaseError(error));
    }
  }
);

const initialState = {
  profile: null,
  lawyers: [],
  searchResults: [],
  isLoading: false,
  uploadingImage: false,
  error: null,
  searchLoading: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserData: (state) => {
      state.profile = null;
      state.lawyers = [];
      state.searchResults = [];
      state.error = null;
    },
    updateProfileLocally: (state, action) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Update profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.profile) {
          state.profile = { ...state.profile, ...action.payload };
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Upload profile image
      .addCase(uploadProfileImage.pending, (state) => {
        state.uploadingImage = true;
        state.error = null;
      })
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        state.uploadingImage = false;
        if (state.profile) {
          state.profile = { ...state.profile, ...action.payload };
        }
      })
      .addCase(uploadProfileImage.rejected, (state, action) => {
        state.uploadingImage = false;
        state.error = action.payload;
      })
      
      // Get lawyers
      .addCase(getLawyers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getLawyers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lawyers = action.payload;
      })
      .addCase(getLawyers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Search users
      .addCase(searchUsers.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserData, updateProfileLocally, clearError, clearSearchResults } = userSlice.actions;
export default userSlice.reducer;