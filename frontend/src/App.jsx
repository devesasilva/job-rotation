import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Main from './pages/Main';
import Organizacao from './pages/Organizacao';
import Perfil from './pages/Perfil';
import Notificacoes from './pages/Notificacoes';
import {
  NotificationProvider,
} from './contexts/NotificationContext';
import NotificationToast from './components/NotificationToast';
import { useNotifications } from './contexts/NotificationContext';
import './index.css';

function AppContent() {
  const { toasts } = useNotifications();

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/main" element={<Main/>} />
        <Route path="/organizacao/:id" element={<Organizacao />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/notificacoes" element={<Notificacoes />} />
      </Routes>
      {toasts.map((toast) => (
        <NotificationToast
          key={toast.id}
          notificacao={toast.notificacao}
        />
      ))}
    </div>
  );
}

function App() {
  return (
    <Router>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </Router>
  );
}

export default App;
