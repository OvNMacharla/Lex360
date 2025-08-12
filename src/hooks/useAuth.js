import { useSelector, useDispatch } from 'react-redux';
import { 
  loginWithEmail, 
  registerWithEmail, 
  loginWithGoogle, 
  logout, 
  resetPassword,
  clearError 
} from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector(state => state.auth);

  const login = async (email, password) => {
    const result = await dispatch(loginWithEmail({ email, password }));
    return result;
  };

  const register = async (email, password, userData) => {
    const result = await dispatch(registerWithEmail({ email, password, userData }));
    return result;
  };

  const googleLogin = async () => {
    const result = await dispatch(loginWithGoogle());
    return result;
  };

  const signOut = async () => {
    const result = await dispatch(logout());
    return result;
  };

  const resetUserPassword = async (email) => {
    const result = await dispatch(resetPassword({ email }));
    return result;
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    ...authState,
    login,
    register,
    googleLogin,
    logout: signOut,
    resetPassword: resetUserPassword,
    clearError: clearAuthError,
    isAuthenticated: !!authState.user
  };
};