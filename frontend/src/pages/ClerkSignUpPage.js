import React, { useEffect } from 'react';
import { SignUp, useUser } from '@clerk/clerk-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ClerkSignUpPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, isLoaded } = useUser();
    const selectedRole = searchParams.get('role') || sessionStorage.getItem('selectedRole');

    useEffect(() => {
        // If user just signed up, assign role
        if (isLoaded && user) {
            handleUserSignedUp();
        }
    }, [isLoaded, user]);

    const handleUserSignedUp = async () => {
        try {
            // Check if user already has a role
            const userRole = user.publicMetadata?.role || user.unsafeMetadata?.role;

            if (!userRole || userRole === 'citizen') {
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
            } else {
                // User already has a role (shouldn't happen on signup)
                navigate(`/${userRole}-dashboard`);
            }
        } catch (error) {
            console.error('Error handling user sign up:', error);
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
                        Sign up as {selectedRole ? selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1) : 'User'}
                    </h2>
                    <p style={{
                        color: '#94a3b8',
                        fontSize: '14px'
                    }}>
                        You'll be registered as a {selectedRole} user
                    </p>
                </div>

                <SignUp
                    routing="path"
                    path="/sign-up"
                    signInUrl="/sign-in"
                    afterSignUpUrl={`/${selectedRole}-dashboard`}
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

export default ClerkSignUpPage;
