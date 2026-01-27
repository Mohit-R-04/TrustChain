import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RoleSelector.css';

const RoleSelector = () => {
    const navigate = useNavigate();

    const roles = [
        { id: 'donor', name: 'Donor', icon: '💝', color: '#4F46E5' },
        { id: 'government', name: 'Government', icon: '🏛️', color: '#059669' },
        { id: 'ngo', name: 'NGO', icon: '🤝', color: '#DC2626' },
        { id: 'vendor', name: 'Vendor', icon: '🏪', color: '#D97706' },
        { id: 'auditor', name: 'Auditor', icon: '📊', color: '#7C3AED' }
    ];

    const handleRoleSelect = (roleId) => {
        // Store selected role for later assignment
        sessionStorage.setItem('selectedRole', roleId);
        // Redirect to Clerk's sign-in page
        navigate('/sign-in');
    };

    return (
        <div className="login-container">
            <div className="login-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>

            <button
                onClick={() => navigate('/')}
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
                    fontFamily: 'Inter, sans-serif',
                    zIndex: 10
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
                <span>←</span> Back to Home
            </button>

            <div className="login-content">
                <div className="login-header">
                    <div className="logo">
                        <span className="logo-icon">🔗</span>
                        <h1>Trust<span className="logo-highlight">Chain</span></h1>
                    </div>
                    <p className="tagline">Blockchain Governance for the Future</p>
                    <div className="blockchain-badge">
                        <span className="badge-icon">🔷</span>
                        Polygon + IPFS Powered
                    </div>
                </div>

                <div className="login-card">
                    <h2 className="card-title">Select Your Role</h2>
                    <p className="card-subtitle">Choose your role to continue</p>

                    <div className="roles-grid">
                        {roles.map((role) => (
                            <div
                                key={role.id}
                                className="role-card"
                                onClick={() => handleRoleSelect(role.id)}
                                style={{ '--role-color': role.color }}
                            >
                                <div className="role-icon">{role.icon}</div>
                                <h3 className="role-name">{role.name}</h3>
                                <button className="role-button">
                                    Continue
                                    <span className="arrow">→</span>
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="citizen-access">
                        <div className="divider">
                            <span>or</span>
                        </div>
                        <button
                            className="citizen-button"
                            onClick={() => navigate('/citizen')}
                        >
                            <span className="citizen-icon">👥</span>
                            Continue as Citizen (Public Access)
                        </button>
                    </div>
                </div>

                <div className="login-footer">
                    <p>Secured by blockchain technology • Transparent • Immutable</p>
                </div>
            </div>
        </div>
    );
};

export default RoleSelector;
