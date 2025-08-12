import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './themeSlice'; // Your existing theme slice
import authReducer from './authSlice';   // New Firebase auth slice
import userReducer from './userSlice';   // New user slice
import chatReducer from './chatSlice';   // New chat slice (optional)

export const store = configureStore({
  reducer: {
    theme: themeReducer,    // Your existing theme slice
    auth: authReducer,      // Firebase auth
    user: userReducer,      // User data
    // chat: chatReducer,   // Uncomment when you add chat slice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
        ],
        ignoredPaths: ['auth.user._user'], // Ignore Firebase user object
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;