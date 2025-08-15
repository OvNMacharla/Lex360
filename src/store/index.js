import { configureStore } from '@reduxjs/toolkit';
import themeReducer from '../store/themeSlice';
import authReducer from '../store/authSlice';
import userReducer from '../store/userSlice';
import casesReducer from '../store/caseSlice'; // Add your cases reducer

// Custom serialization check that's more lenient with dates
const isSerializable = (value: any): boolean => {
  // Allow undefined and null
  if (value === undefined || value === null) return true;
  
  // Allow primitives
  if (typeof value !== 'object') return true;
  
  // Check for Date objects and convert them
  if (value instanceof Date) {
    console.warn('Date object detected in Redux action/state. Consider converting to ISO string.');
    return false; // This will trigger the warning but won't crash
  }
  
  // Check for Firestore Timestamp objects
  if (value && typeof value.toDate === 'function') {
    console.warn('Firestore Timestamp detected. Should be converted to ISO string.');
    return false;
  }
  
  // Allow arrays and plain objects
  if (Array.isArray(value) || value.constructor === Object) {
    return true;
  }
  
  // Allow Firestore arrayUnion operations temporarily
  if (value && value._methodName === 'arrayUnion') {
    return true; // Allow Firestore operations
  }
  
  return false;
};

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    user: userReducer,
    cases: casesReducer, // Add cases reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/FLUSH',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
        ],
        // Ignore these paths in actions
        ignoredActionsPaths: [
          'meta.arg.callback',
          'payload.updatedAt',
          'payload.createdAt',
          'payload.timestamp',
          'payload.dueDate',
          'payload.timeline',
          'payload.subtasks',
        ],
        // Ignore these paths in state
        ignoredPaths: [
          'auth.user._user',
          'cases.cases.timeline',
          'cases.currentCase.timeline',
          'cases.cases.subtasks',
          'cases.currentCase.subtasks',
        ],
        // Use custom serialization check
        isSerializable,
        // Only warn, don't throw errors
        warnAfter: 32,
      },
      // Increase the timeout for actions that might be slow
      thunk: {
        extraArgument: undefined,
      },
      // Enable immutability check only in development
      immutableCheck: __DEV__ ? {
        warnAfter: 128,
      } : false,
    }),
  devTools: __DEV__,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;