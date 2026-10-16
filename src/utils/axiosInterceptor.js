/**
 * Axios Response Interceptor
 * Automatically logs out the user when any API returns 401 (token expired/invalid).
 */
import axios from 'axios';

export const setupAxiosInterceptor = (store) => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      const requestUrl = error.config?.url || '';

      // A 401 from the login request just means "wrong credentials" — it must
      // NOT trigger the auto-logout/redirect, otherwise every failed login
      // forces a full page reload (window.location) and the login screen
      // appears to re-render/reload repeatedly. Let the login screen handle it.
      const isAuthRequest = /\/login(\?|$)/i.test(requestUrl);

      if (status === 401 && !isAuthRequest) {
        // An authenticated request was rejected — token expired or invalid.
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
