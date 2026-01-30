import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import {
    HiShieldCheck,
    HiTrendingUp,
    HiCheckCircle,
    HiChartBar,
    HiSearch,
    HiLocationMarker,
    HiThumbUp,
    HiThumbDown,
    HiLockClosed,
    HiDocumentText,
    HiLink,
    HiEye,
    HiPlus,
    HiLightningBolt
} from 'react-icons/hi';
import './CitizenPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const CitizenPage = () => {
    const navigate = useNavigate();
    const { isSignedIn, user } = useUser();
    const { signOut } = useClerk();
    const [selectedLocation, setSelectedLocation] = React.useState('All');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [isPostModalOpen, setIsPostModalOpen] = React.useState(false);
    const [projects, setProjects] = React.useState([]);
    const [transparency, setTransparency] = React.useState(null);
    const [needs, setNeeds] = React.useState([]);
    const [needsLoading, setNeedsLoading] = React.useState(false);
    const [needsError, setNeedsError] = React.useState('');
    const [needsSearchQuery, setNeedsSearchQuery] = React.useState('');
    const [needsCategory, setNeedsCategory] = React.useState('All');

    // New state for OTP
    const [email, setEmail] = React.useState('');
    const [otp, setOtp] = React.useState('');
    const [isOtpSent, setIsOtpSent] = React.useState(false);
    const [isOtpVerified, setIsOtpVerified] = React.useState(false);
    const [otpVerificationToken, setOtpVerificationToken] = React.useState('');
    const [verificationStatus, setVerificationStatus] = React.useState('');
    const [timer, setTimer] = React.useState(0);

    const [needTitle, setNeedTitle] = React.useState('');
    const [needCategory, setNeedCategory] = React.useState('');
    const [needLocation, setNeedLocation] = React.useState('');
    const [needDescription, setNeedDescription] = React.useState('');

    const voterEmail = React.useMemo(() => {
        const fromClerk =
            user?.primaryEmailAddress?.emailAddress ||
            user?.emailAddresses?.[0]?.emailAddress;
        if (fromClerk) return fromClerk;
        const existing = window.localStorage.getItem('trustchain_guest_voter_email');
        if (existing) return existing;
        const id = (((window.crypto && typeof window.crypto.randomUUID === 'function') ? window.crypto.randomUUID() : null) || `${Date.now()}-${Math.random().toString(16).slice(2)}`).replace(/[^a-zA-Z0-9-]/g, '');
        const next = `guest-${id}@trustchain.local`;
        window.localStorage.setItem('trustchain_guest_voter_email', next);
        return next;
    }, [user]);

    const fetchNeeds = async () => {
        setNeedsLoading(true);
        setNeedsError('');
        try {
            const res = await fetch(`${API_URL}/api/community-needs`);
            if (!res.ok) {
                setNeedsError('Failed to load community needs.');
                return;
            }
            const data = await res.json();
            setNeeds(Array.isArray(data) ? data : []);
        } catch {
            setNeedsError('Failed to load community needs.');
        } finally {
            setNeedsLoading(false);
        }
    };

    const voteOnNeed = async (needId, value) => {
        try {
            const res = await fetch(`${API_URL}/api/community-needs/${needId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: voterEmail, value })
            });
            if (!res.ok) return;
            const updated = await res.json();
            setNeeds((prev) => prev.map((n) => (n.needId === updated.needId ? updated : n)));
        } catch {
        }
    };

    const formatPostedTime = (createdAt) => {
        if (!createdAt) return '';
        const d = new Date(createdAt);
        if (Number.isNaN(d.getTime())) return '';
        const diffMs = Date.now() - d.getTime();
        const seconds = Math.max(0, Math.floor(diffMs / 1000));
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`;
        if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
        if (minutes > 0) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
        return 'just now';
    };

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
            const response = await fetch(`${API_URL}/api/otp/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (response.ok) {
                setIsOtpSent(true);
                const text = await response.text().catch(() => '');
                setVerificationStatus(text || 'OTP sent to your email.');
                setTimer(30);
                setOtpVerificationToken('');
            } else {
                const text = await response.text().catch(() => '');
                setVerificationStatus(text || 'Failed to send OTP. Please try again.');
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
            const response = await fetch(`${API_URL}/api/otp/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });
            if (response.ok) {
                const data = await response.json().catch(() => null);
                if (data && data.verificationToken) {
                    setOtpVerificationToken(String(data.verificationToken));
                } else {
                    setOtpVerificationToken('');
                }
                setIsOtpVerified(true);
                setVerificationStatus('');
            } else {
                const data = await response.json().catch(() => null);
                if (data && data.message) {
                    setVerificationStatus(String(data.message));
                } else {
                    const text = await response.text().catch(() => '');
                    setVerificationStatus(text || 'Invalid or expired OTP.');
                }
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
        }
        return () => clearInterval(interval);
    }, [timer]);

    React.useEffect(() => {
        if (!isPostModalOpen) {
            setEmail('');
            setOtp('');
            setIsOtpSent(false);
            setIsOtpVerified(false);
            setOtpVerificationToken('');
            setVerificationStatus('');
            setTimer(0);
        }
    }, [isPostModalOpen]);

    const [isMainLoading, setIsMainLoading] = React.useState(true);

    React.useEffect(() => {
        const load = async () => {
            setIsMainLoading(true);
            try {
                const [tRes, pRes] = await Promise.all([
                    fetch(`${API_URL}/api/citizen/transparency`),
                    fetch(`${API_URL}/api/citizen/projects`)
                ]);
                if (tRes.ok) {
                    const tData = await tRes.json();
                    setTransparency(tData);
                }
                if (pRes.ok) {
                    const pData = await pRes.json();
                    setProjects(Array.isArray(pData?.projects) ? pData.projects : []);
                }
            } catch (err) {
                console.error('Failed to load citizen data:', err);
            } finally {
                setIsMainLoading(false);
            }
        };
        load();
        fetchNeeds();
    }, []);

    const locations = React.useMemo(() => ['All', ...new Set(projects.map(p => p.location).filter(Boolean))], [projects]);

    const filteredProjects = React.useMemo(() => {
        return projects.filter(project => {
            const matchesLocation = selectedLocation === 'All' || project.location === selectedLocation;
            const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.category.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesLocation && matchesSearch;
        });
    }, [projects, selectedLocation, searchQuery]);

    const filteredNeeds = React.useMemo(() => {
        return needs.filter((need) => {
            const title = String(need.title || '').toLowerCase();
            const location = String(need.location || '').toLowerCase();
            const q = needsSearchQuery.toLowerCase();
            const matchesSearch = title.includes(q) || location.includes(q);
            const matchesCategory = needsCategory === 'All' || need.category === needsCategory;
            return matchesSearch && matchesCategory;
        });
    }, [needs, needsSearchQuery, needsCategory]);

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
                    <HiLightningBolt className="logo-icon" size={32} />
                    <h2>Trust<span className="highlight">Chain</span></h2>
                </div>
                <button className="nav-login-btn" onClick={handleAuthAction}>
                    {isSignedIn ? 'Logout' : 'Home'}
                </button>
            </nav>

            <div className="citizen-hero">
                <div className="hero-content">
                    <div className="badge">
                        <HiShieldCheck className="badge-icon" size={20} />
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
                            <HiPlus size={18} style={{ marginRight: '8px' }} />
                            Post Community Needs
                        </button>
                    </div>
                </div>
            </div>

            <div className="stats-section">
                <div className="stat-box">
                    <div className="stat-icon-box"><HiTrendingUp size={40} /></div>
                    <h3>Total Funds</h3>
                    <p className="stat-number">{isMainLoading ? '...' : `₹${Number(transparency?.totalFundsInr || 0).toLocaleString()}`}</p>
                </div>

                <div className="stat-box">
                    <div className="stat-icon-box"><HiChartBar size={40} /></div>
                    <h3>Projects</h3>
                    <p className="stat-number">{isMainLoading ? '...' : Number(transparency?.projects || 0).toLocaleString()}</p>
                </div>

                <div className="stat-box">
                    <div className="stat-icon-box"><HiCheckCircle size={40} /></div>
                    <h3>Transactions Verified</h3>
                    <p className="stat-number">{isMainLoading ? '...' : Number(transparency?.transactionsVerified || 0).toLocaleString()}</p>
                </div>

                <div className="stat-box">
                    <div className="stat-icon-box"><HiChartBar size={40} /></div>
                    <h3>Utilization Rate</h3>
                    <p className="stat-number">{isMainLoading ? '...' : `${Number(transparency?.utilizationRate || 0).toFixed(0)}%`}</p>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h3 className="card-title">Fund Utilization Overview</h3>
                    <div className="utilization-chart">
                        {isMainLoading ? (
                            <div style={{ padding: '20px', color: '#94a3b8', textAlign: 'center' }}>Loading chart...</div>
                        ) : (
                            <>
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
                                        <span>{Number(transparency?.utilizationRate || 0).toFixed(0)}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill utilized" style={{ width: `${Number(transparency?.utilizationRate || 0).toFixed(0)}%` }}></div>
                                    </div>
                                </div>
                                <div className="chart-bar-container">
                                    <div className="chart-label">
                                        <span>In Escrow</span>
                                        <span>{(100 - Number(transparency?.utilizationRate || 0)).toFixed(0)}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill escrow" style={{ width: `${(100 - Number(transparency?.utilizationRate || 0)).toFixed(0)}%` }}></div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="dashboard-card">
                    <h3 className="card-title">Category Distribution</h3>
                    <div className="category-list">
                        {isMainLoading ? (
                            <div style={{ padding: '20px', color: '#94a3b8', textAlign: 'center' }}>Loading distribution...</div>
                        ) : (
                            (Array.isArray(transparency?.categoryDistribution) ? transparency.categoryDistribution : []).slice(0, 6).map((c) => {
                                const percent = Number(c?.percent || 0);
                                const label = c?.category || 'Other';
                                const cls = String(label).toLowerCase().replace(/\s+/g, '');
                                return (
                                    <div className="category-item" key={label}>
                                        <div className="category-info">
                                            <span>{label}</span>
                                            <span>{percent.toFixed(0)}%</span>
                                        </div>
                                        <div className="progress-bar small">
                                            <div className={`progress-fill ${cls}`} style={{ width: `${percent.toFixed(0)}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            <div className="projects-section">
                <div className="section-header">
                    <h2 className="section-title">Live Projects</h2>
                    <div className="search-filter-container">
                        <div className="search-box">
                            <span className="search-icon"><HiSearch size={18} /></span>
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
                    {isMainLoading ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                            Loading live projects...
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                            No projects match your search.
                        </div>
                    ) : (
                        filteredProjects.map((project) => (
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
                                        <p className="location"><HiLocationMarker size={14} style={{ display: 'inline', marginRight: '4px' }} /> {project.location}</p>
                                    </div>
                                    <span className={`category-tag ${String(project.category || '').toLowerCase()}`}>
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
                                        <p className="stat-value">₹{Number(project.amountInr || 0).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <span className="stat-label">Donors</span>
                                        <p className="stat-value">{Number(project.donors || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        )))
                    }
                </div>
            </div>

            <div className="citizen-needs-section">
                <div className="section-header">
                    <h2 className="section-title">Community Needs</h2>
                    <div className="needs-tools">
                        <div className="needs-search">
                            <span className="needs-search-icon"><HiSearch size={18} /></span>
                            <input
                                type="text"
                                placeholder="Search needs, locations..."
                                value={needsSearchQuery}
                                onChange={(e) => setNeedsSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="needs-filters">
                            {['All', 'Healthcare', 'Education', 'Water', 'Livelihood', 'Infrastructure'].map((cat) => (
                                <button
                                    key={cat}
                                    className={`needs-chip ${needsCategory === cat ? 'active' : ''}`}
                                    onClick={() => setNeedsCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {needsLoading ? (
                    <div className="needs-empty">Loading...</div>
                ) : needsError ? (
                    <div className="needs-empty">{needsError}</div>
                ) : filteredNeeds.length === 0 ? (
                    <div className="needs-empty">No community needs posted yet.</div>
                ) : (
                    <div className="needs-grid">
                        {filteredNeeds.map((need) => {
                            const statusRaw = String(need.status || '').toLowerCase();
                            const statusLabel = need.implementedSchemeId ? 'Official Scheme' : (need.status || 'open');
                            const postedTime = formatPostedTime(need.createdAt);

                            return (
                                <div key={need.needId} className="needs-card">
                                    <div className="needs-card-header">
                                        <span className={`needs-tag ${String(need.category || '').toLowerCase()}`}>{need.category}</span>
                                        <span className="needs-time">{postedTime}</span>
                                    </div>
                                    <div className="needs-title">{need.title}</div>
                                    <div className="needs-desc">{need.description}</div>
                                    <div className="needs-meta">
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><HiLocationMarker size={14} /> {need.location}</span>
                                    </div>
                                    <div className="needs-footer">
                                        <div className={`needs-status ${statusRaw.replace(/\s+/g, '-')}`}>
                                            {statusLabel}
                                        </div>
                                        <div className="needs-votes">
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><HiThumbUp size={14} /> {need.upvotes || 0}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><HiThumbDown size={14} /> {need.downvotes || 0}</span>
                                        </div>
                                    </div>
                                    <div className="needs-actions">
                                        <button className="needs-btn primary" onClick={() => voteOnNeed(need.needId, 1)}>
                                            Upvote
                                        </button>
                                        <button className="needs-btn" onClick={() => voteOnNeed(need.needId, -1)}>
                                            Downvote
                                        </button>
                                        {need.implementedSchemeId && (
                                            <button className="needs-btn" style={{ marginLeft: 'auto' }} onClick={() => navigate(`/projects/${need.implementedSchemeId}`)}>
                                                View Project
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="features-section">
                <h2 className="section-title">How TrustChain Works</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon"><HiLockClosed size={56} /></div>
                        <h3>Secure Escrow</h3>
                        <p>Funds locked in smart contracts until milestones are verified</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><HiDocumentText size={56} /></div>
                        <h3>IPFS Storage</h3>
                        <p>All documents stored on decentralized IPFS for transparency</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><HiLink size={56} /></div>
                        <h3>Blockchain Verified</h3>
                        <p>Every transaction recorded on Polygon blockchain</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><HiEye size={56} /></div>
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
                                            <div className="otp-input-container">
                                                <input
                                                    type="text"
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value)}
                                                    placeholder="Enter 6-digit OTP"
                                                    className="form-input"
                                                    maxLength={6}
                                                    style={{
                                                        letterSpacing: '4px',
                                                        fontSize: '1.2rem',
                                                        fontWeight: '700',
                                                        fontFamily: 'Orbitron, monospace',
                                                        textAlign: 'center',
                                                        paddingRight: '80px'
                                                    }}
                                                />
                                                {timer > 0 && (
                                                    <span className="otp-timer">
                                                        00:{timer < 10 ? `0${timer}` : timer}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn-primary"
                                            style={{ width: '100%', marginTop: '1rem' }}
                                            onClick={handleVerifyOtp}
                                        >
                                            Verify OTP
                                        </button>
                                        <button
                                            type="button"
                                            className="resend-button"
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
                                    <div className={`verification-status ${verificationStatus.includes('failed') || verificationStatus.includes('Invalid') || verificationStatus.includes('Error') ? 'error' : 'success'}`}>
                                        {verificationStatus}
                                    </div>
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
                                onSubmit={async (e) => {
                                    e.preventDefault();

                                    if (!needTitle.trim() || !needCategory || !needLocation.trim() || !needDescription.trim()) {
                                        setVerificationStatus('Please fill all fields before submitting.');
                                        return;
                                    }

                                    try {
                                        if (!otpVerificationToken) {
                                            setVerificationStatus('Please verify your email with OTP again.');
                                            setIsOtpVerified(false);
                                            return;
                                        }
                                        const response = await fetch(`${API_URL}/api/community-needs`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                title: needTitle.trim(),
                                                category: needCategory,
                                                location: needLocation.trim(),
                                                description: needDescription.trim(),
                                                email,
                                                otpVerificationToken
                                            })
                                        });

                                        if (response.ok) {
                                            setNeedTitle('');
                                            setNeedCategory('');
                                            setNeedLocation('');
                                            setNeedDescription('');
                                            fetchNeeds();
                                            setIsPostModalOpen(false);
                                        } else {
                                            setVerificationStatus('Failed to submit need. Please try again.');
                                        }
                                    } catch (error) {
                                        console.error('Error submitting community need:', error);
                                        setVerificationStatus('Error submitting need. Ensure backend is running.');
                                    }
                                }}
                            >
                                <div className="form-group">
                                    <label>What does your community need?</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Mobile health clinic for regular checkups"
                                        className="form-input"
                                        value={needTitle}
                                        onChange={(e) => setNeedTitle(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        className="form-select"
                                        value={needCategory}
                                        onChange={(e) => setNeedCategory(e.target.value)}
                                    >
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
                                        value={needLocation}
                                        onChange={(e) => setNeedLocation(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        placeholder="Explain the problem and how many people would benefit..."
                                        rows="4"
                                        className="form-textarea"
                                        value={needDescription}
                                        onChange={(e) => setNeedDescription(e.target.value)}
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
