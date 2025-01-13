import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MainNavigation } from './components/navigation/MainNavigation';
import { AuthForm } from './components/auth/AuthForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { Calendar } from './components/calendar/Calendar';
import { Messages } from './components/messages/Messages';
import { Resources } from './components/resources/Resources';
import { Settings } from './components/settings/Settings';
import { Support } from './components/support/Support';
import { LandingPage } from './components/landing/LandingPage';
import { RoleDetails } from './components/landing/RoleDetails';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { CourtReporterTools } from './components/transcription/CourtReporterTools';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <div className="layout-container">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<AuthForm />} />
              <Route path="/roles/:role" element={<RoleDetails />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedLayout>
                  <Dashboard />
                </ProtectedLayout>
              } />
              <Route path="/calendar" element={
                <ProtectedLayout>
                  <Calendar />
                </ProtectedLayout>
              } />
              <Route path="/messages" element={
                <ProtectedLayout>
                  <Messages />
                </ProtectedLayout>
              } />
              <Route path="/resources" element={
                <ProtectedLayout>
                  <Resources />
                </ProtectedLayout>
              } />
              <Route path="/settings" element={
                <ProtectedLayout>
                  <Settings />
                </ProtectedLayout>
              } />
              <Route path="/support" element={
                <ProtectedLayout>
                  <Support />
                </ProtectedLayout>
              } />
              <Route path="/transcription" element={
                <ProtectedLayout>
                  <CourtReporterTools />
                </ProtectedLayout>
              } />
              
              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex">
        <MainNavigation />
        <main className="flex-1 min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default App;