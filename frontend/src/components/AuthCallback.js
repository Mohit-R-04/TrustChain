import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useClerk, useAuth } from '@clerk/clerk-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const AuthCallback = () => {
    const navigate = useNavigate();
    const { isLoaded, isSignedIn, user } = useUser();
    const { signOut } = useClerk();
    const { getToken } = useAuth();
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleRedirect = async () => {
            if (!isLoaded) return;

            if (!isSignedIn) {
                navigate('/');
                return;
            }

            let userRole = user.publicMetadata?.role || user.unsafeMetadata?.role;
            const selectedRole = sessionStorage.getItem('selectedRole');

            if (userRole && userRole !== 'citizen') {
                if (selectedRole && selectedRole !== userRole) {
                    setError({
                        existingRole: userRole,
                        attemptedRole: selectedRole
                    });
                    sessionStorage.removeItem('selectedRole');
                    return;
                }

                navigate(`/${userRole}-dashboard`, { replace: true });
                return;
            }

            if (selectedRole) {
                try {
                    const token = await getToken();

                    const response = await fetch(`${API_URL}/api/auth/assign-role`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            role: selectedRole,
                            name: user.fullName || user.primaryEmailAddress?.emailAddress || undefined,
                            email: user.primaryEmailAddress?.emailAddress
                        })
                    });

                    if (!response.ok) {
                        const data = await response.json().catch(() => null);
                        throw new Error(data?.error || 'Failed to assign role');
                    }

                    await user.update({
                        unsafeMetadata: {
                            role: selectedRole,
                            roleAssignedAt: new Date().toISOString()
                        }
                    });

                    userRole = selectedRole;
                    sessionStorage.removeItem('selectedRole');
                    navigate(`/${userRole}-dashboard`, { replace: true });
                } catch (err) {
                    console.error('Error assigning role:', err);
                    setError({ message: 'Failed to assign role. Please try again.' });
                }
            } else {
                navigate('/', { replace: true });
            }
        };

        handleRedirect();
    }, [isLoaded, isSignedIn, user, navigate, getToken]);

    if (error) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                padding: '20px'
            }}>
                <div style={{
                    background: 'rgba(30, 41, 59, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '20px',
                    padding: '40px',
                    maxWidth: '500px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '64px',
                        marginBottom: '20px'
                    }}>⚠️</div>

                    <h2 style={{
                        color: '#ef4444',
                        fontSize: '24px',
                        fontWeight: '700',
                        marginBottom: '16px'
                    }}>Account Already Exists</h2>

                    {error.existingRole && (
                        <p style={{
                            color: '#e2e8f0',
                            fontSize: '16px',
                            lineHeight: '1.6',
                            marginBottom: '24px'
                        }}>
                            Your account is already registered as a <strong style={{ color: '#4F46E5' }}>
                                {error.existingRole.charAt(0).toUpperCase() + error.existingRole.slice(1)}</strong>.
                            <br /><br />
                            You attempted to sign in or sign up as <strong style={{ color: '#ef4444' }}>
                                {error.attemptedRole.charAt(0).toUpperCase() + error.attemptedRole.slice(1)}</strong>.
                            <br /><br />
                            Each email can have only one role. To use a different role,
                            please sign up with a different email address.
                        </p>
                    )}

                    {error.message && (
                        <p style={{
                            color: '#e2e8f0',
                            fontSize: '16px',
                            lineHeight: '1.6',
                            marginBottom: '24px'
                        }}>{error.message}</p>
                    )}

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button
                            onClick={() => navigate(`/${error.existingRole}-dashboard`)}
                            style={{
                                padding: '12px 24px',
                                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                                border: 'none',
                                borderRadius: '10px',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Go to {error.existingRole?.charAt(0).toUpperCase() + error.existingRole?.slice(1)} Dashboard
                        </button>

                        <button
                            onClick={async () => {
                                await signOut();
                                navigate('/');
                            }}
                            style={{
                                padding: '12px 24px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '10px',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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
                <p>Redirecting to your dashboard...</p>
            </div>
        </div>
    );
};

export default AuthCallback;
