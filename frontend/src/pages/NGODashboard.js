import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import DashboardHeader from '../components/DashboardHeader';
import {useNavigate} from 'react-router-dom';
import './DashboardPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const NGODashboard = () => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const navigate = useNavigate();
    
    const [ngoDetails, setNgoDetails] = useState(null);
    const [schemes, setSchemes] = useState([]);
    
    const [showCreateProject, setShowCreateProject] = useState(false);
    const [showUploadDocs, setShowUploadDocs] = useState(false);
    const [showBeneficiaries, setShowBeneficiaries] = useState(false);

    const [projectForm, setProjectForm] = useState({
        schemeId: ''
    });

    const [stats, setStats] = useState({
        activeProjects: 0,
        beneficiaries: 0,
        fundsReceived: 0
    });

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            const token = await getToken();
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch NGO Details
            const ngoRes = await fetch(`${API_URL}/api/ngo/user/${user.id}`, { headers });
            if (ngoRes.ok) {
                const data = await ngoRes.json();
                setNgoDetails(data);
            }

            // Fetch Schemes (for project creation)
            const schemesRes = await fetch(`${API_URL}/api/scheme`, { headers });
            if (schemesRes.ok) {
                const data = await schemesRes.json();
                setSchemes(data);
            }

            // Mock Stats (can be real if endpoints exist)
            setStats({
                activeProjects: 2,
                beneficiaries: 150,
                fundsReceived: 500000
            });

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!ngoDetails) {
            alert("NGO details not found. Please contact support.");
            return;
        }
        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/api/manage`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ngo: { ngoId: ngoDetails.ngoId },
                    scheme: { schemeId: projectForm.schemeId }
                })
            });

            if (response.ok) {
                alert('Project created successfully!');
                setShowCreateProject(false);
                setProjectForm({ schemeId: '' });
                fetchDashboardData();
            } else {
                alert('Failed to create project');
            }
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Error creating project');
        }
    };

    return (
        <div className="dashboard-container">
            <DashboardHeader title="NGO Dashboard" role="ngo" />

            <div className="dashboard-content">
                <div className="dashboard-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📁</div>
                        <div className="stat-content">
                            <h3>Active Projects</h3>
                            <p className="stat-value">{stats.activeProjects}</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-content">
                            <h3>Beneficiaries</h3>
                            <p className="stat-value">{stats.beneficiaries}</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-content">
                            <h3>Funds Received</h3>
                            <p className="stat-value">₹{stats.fundsReceived.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="action-section">
                    <h2>Quick Actions</h2>
                    <div className="action-buttons">
                        <button 
                            className="action-btn secondary"
                            onClick={() => navigate('/ngo-kyc')}
                        >
                            Verify KYC
                        </button>
                        <button 
                            className="action-btn primary"
                            onClick={() => setShowCreateProject(true)}
                        >
                            Create Project
                        </button>
                        <button 
                            className="action-btn secondary"
                            onClick={() => setShowUploadDocs(true)}
                        >
                            Upload Documents
                        </button>
                        <button 
                            className="action-btn secondary"
                            onClick={() => setShowBeneficiaries(true)}
                        >
                            View Beneficiaries
                        </button>
                    </div>
                </div>
            </div>

            {/* Create Project Modal */}
            {showCreateProject && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Create New Project</h3>
                            <button className="close-btn" onClick={() => setShowCreateProject(false)}>×</button>
                        </div>
                        <form onSubmit={handleCreateProject}>
                            <div className="form-group">
                                <label>Select Scheme</label>
                                <select 
                                    value={projectForm.schemeId}
                                    onChange={(e) => setProjectForm({...projectForm, schemeId: e.target.value})}
                                    required
                                >
                                    <option value="">Select a Scheme</option>
                                    {schemes.map(scheme => (
                                        <option key={scheme.schemeId} value={scheme.schemeId}>
                                            {scheme.schemeName} (₹{scheme.budget})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="submit-btn">Create Project</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Upload Documents Modal (Mock) */}
            {showUploadDocs && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Upload Documents</h3>
                            <button className="close-btn" onClick={() => setShowUploadDocs(false)}>×</button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); alert("Document uploaded! IPFS Hash: QmHash..."); setShowUploadDocs(false); }}>
                            <div className="form-group">
                                <label>Document Type</label>
                                <select>
                                    <option>Impact Report</option>
                                    <option>Financial Statement</option>
                                    <option>Beneficiary List</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>File</label>
                                <input type="file" required />
                            </div>
                            <button type="submit" className="submit-btn">Upload</button>
                        </form>
                    </div>
                </div>
            )}

            {/* View Beneficiaries Modal (Mock) */}
            {showBeneficiaries && (
                <div className="modal-overlay">
                    <div className="modal-content large-modal">
                        <div className="modal-header">
                            <h3>Beneficiaries</h3>
                            <button className="close-btn" onClick={() => setShowBeneficiaries(false)}>×</button>
                        </div>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>ID</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>John Doe</td>
                                        <td className="monospace">BEN-001</td>
                                        <td><span className="status-badge success">Verified</span></td>
                                        <td>2024-01-15</td>
                                    </tr>
                                    <tr>
                                        <td>Jane Smith</td>
                                        <td className="monospace">BEN-002</td>
                                        <td><span className="status-badge pending">Pending</span></td>
                                        <td>2024-01-20</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NGODashboard;
