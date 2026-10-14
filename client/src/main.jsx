import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

// Set global axios base URL for production
const apiBaseUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://smart-college-lost-found.onrender.com' : '');
if (apiBaseUrl) {
  axios.defaults.baseURL = apiBaseUrl;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
        <ToastContainer position="bottom-right" />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
