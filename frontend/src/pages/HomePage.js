import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();

    const roles = [
        { id: 'donor', name: 'Donor', icon: '💝' },
        { id: 'government', name: 'Government', icon: '🏛️' },
        { id: 'ngo', name: 'NGO', icon: '🤝' },
        { id: 'vendor', name: 'Vendor', icon: '🏪' },
        { id: 'auditor', name: 'Auditor', icon: '📊' }
    ];

    const handleRoleClick = (roleId) => {
        sessionStorage.setItem('selectedRole', roleId);
        navigate('/sign-in');
    };

    return (
        <div className="home-container">
            <div className="home-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>

            {/* Header with Role Selection */}
            <header className="home-header">
                <div className="header-logo">
                    <span className="header-logo-icon">🔗</span>
                    <span className="header-logo-text">TrustChain</span>
                </div>

                <nav className="role-nav">
                    {roles.map((role) => (
                        <button
                            key={role.id}
                            className="role-nav-button"
                            onClick={() => handleRoleClick(role.id)}
                            title={`Sign in as ${role.name}`}
                        >
                            <span className="role-nav-icon">{role.icon}</span>
                            <span className="role-nav-name">{role.name}</span>
                        </button>
                    ))}
                </nav>

                <button className="citizen-nav-button" onClick={() => navigate('/citizen')}>
                    <span className="citizen-nav-icon">👥</span>
                    <span className="citizen-nav-name">Citizen</span>
                </button>
            </header>

            <div className="home-content">
                {/* Hero Section */}
                <div className="hero-section">
                    <div className="logo-large">
                        <span className="logo-icon-large">🔗</span>
                        <h1>Trust<span className="logo-highlight">Chain</span></h1>
                    </div>
                    <p className="hero-tagline">
                        Blockchain-Powered Transparency for NGO Governance
                    </p>
                    <p className="hero-description">
                        Revolutionizing fund management with immutable records, real-time tracking,
                        and complete transparency on the Polygon blockchain.
                    </p>

                    <div className="hero-badges">
                        <div className="tech-badge">
                            <span className="badge-icon">🔷</span>
                            Polygon Blockchain
                        </div>
                        <div className="tech-badge">
                            <span className="badge-icon">📦</span>
                            IPFS Storage
                        </div>
                        <div className="tech-badge">
                            <span className="badge-icon">🔒</span>
                            End-to-End Encryption
                        </div>
                    </div>

                    <div className="cta-buttons">
                        <button className="cta-primary" onClick={() => navigate('/citizen')}>
                            <span className="cta-icon">👁️</span>
                            View as Citizen
                        </button>
                    </div>
                </div>

                {/* Features Section */}
                <div className="features-section">
                    <h2 className="section-title">Why TrustChain?</h2>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">💝</div>
                            <h3>For Donors</h3>
                            <p>Track every rupee donated with complete transparency and blockchain verification</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">🏛️</div>
                            <h3>For Government</h3>
                            <p>Monitor fund allocation, ensure compliance, and generate real-time reports</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">🤝</div>
                            <h3>For NGOs</h3>
                            <p>Manage projects efficiently with automated workflows and transparent records</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">👥</div>
                            <h3>For Citizens</h3>
                            <p>Access public records, verify transactions, and ensure accountability</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">🏪</div>
                            <h3>For Vendors</h3>
                            <p>Submit invoices, track payments, and maintain transparent service records</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">📊</div>
                            <h3>For Auditors</h3>
                            <p>Verify transactions, flag anomalies, and ensure regulatory compliance</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="home-footer">
                    <p>Powered by Polygon • Secured by Blockchain • Built for Transparency</p>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
