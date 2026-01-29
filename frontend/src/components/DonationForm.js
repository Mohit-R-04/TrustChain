import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DonationForm.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const DonationForm = ({ onClose }) => {
    const navigate = useNavigate();
    const [schemes, setSchemes] = useState([]);
    const [selectedSchemeId, setSelectedSchemeId] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSchemes();
    }, []);

    const fetchSchemes = async () => {
        try {
            const response = await fetch(`${API_URL}/api/scheme`, {
                method: 'GET'
            });
            if (response.ok) {
                const data = await response.json();
                setSchemes(Array.isArray(data) ? data : []);
            } else {
                setError('Failed to load schemes');
            }
        } catch (err) {
            setError(err?.message || 'Failed to load schemes');
        }
    };

    const handleProceed = (e) => {
        e.preventDefault();
        setError(null);

        const selected = schemes.find((s) => s?.schemeId === selectedSchemeId);
        if (!selected) {
            setError('Please select a scheme');
            return;
        }

        // Redirect to payment page with scheme details
        navigate('/payment', { 
            state: { 
                schemeId: selected.schemeId, 
                schemeName: selected.schemeName 
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
                            value={selectedSchemeId}
                            onChange={(e) => setSelectedSchemeId(e.target.value)}
                            required
                        >
                            <option value="">Choose a scheme</option>
                            {schemes.map((s) => (
                                <option key={s.schemeId} value={s.schemeId}>
                                    {s.schemeName}
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
                        disabled={!selectedSchemeId}
                    >
                        <span>💳</span> Pay with Stripe
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DonationForm;
