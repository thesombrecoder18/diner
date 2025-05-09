import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { VotingProvider } from './contexts/VotingContext';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import HomePage from './pages/HomePage';
import VotingPage from './pages/VotingPage';
import ResultsPage from './pages/ResultsPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import CandidatesManager from './pages/admin/CandidatesManager';
import VotingSettings from './pages/admin/VotingSettings';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <VotingProvider>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/vote" element={<VotingPage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/login" element={<LoginPage />} />
            </Route>
            
            {/* Admin Routes */}
            <Route element={<AdminLayout />}>
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <Navigate to="/admin/dashboard" replace />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/candidates" 
                element={
                  <ProtectedRoute>
                    <CandidatesManager />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/settings" 
                element={
                  <ProtectedRoute>
                    <VotingSettings />
                  </ProtectedRoute>
                } 
              />
            </Route>
          </Routes>
        </VotingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;