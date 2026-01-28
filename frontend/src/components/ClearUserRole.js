import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';

const ClearUserRole = () => {
    const { user } = useUser();
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const clearRole = async () => {
        if (!user) {
            setStatus('No user logged in');
            return;
        }

        setLoading(true);
        setStatus('Clearing role...');

        try {
            // Clear unsafeMetadata
            await user.update({
                unsafeMetadata: {
                    role: null,
                    roleAssignedAt: null
                }
            });

            setStatus('✅ Role cleared successfully! You can now sign out and sign up with a new role.');
            console.log('User metadata cleared');
        } catch (error) {
            console.error('Error clearing role:', error);
            setStatus('❌ Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            padding: '20px',
            maxWidth: '600px',
            margin: '50px auto',
            background: '#1e293b',
            borderRadius: '10px',
            color: 'white'
        }}>
            <h2>Clear User Role (Admin Utility)</h2>
            <p>Current User: {user?.primaryEmailAddress?.emailAddress}</p>
            <p>Current Role (unsafeMetadata): {user?.unsafeMetadata?.role || 'None'}</p>
            <p>Current Role (publicMetadata): {user?.publicMetadata?.role || 'None'}</p>

            <button
                onClick={clearRole}
                disabled={loading}
                style={{
                    padding: '12px 24px',
                    background: loading ? '#666' : '#ef4444',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: '20px'
                }}
            >
                {loading ? 'Clearing...' : 'Clear My Role'}
            </button>

            {status && (
                <div style={{
                    marginTop: '20px',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                }}>
                    {status}
                </div>
            )}

            <div style={{
                marginTop: '30px',
                padding: '15px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                fontSize: '14px'
            }}>
                <strong>⚠️ Note:</strong> This utility clears the role from Clerk's unsafeMetadata.
                However, publicMetadata can only be updated via Clerk's backend API or dashboard.
                If the role persists, you may need to:
                <ol>
                    <li>Sign out completely</li>
                    <li>Clear browser cache/cookies</li>
                    <li>Sign in again</li>
                </ol>
            </div>
        </div>
    );
};

export default ClearUserRole;
