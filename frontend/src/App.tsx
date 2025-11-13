import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import AccountDetails from './pages/AccountDetails';
import TransferPage from './pages/TransferPage';
import DepositPage from './pages/DepositPage';
import WithdrawPage from './pages/WithdrawPage';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route 
            path="/login" 
            element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/register" 
            element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/account/:accountId" 
            element={isAuthenticated ? <AccountDetails /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/transfer" 
            element={isAuthenticated ? <TransferPage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/deposit" 
            element={isAuthenticated ? <DepositPage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/withdraw" 
            element={isAuthenticated ? <WithdrawPage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;