import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();

    const roles = [
        { id: 'donor', name: 'Donor', abbr: 'D' },
        { id: 'government', name: 'Government', abbr: 'G' },
        { id: 'ngo', name: 'NGO', abbr: 'N' },
        { id: 'vendor', name: 'Vendor', abbr: 'V' },
        { id: 'auditor', name: 'Auditor', abbr: 'A' }
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
                    <span className="brand-mark" aria-hidden="true">TC</span>
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
                            <span className="role-nav-badge" aria-hidden="true">{role.abbr}</span>
                            <span className="role-nav-name">{role.name}</span>
                        </button>
                    ))}
                </nav>

                <button className="citizen-nav-button" onClick={() => navigate('/citizen')}>
                    <span className="citizen-nav-name">Citizen Portal</span>
                </button>
            </header>

            <div className="home-content">
                {/* Hero Section */}
                <div className="hero-section">
                    <div className="logo-large">
                        <span className="brand-mark brand-mark--lg" aria-hidden="true">TC</span>
                        <h1>Trust<span className="logo-highlight">Chain</span></h1>
                    </div>
                    <p className="hero-tagline">
                        Blockchain-Backed Transparency for Public Welfare Funding
                    </p>
                    <p className="hero-description">
                        Track donations, allocations, invoices, and outcomes end-to-end with verifiable records,
                        real-time monitoring, and auditable reporting.
                    </p>

                    <div className="hero-badges">
                        <div className="tech-badge">
                            <span className="badge-dot badge-dot--primary" aria-hidden="true"></span>
                            Polygon-compatible ledger
                        </div>
                        <div className="tech-badge">
                            <span className="badge-dot badge-dot--secondary" aria-hidden="true"></span>
                            IPFS document integrity
                        </div>
                        <div className="tech-badge">
                            <span className="badge-dot badge-dot--tertiary" aria-hidden="true"></span>
                            Secure access and audit trails
                        </div>
                    </div>

                    <div className="cta-buttons">
                        <button className="cta-primary" onClick={() => navigate('/citizen')}>
                            View Citizen Portal
                        </button>
                        <button className="cta-secondary" onClick={() => navigate('/waitlist')}>
                            Request Early Access
                        </button>
                    </div>
                </div>

                {/* Features Section */}
                <div className="features-section">
                    <h2 className="section-title">Why TrustChain?</h2>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon" aria-hidden="true">D</div>
                            <h3>For Donors</h3>
                            <p>Verify how funds move from donation to impact with tamper-evident records.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon" aria-hidden="true">G</div>
                            <h3>For Government</h3>
                            <p>Monitor allocations, enforce compliance, and generate audit-ready reports.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon" aria-hidden="true">N</div>
                            <h3>For NGOs</h3>
                            <p>Manage projects with structured workflows, approvals, and transparent documentation.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon" aria-hidden="true">C</div>
                            <h3>For Citizens</h3>
                            <p>Access public information, validate activity, and support accountability.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon" aria-hidden="true">V</div>
                            <h3>For Vendors</h3>
                            <p>Submit invoices, track payment status, and maintain traceable service records.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon" aria-hidden="true">A</div>
                            <h3>For Auditors</h3>
                            <p>Verify transactions, flag anomalies, and support compliance reviews.</p>
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
