import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import './CitizenPage.css';

const CitizenPage = () => {
    const navigate = useNavigate();
    const { isSignedIn } = useUser();
    const { signOut } = useClerk();
    const [selectedLocation, setSelectedLocation] = React.useState('All');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [isPostModalOpen, setIsPostModalOpen] = React.useState(false);

    // New state for OTP
    const [email, setEmail] = React.useState('');
    const [otp, setOtp] = React.useState('');
    const [isOtpSent, setIsOtpSent] = React.useState(false);
    const [isOtpVerified, setIsOtpVerified] = React.useState(false);
    const [verificationStatus, setVerificationStatus] = React.useState('');
    const [timer, setTimer] = React.useState(0);

    const handleSendOtp = async () => {
        if (!email) {
            setVerificationStatus('Please enter an email address.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setVerificationStatus('Please enter a valid email address.');
            return;
        }

        setVerificationStatus('Sending OTP...');
        try {
            const response = await fetch('http://localhost:8080/api/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (response.ok) {
                setIsOtpSent(true);
                setVerificationStatus('OTP sent to your email.');
                setTimer(30); // Start 30 seconds timer
            } else {
                setVerificationStatus('Failed to send OTP. Please try again.');
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            setVerificationStatus('Error sending OTP. Ensure backend is running.');
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            setVerificationStatus('Please enter the OTP.');
            return;
        }
        try {
            const response = await fetch('http://localhost:8080/api/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });
            if (response.ok) {
                setIsOtpVerified(true);
                setVerificationStatus('');
            } else {
                setVerificationStatus('Invalid or expired OTP.');
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            setVerificationStatus('Error verifying OTP.');
        }
    };

    React.useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else if (timer === 0 && isOtpSent) {
            // Timer expired
        }
        return () => clearInterval(interval);
    }, [timer, isOtpSent]);

    React.useEffect(() => {
        if (!isPostModalOpen) {
            setEmail('');
            setOtp('');
            setIsOtpSent(false);
            setIsOtpVerified(false);
            setVerificationStatus('');
            setTimer(0);
        }
    }, [isPostModalOpen]);

    const projects = [
        {
            id: '0',
            title: "Clean Water Initiative",
            location: "Maharashtra",
            category: "Water",
            progress: 75,
            amount: "₹12,50,000",
            donors: "5,000"
        },
        {
            id: '1',
            title: "Rural Education Program",
            location: "Bihar",
            category: "Education",
            progress: 45,
            amount: "₹8,00,000",
            donors: "2,500"
        },
        {
            id: '2',
            title: "Health Camp Network",
            location: "Rajasthan",
            category: "Health",
            progress: 90,
            amount: "₹6,50,000",
            donors: "8,000"
        },
        {
            id: '3',
            title: "Solar Village Project",
            location: "Gujarat",
            category: "Infrastructure",
            progress: 30,
            amount: "₹15,00,000",
            donors: "3,000"
        },
        {
            id: '4',
            title: "Women Empowerment",
            location: "Uttar Pradesh",
            category: "Education",
            progress: 65,
            amount: "₹4,20,000",
            donors: "1,500"
        },
        {
            id: '5',
            title: "Tribal Healthcare",
            location: "Jharkhand",
            category: "Health",
            progress: 55,
            amount: "₹9,80,000",
            donors: "6,000"
        }
    ];

    const locations = ['All', ...new Set(projects.map(p => p.location))];

    const filteredProjects = projects.filter(project => {
        const matchesLocation = selectedLocation === 'All' || project.location === selectedLocation;
        const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesLocation && matchesSearch;
    });

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
                        Public Access - No Login Required
                    </div>
                    <h1 className="hero-title">
                        Every Transaction. <span className="gradient-text">Fully Transparent.</span>
                    </h1>
                    <p className="hero-description">
                        Verify NGO fund utilization in real-time. All data is stored immutably on the blockchain.
                    </p>
                    <div className="hero-buttons">
                        <button 
                            className="btn-primary"
                            onClick={() => setIsPostModalOpen(true)}
                        >
                            Post Community Needs
                        </button>
                    </div>
                </div>
            </div>

            <div className="stats-section">
                <div className="stat-box">
                    <div className="stat-icon-box">💰</div>
                    <h3>Total Funds</h3>
                    <p className="stat-number">₹23,500,000</p>
                </div>

                <div className="stat-box">
                    <div className="stat-icon-box">🚀</div>
                    <h3>Projects</h3>
                    <p className="stat-number">47</p>
                </div>

                <div className="stat-box">
                    <div className="stat-icon-box">✅</div>
                    <h3>Transactions Verified</h3>
                    <p className="stat-number">2,847</p>
                </div>

                <div className="stat-box">
                    <div className="stat-icon-box">📊</div>
                    <h3>Utilization Rate</h3>
                    <p className="stat-number">82%</p>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h3 className="card-title">Fund Utilization Overview</h3>
                    <div className="utilization-chart">
                        <div className="chart-bar-container">
                            <div className="chart-label">
                                <span>Donated</span>
                                <span>100%</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill donated" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                        <div className="chart-bar-container">
                            <div className="chart-label">
                                <span>Utilized</span>
                                <span>82%</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill utilized" style={{ width: '82%' }}></div>
                            </div>
                        </div>
                        <div className="chart-bar-container">
                            <div className="chart-label">
                                <span>In Escrow</span>
                                <span>18%</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill escrow" style={{ width: '18%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-card">
                    <h3 className="card-title">Category Distribution</h3>
                    <div className="category-list">
                        <div className="category-item">
                            <div className="category-info">
                                <span>Water</span>
                                <span>35%</span>
                            </div>
                            <div className="progress-bar small">
                                <div className="progress-fill water" style={{ width: '35%' }}></div>
                            </div>
                        </div>
                        <div className="category-item">
                            <div className="category-info">
                                <span>Education</span>
                                <span>28%</span>
                            </div>
                            <div className="progress-bar small">
                                <div className="progress-fill education" style={{ width: '28%' }}></div>
                            </div>
                        </div>
                        <div className="category-item">
                            <div className="category-info">
                                <span>Health</span>
                                <span>22%</span>
                            </div>
                            <div className="progress-bar small">
                                <div className="progress-fill health" style={{ width: '22%' }}></div>
                            </div>
                        </div>
                        <div className="category-item">
                            <div className="category-info">
                                <span>Infrastructure</span>
                                <span>15%</span>
                            </div>
                            <div className="progress-bar small">
                                <div className="progress-fill infrastructure" style={{ width: '15%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="projects-section">
                <div className="section-header">
                    <h2 className="section-title">Live Projects</h2>
                    <div className="search-filter-container">
                        <div className="search-box">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Search projects, locations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <div className="location-filter">
                            <select
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                className="location-select"
                            >
                                <option value="All">All States</option>
                                {locations.filter(l => l !== 'All').map(location => (
                                    <option key={location} value={location}>{location}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="projects-grid">
                    {filteredProjects.map((project) => (
                        <div
                            className="project-card"
                            key={project.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => navigate(`/projects/${project.id}`, { state: { project } })}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    navigate(`/projects/${project.id}`, { state: { project } });
                                }
                            }}
                        >
                            <div className="project-header">
                                <div>
                                    <h3>{project.title}</h3>
                                    <p className="location">📍 {project.location}</p>
                                </div>
                                <span className={`category-tag ${project.category.toLowerCase()}`}>
                                    {project.category}
                                </span>
                            </div>
                            <div className="project-progress">
                                <div className="progress-info">
                                    <span>Progress</span>
                                    <span>{project.progress}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill" 
                                        style={{ width: `${project.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="project-stats">
                                <div>
                                    <span className="stat-label">Amount</span>
                                    <p className="stat-value">{project.amount}</p>
                                </div>
                                <div>
                                    <span className="stat-label">Donors</span>
                                    <p className="stat-value">{project.donors}</p>
                                </div>
                            </div>
                        </div>
                    ))}
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

            {isPostModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content animate-scale-in">
                        <h2 className="modal-title">Post a Community Need</h2>
                        
                        {!isOtpVerified ? (
                            <div className="otp-verification-section">
                                <p style={{ marginBottom: '1rem', color: '#666' }}>
                                    Please verify your email to post a community need.
                                </p>
                                
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="form-input"
                                        disabled={isOtpSent}
                                    />
                                </div>

                                {!isOtpSent ? (
                                    <button 
                                        type="button" 
                                        className="btn-primary"
                                        style={{ width: '100%', marginTop: '0.5rem' }}
                                        onClick={handleSendOtp}
                                        disabled={!email}
                                    >
                                        Send OTP
                                    </button>
                                ) : (
                                    <>
                                        <div className="form-group" style={{ marginTop: '1rem' }}>
                                            <label>Enter OTP</label>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type="text"
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value)}
                                                    placeholder="Enter 6-digit OTP"
                                                    className="form-input"
                                                    maxLength={6}
                                                    style={{ letterSpacing: '2px', fontSize: '1.1rem', fontWeight: '500' }}
                                                />
                                                {timer > 0 && (
                                                    <span style={{
                                                        position: 'absolute',
                                                        right: '12px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        color: '#2563eb',
                                                        fontWeight: '600',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        00:{timer < 10 ? `0${timer}` : timer}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button 
                                            type="button" 
                                            className="btn-primary"
                                            style={{ width: '100%', marginTop: '0.5rem' }}
                                            onClick={handleVerifyOtp}
                                        >
                                            Verify OTP
                                        </button>
                                        <button 
                                            type="button" 
                                            style={{ 
                                                background: 'none', 
                                                border: 'none', 
                                                color: timer > 0 ? '#94a3b8' : '#2563eb', 
                                                textDecoration: 'underline', 
                                                cursor: timer > 0 ? 'not-allowed' : 'pointer',
                                                marginTop: '0.5rem',
                                                fontSize: '0.875rem'
                                            }}
                                            onClick={() => { 
                                                if (timer === 0) {
                                                    setIsOtpSent(false); 
                                                    setOtp(''); 
                                                    setVerificationStatus(''); 
                                                }
                                            }}
                                            disabled={timer > 0}
                                        >
                                            {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP / Change Email'}
                                        </button>
                                    </>
                                )}
                                
                                {verificationStatus && (
                                    <p style={{ 
                                        marginTop: '1rem', 
                                        fontSize: '0.875rem', 
                                        color: verificationStatus.includes('failed') || verificationStatus.includes('Invalid') || verificationStatus.includes('Error') ? '#ef4444' : '#22c55e' 
                                    }}>
                                        {verificationStatus}
                                    </p>
                                )}
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    style={{ width: '100%', marginTop: '1rem' }}
                                    onClick={() => setIsPostModalOpen(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                        <form
                            className="modal-form"
                            onSubmit={(e) => {
                                e.preventDefault();
                                setIsPostModalOpen(false);
                            }}
                        >
                            <div className="form-group">
                                <label>What does your community need?</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Mobile health clinic for regular checkups"
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select className="form-select">
                                    <option value="">Select category</option>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="Education">Education</option>
                                    <option value="Water">Water</option>
                                    <option value="Livelihood">Livelihood</option>
                                    <option value="Infrastructure">Infrastructure</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    placeholder="Village/Town, District, State"
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    placeholder="Explain the problem and how many people would benefit..."
                                    rows="4"
                                    className="form-textarea"
                                ></textarea>
                            </div>
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => setIsPostModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit">
                                    Submit Need
                                </button>
                            </div>
                        </form>
                        )}
                    </div>
                </div>
            )}

            <footer className="citizen-footer">
                <p>Secured by blockchain technology • Transparent • Immutable</p>
            </footer>
        </div>
    );
};

export default CitizenPage;
