import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import './CitizenPage.css';

const CitizenPage = () => {
    const navigate = useNavigate();
    const { isSignedIn } = useUser();
    const { signOut } = useClerk();

    const handleAuthAction = async () => {
        if (isSignedIn) {
            await signOut();
            navigate('/');
        } else {
            navigate('/');
        }
    };

    return (
        <div className="citizen-container">
            <nav className="citizen-nav">
                <div className="nav-logo">
                    <span className="logo-icon">🔗</span>
                    <h2>Trust<span className="highlight">Chain</span></h2>
                </div>
                <button className="nav-login-btn" onClick={handleAuthAction}>
                    {isSignedIn ? 'Logout' : 'Home'}
                </button>
            </nav>

            <div className="citizen-hero">
                <div className="hero-content">
                    <div className="badge">
                        <span className="badge-icon">🔷</span>
                        Polygon + IPFS Powered Governance
                    </div>
                    <h1 className="hero-title">
                        TrustChain – <span className="gradient-text">Governance for the Future</span>
                    </h1>
                    <p className="hero-description">
                        Donations are locked in escrow smart contracts and released only after
                        milestone proof verification through Polygon blockchain + IPFS storage.
                    </p>
                    <div className="hero-buttons">
                        <button className="btn-primary">Explore Transparency Dashboard</button>
                        <button className="btn-secondary">Donate via Stripe</button>
                    </div>
                    <div className="portal-buttons">
                        <button className="portal-btn government">
                            <span className="portal-icon">🏛️</span>
                            Government Portal
                        </button>
                        <button className="portal-btn community">
                            <span className="portal-icon">👥</span>
                            Community Needs Feed
                        </button>
                    </div>
                </div>
            </div>

            <div className="stats-section">
                <div className="stat-box">
                    <div className="stat-icon-box">🔒</div>
                    <h3>Funds in Escrow</h3>
                    <p className="stat-number">₹23,000,000</p>
                    <a href="#" className="stat-link">https://fund-arc.lovable.app/donor</a>
                </div>

                <div className="stat-box">
                    <div className="stat-icon-box">📋</div>
                    <h3>Active Schemes</h3>
                    <p className="stat-number">156</p>
                </div>

                <div className="stat-box">
                    <div className="stat-icon-box">👥</div>
                    <h3>Verified NGOs & Vendors</h3>
                    <p className="stat-number">428</p>
                </div>

                <div className="stat-box">
                    <div className="stat-icon-box">📄</div>
                    <h3>IPFS Documents</h3>
                    <p className="stat-number">12,847</p>
                </div>

                <div className="stat-box">
                    <div className="stat-icon-box">📈</div>
                    <h3>Transparent Payments</h3>
                    <p className="stat-number">8,934</p>
                </div>
            </div>

            <div className="features-section">
                <h2 className="section-title">How TrustChain Works</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🔐</div>
                        <h3>Secure Escrow</h3>
                        <p>Funds locked in smart contracts until milestones are verified</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📝</div>
                        <h3>IPFS Storage</h3>
                        <p>All documents stored on decentralized IPFS for transparency</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">⛓️</div>
                        <h3>Blockchain Verified</h3>
                        <p>Every transaction recorded on Polygon blockchain</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">👁️</div>
                        <h3>Full Transparency</h3>
                        <p>Track every rupee from donation to beneficiary</p>
                    </div>
                </div>
            </div>

            <footer className="citizen-footer">
                <p>Secured by blockchain technology • Transparent • Immutable</p>
            </footer>
        </div>
    );
};

export default CitizenPage;
