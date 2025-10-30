import React from 'react';  
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import ReactDOM from 'react-dom/client';
import './index.css';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);