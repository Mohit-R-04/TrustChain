import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import './DonationForm.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const DonationForm = ({ onClose }) => {
    const { getToken } = useAuth();
    const navigate = useNavigate();
    // Display names hardcoded as requested
    const [schemes] = useState([
        'Education for All',
        'Clean Water Initiative',
        'Healthcare Support',
    ]);
    // Map of schemeName -> schemeId fetched from backend
    const [nameToId, setNameToId] = useState({});
    const [selectedSchemeName, setSelectedSchemeName] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        // Try to fetch actual IDs from backend to avoid "scheme not found"
        fetchSchemes();
    }, []);

    const fetchSchemes = async () => {
        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/api/scheme`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                const map = {};
                data.forEach(s => {
                    if (s.schemeName && s.schemeId) {
                        map[s.schemeName] = s.schemeId;
                    }
                });
                setNameToId(map);
            } else {
                console.error('Failed to fetch schemes');
            }
        } catch (err) {
            console.error('Error fetching schemes:', err);
        }
    };

    const handleProceed = (e) => {
        e.preventDefault();
        setError(null);

        // Hardcoded fallback IDs used only if backend mapping is unavailable
        const fallbackIds = {
            'Education for All': '11111111-1111-1111-1111-111111111111',
            'Clean Water Initiative': '22222222-2222-2222-2222-222222222222',
            'Healthcare Support': '33333333-3333-3333-3333-333333333333',
        };
        const schemeIdToUse = nameToId[selectedSchemeName] || fallbackIds[selectedSchemeName];
        
        if (!schemeIdToUse) {
            setError('Please select a valid scheme');
            return;
        }

        // Redirect to payment page with scheme details
        navigate('/payment', { 
            state: { 
                schemeId: schemeIdToUse, 
                schemeName: selectedSchemeName 
            } 
        });
        onClose();
    };

    return (
        <div className="donation-modal-overlay">
            <div className="donation-form-container">
                <div className="donation-form-header">
                    <h2>Donate to Welfare Scheme</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleProceed}>
                    <div className="form-group">
                        <label className="form-label">Select Scheme</label>
                        <select 
                            className="form-select"
                            value={selectedSchemeName}
                            onChange={(e) => setSelectedSchemeName(e.target.value)}
                            required
                        >
                            <option value="">Choose a scheme</option>
                            {schemes.map(name => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="escrow-note">
                        <div className="escrow-title">
                            🔒 Your funds will be locked in escrow
                        </div>
                        <p className="escrow-desc">
                            Released only after milestone verification by NGO, Donor & Auditor
                        </p>
                    </div>

                    <button 
                        type="submit" 
                        className="pay-btn"
                        disabled={!selectedSchemeName}
                    >
                        <span>💳</span> Pay with Stripe
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DonationForm;
