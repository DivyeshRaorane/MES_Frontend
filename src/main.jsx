import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { store } from './store/store.jsx'
import { setupAxiosInterceptor } from './utils/axiosInterceptor.js'

// Setup global axios interceptor for auto-logout on 401
setupAxiosInterceptor(store);

// Prevent mouse wheel from changing number input values
document.addEventListener('wheel', (e) => {
  if (e.target && e.target.type === 'number') {
    e.target.blur();
  }
}, { passive: true });

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <Provider store={store}>
    <App />
  </Provider>
  </BrowserRouter>,
)
