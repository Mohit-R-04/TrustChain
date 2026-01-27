import React, { useEffect } from 'react';
import { SignIn, useUser } from '@clerk/clerk-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ClerkSignInPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, isLoaded } = useUser();
    const selectedRole = searchParams.get('role') || sessionStorage.getItem('selectedRole');

    useEffect(() => {
        // If user is already signed in, handle role assignment
        if (isLoaded && user) {
            handleUserSignedIn();
        }
    }, [isLoaded, user]);

    const handleUserSignedIn = async () => {
        try {
            // Get user's current role from metadata
            const userRole = user.publicMetadata?.role || user.unsafeMetadata?.role;

            if (!userRole || userRole === 'citizen') {
                // No role assigned - this is first time signup
                // Assign the selected role
                if (selectedRole) {
                    await user.update({
                        unsafeMetadata: {
                            role: selectedRole,
                            roleAssignedAt: new Date().toISOString()
                        }
                    });

                    // Redirect to role dashboard
                    navigate(`/${selectedRole}-dashboard`);
                } else {
                    // No role selected, go back to role selection
                    navigate('/');
                }
            } else if (userRole !== selectedRole) {
                // User has a different role
                alert(`You are already registered as ${userRole.toUpperCase()}. Redirecting to your dashboard.`);
                navigate(`/${userRole}-dashboard`);
            } else {
                // Role matches, proceed to dashboard
                navigate(`/${selectedRole}-dashboard`);
            }
        } catch (error) {
            console.error('Error handling user sign in:', error);
            navigate('/');
        }
    };

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
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '40px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}>
                <div style={{
                    textAlign: 'center',
                    marginBottom: '30px'
                }}>
                    <h2 style={{
                        color: '#fff',
                        fontSize: '24px',
                        marginBottom: '10px'
                    }}>
                        Sign in as {selectedRole ? selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1) : 'User'}
                    </h2>
                    <p style={{
                        color: '#94a3b8',
                        fontSize: '14px'
                    }}>
                        Your role will be assigned after signup
                    </p>
                </div>

                <SignIn
                    routing="path"
                    path="/sign-in"
                    signUpUrl="/sign-up"
                    afterSignInUrl={`/${selectedRole}-dashboard`}
                    appearance={{
                        elements: {
                            rootBox: {
                                width: '100%'
                            },
                            card: {
                                background: 'rgba(255, 255, 255, 0.95)',
                                boxShadow: 'none'
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default ClerkSignInPage;
