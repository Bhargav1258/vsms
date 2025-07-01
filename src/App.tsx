import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ServiceProvider } from './context/ServiceContext';
import { ToastProvider } from './context/ToastContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MechanicDashboard from './pages/MechanicDashboard';
import PaymentPage from './pages/PaymentPage';
import ProtectedRoute from './components/ProtectedRoute';
import Toast from './components/Toast';

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <ServiceProvider>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/user-dashboard"
                  element={
                    <ProtectedRoute role="user">
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-dashboard"
                  element={
                    <ProtectedRoute role="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mechanic-dashboard"
                  element={
                    <ProtectedRoute role="mechanic">
                      <MechanicDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payment/:invoiceId"
                  element={
                    <ProtectedRoute role="user">
                      <PaymentPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
              <Toast />
            </div>
          </ServiceProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;