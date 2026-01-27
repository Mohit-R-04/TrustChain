import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useClerk, useUser } from '@clerk/clerk-react';
import './DashboardHeader.css';

const DashboardHeader = ({ title, role }) => {
    const navigate = useNavigate();
    const { signOut } = useClerk();
    const { user } = useUser();

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    const roleColors = {
        donor: '#4F46E5',
        government: '#059669',
        ngo: '#DC2626',
        vendor: '#D97706',
        auditor: '#7C3AED'
    };

    const roleIcons = {
        donor: '💝',
        government: '🏛️',
        ngo: '🤝',
        vendor: '🏪',
        auditor: '📊'
    };

    return (
        <div className="dashboard-header">
            <div className="header-left">
                <div className="logo-small">
                    <span className="logo-icon-small">🔗</span>
                    <span className="logo-text">TrustChain</span>
                </div>
            </div>

            <div className="header-center">
                <div className="role-badge" style={{ '--role-color': roleColors[role] }}>
                    <span className="role-icon-badge">{roleIcons[role]}</span>
                    <span className="role-name-badge">{title}</span>
                </div>
            </div>

            <div className="header-right">
                <div className="user-info">
                    <span className="user-email">{user?.primaryEmailAddress?.emailAddress}</span>
                </div>
                <button className="logout-button" onClick={handleLogout}>
                    <span className="logout-icon">🚪</span>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default DashboardHeader;
