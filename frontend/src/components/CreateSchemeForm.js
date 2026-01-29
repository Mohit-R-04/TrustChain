import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import './CreateSchemeForm.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const CreateSchemeForm = ({ onClose, onSuccess, govtType }) => {
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        schemeName: '',
        category: '',
        budget: '',
        region: '',
        expectedBeneficiaries: '',
        milestoneCount: '',
        deadline: '',
        description: '',
        schemeType: 'CENTRAL_MANDATORY'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = await getToken();
            const payload = {
                schemeName: formData.schemeName,
                category: formData.category,
                budget: parseFloat(formData.budget),
                region: formData.region,
                expectedBeneficiaries: parseInt(formData.expectedBeneficiaries),
                milestoneCount: parseInt(formData.milestoneCount),
                endDate: formData.deadline, // Mapping deadline to endDate
                description: formData.description,
                isFinished: false,
                schemeType: govtType === 'CENTRAL' ? formData.schemeType : 'STATE'
            };

            const response = await fetch(`${API_URL}/api/scheme`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                if (onSuccess) onSuccess(data);
                onClose();
            } else {
                const errData = await response.json().catch(() => ({}));
                setError(errData.message || 'Failed to create scheme');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="scheme-form-container">
                <div className="form-header">
                    <h2>Publish New Welfare Scheme</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Scheme Title</label>
                            <input
                                type="text"
                                name="schemeName"
                                placeholder="e.g., Rural Healthcare Initiative"
                                value={formData.schemeName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {govtType === 'CENTRAL' && (
                            <div className="form-group">
                                <label>Scheme Type</label>
                                <select
                                    name="schemeType"
                                    value={formData.schemeType}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="CENTRAL_MANDATORY">Mandatory for States</option>
                                    <option value="CENTRAL_OPTIONAL">Optional for States</option>
                                </select>
                            </div>
                        )}

                        <div className="form-group">
                            <label>Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select category</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="Education">Education</option>
                                <option value="Infrastructure">Infrastructure</option>
                                <option value="Agriculture">Agriculture</option>
                                <option value="Social Welfare">Social Welfare</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Budget Allocation (₹)</label>
                            <input
                                type="number"
                                name="budget"
                                placeholder="e.g., 5000000"
                                value={formData.budget}
                                onChange={handleChange}
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Region/District</label>
                            <input
                                type="text"
                                name="region"
                                placeholder="e.g., Karnataka"
                                value={formData.region}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Expected Beneficiaries</label>
                            <input
                                type="number"
                                name="expectedBeneficiaries"
                                placeholder="e.g., 10000"
                                value={formData.expectedBeneficiaries}
                                onChange={handleChange}
                                min="1"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Number of Milestones</label>
                            <input
                                type="number"
                                name="milestoneCount"
                                placeholder="e.g., 4"
                                value={formData.milestoneCount}
                                onChange={handleChange}
                                min="1"
                                required
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Deadline</label>
                            <input
                                type="date"
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Description</label>
                            <textarea
                                name="description"
                                placeholder="Describe the scheme objectives and expected outcomes..."
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                required
                            ></textarea>
                        </div>
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Publishing...' : '⬆ Publish Scheme On-Chain'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateSchemeForm;
