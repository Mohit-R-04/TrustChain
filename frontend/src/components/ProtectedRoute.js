import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

const ProtectedRoute = ({ children, allowedRole }) => {
    const { isLoaded, isSignedIn, user } = useUser();

    // Show loading while checking authentication
    if (!isLoaded) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: '#0f172a',
                color: '#fff'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid rgba(255, 255, 255, 0.1)',
                        borderTopColor: '#4F46E5',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                    }}></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to sign-in if not authenticated
    if (!isSignedIn) {
        // Store the intended role
        sessionStorage.setItem('selectedRole', allowedRole);
        return <Navigate to="/sign-in" replace />;
    }

    // Get user's role
    const userRole = user.publicMetadata?.role || user.unsafeMetadata?.role;

    // Check if user has the allowed role
    if (userRole !== allowedRole) {
        // User has a different role, redirect to their dashboard
        if (userRole && userRole !== 'citizen') {
            return <Navigate to={`/${userRole}-dashboard`} replace />;
        }

        // No role assigned, redirect to role selection
        return <Navigate to="/" replace />;
    }

    // User has the correct role, render the protected content
    return children;
};

export default ProtectedRoute;
