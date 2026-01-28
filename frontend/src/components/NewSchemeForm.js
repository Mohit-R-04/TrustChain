import React, { useState } from 'react';
import './NewSchemeForm.css';

const NewSchemeForm = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        budget: '',
        region: '',
        beneficiaries: '',
        milestones: '',
        deadline: '',
        description: ''
    });

    const categories = [
        'Education',
        'Healthcare',
        'Infrastructure',
        'Agriculture',
        'Social Welfare',
        'Technology',
        'Environment'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Map form fields to backend entity
        const schemeData = {
            schemeName: formData.title, // Use formData.title
            budget: parseFloat(formData.budget), // Use formData.budget
            startDate: new Date().toISOString().split('T')[0], // Assuming start now
            endDate: formData.deadline,
            description: formData.description,
            category: formData.category,
            region: formData.region,
            isFinished: false
        };

        try {
            const response = await fetch("http://localhost:8080/api/scheme", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(schemeData),
            });

            if (response.ok) {
                alert("Scheme Published Successfully!");
                // Reset form or redirect
                setFormData({
                    title: "", // Use title
                    category: "",
                    budget: "", // Use budget
                    region: "",
                    beneficiaries: "",
                    milestones: "",
                    deadline: "",
                    description: ""
                });
                onClose(); // Close the modal after successful submission
                onSubmit(schemeData); // Call onSubmit with the successfully submitted data
            } else {
                alert("Failed to publish scheme.");
            }
        } catch (error) {
            console.error("Error publishing scheme:", error);
            alert("Error publishing scheme.");
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => {
            if (e.target.className === 'modal-overlay') onClose();
        }}>
            <div className="scheme-form-container">
                <div className="form-header">
                    <h2>Create New Scheme</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Scheme Title</label>
                            <input
                                type="text"
                                name="title"
                                className="form-input"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter scheme title"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Category</label>
                            <select
                                name="category"
                                className="form-select"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Budget Allocation (₹)</label>
                            <input
                                type="number"
                                name="budget"
                                className="form-input"
                                value={formData.budget}
                                onChange={handleChange}
                                placeholder="e.g. 5000000"
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Region / District</label>
                            <input
                                type="text"
                                name="region"
                                className="form-input"
                                value={formData.region}
                                onChange={handleChange}
                                placeholder="Enter target region"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Expected Beneficiaries</label>
                            <input
                                type="number"
                                name="beneficiaries"
                                className="form-input"
                                value={formData.beneficiaries}
                                onChange={handleChange}
                                placeholder="e.g. 1000"
                                min="1"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Number of Milestones</label>
                            <input
                                type="number"
                                name="milestones"
                                className="form-input"
                                value={formData.milestones}
                                onChange={handleChange}
                                placeholder="e.g. 5"
                                min="1"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Deadline</label>
                            <input
                                type="date"
                                name="deadline"
                                className="form-input"
                                value={formData.deadline}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Scheme Description</label>
                            <textarea
                                name="description"
                                className="form-textarea"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Detailed description of the scheme..."
                                required
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn">
                            <span>🚀</span> Publish Scheme On-Chain
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewSchemeForm;
