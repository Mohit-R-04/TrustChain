import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CommunityNeedsPage.css';

const CommunityNeedsPage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Mock data based on the reference design
    const [needs, setNeeds] = useState([
        {
            id: 1,
            title: "Mobile Health Clinic for Remote Villages",
            description: "Many elderly and pregnant women in remote villages cannot travel to hospitals. Need a mobile health unit for regular checkups.",
            category: "Healthcare",
            location: "Tumkur District, Karnataka",
            author: "Ramesh K.",
            status: "in review",
            postedTime: "2 days ago",
            votes: 124
        },
        {
            id: 2,
            title: "School Bus for Tribal Children",
            description: "Children from tribal areas walk 8km daily to reach school. A dedicated school bus would increase attendance.",
            category: "Education",
            location: "Wayanad, Kerala",
            author: "Priya M.",
            status: "accepted",
            statusNote: "EduCare NGO has shown interest",
            postedTime: "5 days ago",
            votes: 89
        },
        {
            id: 3,
            title: "Clean Drinking Water Purifier",
            description: "Our village relies on bore water which has high fluoride content. Children are developing dental fluorosis.",
            category: "Water",
            location: "Jaisalmer, Rajasthan",
            author: "Fatima B.",
            status: "official",
            statusNote: "WaterAid has adopted this need",
            officialNote: "Converted to official scheme on Jan 20",
            postedTime: "1 week ago",
            votes: 256
        },
        {
            id: 4,
            title: "Evening Skill Training Classes",
            description: "Young adults working in small jobs want to learn computer skills and English. Need evening classes.",
            category: "Livelihood",
            location: "Dharavi, Mumbai",
            author: "Amit S.",
            status: "open",
            postedTime: "3 days ago",
            votes: 45
        }
    ]);

    const filteredNeeds = needs.filter(need => {
        const matchesSearch = need.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              need.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || need.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

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
                        <button className="post-need-btn" onClick={() => setIsModalOpen(true)}>
                            + Post New Need
                        </button>
                    </div>
                </div>

                <div className="needs-grid">
                    {filteredNeeds.map(need => (
                        <div key={need.id} className="need-card">
                            <div className="need-header">
                                <span className={`category-tag ${need.category.toLowerCase()}`}>{need.category}</span>
                                <span className="posted-time">{need.postedTime}</span>
                            </div>
                            
                            <h3 className="need-title">{need.title}</h3>
                            <p className="need-description">{need.description}</p>
                            
                            <div className="need-meta">
                                <div className="location">
                                    <span className="icon">📍</span>
                                    {need.location}
                                </div>
                                <div className="author">
                                    by {need.author}
                                </div>
                            </div>

                            <div className="need-footer">
                                <div className={`status-badge ${need.status.replace(' ', '-')}`}>
                                    <span className="status-dot"></span>
                                    {need.status === 'official' ? 'Official Scheme' : need.status}
                                </div>
                                <div className="vote-count">
                                    <span className="icon">👍</span>
                                    {need.votes}
                                </div>
                            </div>

                            {need.statusNote && (
                                <div className="status-note">
                                    <span className="icon">🤝</span>
                                    {need.statusNote}
                                </div>
                            )}
                            
                            {need.officialNote && (
                                <div className="official-note">
                                    <span className="icon">✅</span>
                                    {need.officialNote}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content animate-scale-in">
                            <h2 className="modal-title">Post a Community Need</h2>
                            <form className="modal-form" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
                                <div className="form-group">
                                    <label>What does your community need?</label>
                                    <input type="text" placeholder="e.g., Mobile health clinic for regular checkups" className="form-input" />
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
                                    <input type="text" placeholder="Village/Town, District, State" className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea placeholder="Explain the problem and how many people would benefit..." rows="4" className="form-textarea"></textarea>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-submit">Submit Need</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityNeedsPage;
