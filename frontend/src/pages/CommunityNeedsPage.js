import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import './CommunityNeedsPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const CommunityNeedsPage = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const [needs, setNeeds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const voterEmail = useMemo(() => {
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
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/api/community-needs`);
            if (!res.ok) {
                setError('Failed to load community needs.');
                return;
            }
            const data = await res.json();
            setNeeds(Array.isArray(data) ? data : []);
        } catch {
            setError('Failed to load community needs.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNeeds();
    }, []);

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

    const filteredNeeds = needs.filter((need) => {
        const title = String(need.title || '').toLowerCase();
        const location = String(need.location || '').toLowerCase();
        const q = searchQuery.toLowerCase();
        const matchesSearch = title.includes(q) || location.includes(q);
        const matchesCategory = selectedCategory === 'All' || need.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

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

    return (
        <div className="community-container">
            <nav className="community-nav">
                <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <span className="logo-icon">🔗</span>
                    <h2>Trust<span className="highlight">Chain</span></h2>
                </div>
                <button className="nav-back-btn" onClick={() => navigate('/citizen')}>
                    Back to Dashboard
                </button>
            </nav>

            <div className="community-content">
                <div className="hero-section">
                    <h1 className="hero-title">Community Needs Portal</h1>
                    <p className="hero-subtitle">
                        Voice your community's needs. Popular requests become official government schemes.
                    </p>
                    
                    <div className="search-filter-bar">
                        <div className="search-box">
                            <span className="search-icon">🔍</span>
                            <input 
                                type="text" 
                                placeholder="Search needs, locations..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="category-filters">
                            {['All', 'Healthcare', 'Education', 'Water', 'Livelihood', 'Infrastructure'].map(cat => (
                                <button 
                                    key={cat}
                                    className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <button className="post-need-btn" onClick={() => navigate('/citizen')}>
                            + Post New Need
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="needs-grid">
                        <p className="hero-subtitle">Loading...</p>
                    </div>
                ) : error ? (
                    <div className="needs-grid">
                        <p className="hero-subtitle">{error}</p>
                    </div>
                ) : (
                    <div className="needs-grid">
                        {filteredNeeds.map((need) => {
                            const statusRaw = String(need.status || '').toLowerCase();
                            const statusLabel = need.implementedSchemeId ? 'Official Scheme' : (need.status || 'open');
                            const postedTime = formatPostedTime(need.createdAt);

                            return (
                                <div key={need.needId} className="need-card">
                                    <div className="need-header">
                                        <span className={`category-tag ${String(need.category || '').toLowerCase()}`}>{need.category}</span>
                                        <span className="posted-time">{postedTime}</span>
                                    </div>

                                    <h3 className="need-title">{need.title}</h3>
                                    <p className="need-description">{need.description}</p>

                                    <div className="need-meta">
                                        <div className="location">
                                            <span className="icon">📍</span>
                                            {need.location}
                                        </div>
                                    </div>

                                    <div className="need-footer" style={{ justifyContent: 'space-between', gap: '12px' }}>
                                        <div className={`status-badge ${statusRaw.replace(/\s+/g, '-')}`}>
                                            <span className="status-dot"></span>
                                            {statusLabel}
                                        </div>

                                        <div style={{ display: 'inline-flex', gap: '10px', alignItems: 'center' }}>
                                            <span className="vote-count"><span className="icon">👍</span>{need.upvotes || 0}</span>
                                            <span className="vote-count"><span className="icon">👎</span>{need.downvotes || 0}</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                                        <button className="post-need-btn" style={{ padding: '10px 14px' }} onClick={() => voteOnNeed(need.needId, 1)}>
                                            Upvote
                                        </button>
                                        <button className="nav-back-btn" style={{ padding: '10px 14px' }} onClick={() => voteOnNeed(need.needId, -1)}>
                                            Downvote
                                        </button>
                                        {need.implementedSchemeId && (
                                            <button className="nav-back-btn" style={{ marginLeft: 'auto', padding: '10px 14px' }} onClick={() => navigate(`/projects/${need.implementedSchemeId}`)}>
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
        </div>
    );
};

export default CommunityNeedsPage;
