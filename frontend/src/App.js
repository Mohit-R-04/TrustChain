import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, SignIn, SignUp } from '@clerk/clerk-react';

// Pages
import HomePage from './pages/HomePage';
import CitizenPage from './pages/CitizenPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import DonorDashboard from './pages/DonorDashboard';
import GovernmentDashboard from './pages/GovernmentDashboard';
import NGODashboard from './pages/NGODashboard';
import VendorDashboard from './pages/VendorDashboard';
import VendorKycPage from './pages/VendorKycPage';
import AuditorDashboard from './pages/AuditorDashboard';
import StripePayment from './pages/StripePayment';
import ProtectedRoute from './components/ProtectedRoute';
import AuthCallback from './components/AuthCallback';
import ClearUserRole from './components/ClearUserRole';

// Get Clerk publishable key from environment variable
const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;
const clerkJsFallbackUrl = 'https://cdn.jsdelivr.net/npm/@clerk/clerk-js@5/dist/clerk.browser.js';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return this.props.fallback || (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#0f172a',
        color: '#e2e8f0',
        fontSize: '16px',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div>
          <h2 style={{ margin: 0, marginBottom: '10px', color: '#ef4444' }}>Authentication service unavailable</h2>
          <p style={{ margin: 0, color: '#94a3b8' }}>
            Clerk failed to load. Public pages are still available.
          </p>
        </div>
      </div>
    );
  }
}

function App() {
  if (!clerkPubKey) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#0f172a',
        color: '#ef4444',
        fontSize: '18px',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div>
          <h2>⚠️ Configuration Error</h2>
          <p>Please add your Clerk Publishable Key to the .env file:</p>
          <code style={{ background: '#1e293b', padding: '10px', borderRadius: '8px', display: 'block', marginTop: '10px' }}>
            REACT_APP_CLERK_PUBLISHABLE_KEY=your_key_here
          </code>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={(
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/citizen" element={<CitizenPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      )}
    >
      <ClerkProvider publishableKey={clerkPubKey} clerkJSUrl={clerkJsFallbackUrl}>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/citizen" element={<CitizenPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />

            {/* Clerk Authentication Pages */}
            <Route
              path="/sign-in/*"
              element={
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '100vh',
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  position: 'relative'
                }}>
                  <button
                    onClick={() => window.history.back()}
                    style={{
                      position: 'absolute',
                      top: '20px',
                      left: '20px',
                      padding: '12px 20px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease',
                      fontFamily: 'Inter, sans-serif'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.transform = 'translateX(-2px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <span>←</span> Back
                  </button>
                  <SignIn
                    routing="path"
                    path="/sign-in"
                    afterSignInUrl="/auth-callback"
                    afterSignUpUrl="/auth-callback"
                  />
                </div>
              }
            />
            <Route
              path="/sign-up/*"
              element={
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '100vh',
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  position: 'relative'
                }}>
                  <button
                    onClick={() => window.history.back()}
                    style={{
                      position: 'absolute',
                      top: '20px',
                      left: '20px',
                      padding: '12px 20px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease',
                      fontFamily: 'Inter, sans-serif'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.transform = 'translateX(-2px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <span>←</span> Back
                  </button>
                  <SignUp
                    routing="path"
                    path="/sign-up"
                    afterSignInUrl="/auth-callback"
                    afterSignUpUrl="/auth-callback"
                  />
                </div>
              }
            />

            {/* Auth Callback - handles redirect after Clerk authentication */}
            <Route path="/auth-callback" element={<AuthCallback />} />

            {/* Admin Utility - Clear User Role */}
            <Route path="/clear-role" element={<ClearUserRole />} />

            {/* Protected Role-Based Routes */}
            <Route
              path="/donor-dashboard"
              element={
                <ProtectedRoute allowedRole="donor">
                  <DonorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <ProtectedRoute allowedRole="donor">
                  <StripePayment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/government-dashboard"
              element={
                <ProtectedRoute allowedRole="government">
                  <GovernmentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ngo-dashboard"
              element={
                <ProtectedRoute allowedRole="ngo">
                  <NGODashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor-dashboard"
              element={
                <ProtectedRoute allowedRole="vendor">
                  <VendorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor-kyc"
              element={
                <ProtectedRoute allowedRole="vendor">
                  <VendorKycPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/auditor-dashboard"
              element={
                <ProtectedRoute allowedRole="auditor">
                  <AuditorDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ClerkProvider>
    </ErrorBoundary>
  );
}

export default App;
