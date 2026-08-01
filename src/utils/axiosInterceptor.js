/**
 * Axios Response Interceptor
 * Automatically logs out the user when any API returns 401 (token expired/invalid).
 */
import axios from 'axios';

export const setupAxiosInterceptor = (store) => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid — force logout
        store.dispatch({ type: 'auth/logOut' });
        
        // Clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('session_active');

        // Redirect to login
        window.location.href = '/';
      }
      return Promise.reject(error);
    }
  );
};
