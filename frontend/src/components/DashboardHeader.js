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

    return (
        <div className="dashboard-header">
            <div className="header-left">
                <div className="logo-small">
                    <span className="brand-mark" aria-hidden="true">TC</span>
                    <span className="logo-text">TrustChain</span>
                </div>
            </div>

            <div className="header-center">
                <div className="role-badge" style={{ '--role-color': roleColors[role] }}>
                    <span className="role-name-badge">{title}</span>
                </div>
            </div>

            <div className="header-right">
                <div className="user-info">
                    <span className="user-email">{user?.primaryEmailAddress?.emailAddress}</span>
                </div>
                <button className="logout-button" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default DashboardHeader;
