import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import DashboardHeader from '../components/DashboardHeader';
import DonationForm from '../components/DonationForm';
import './DashboardPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const DonorDashboard = () => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const [showDonationModal, setShowDonationModal] = useState(false);
    const [showProjectsModal, setShowProjectsModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    
    const [stats, setStats] = useState({
        totalDonations: 0,
        activeProjects: 0,
        verifiedTransactions: 0
    });
    
    const [donations, setDonations] = useState([]);
    const [schemes, setSchemes] = useState([]);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            const token = await getToken();
            const headers = { 'Authorization': `Bearer ${token}` };
            
            // Fetch Donor Stats & Dashboard Data
            const response = await fetch(`${API_URL}/api/donor/dashboard`, { headers });
            if (response.ok) {
                const data = await response.json();
                if (data.stats) {
                    setStats(data.stats);
                }
            }

            // Fetch Donations (for History)
            const donationRes = await fetch(`${API_URL}/api/donation/user/${user.id}`, { headers });
            if (donationRes.ok) {
                const data = await donationRes.json();
                setDonations(data);
            }

            // Fetch Schemes (for Projects view)
            const schemesRes = await fetch(`${API_URL}/api/scheme`, { headers });
            if (schemesRes.ok) {
                const data = await schemesRes.json();
                setSchemes(data);
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const handleDonationSuccess = () => {
        fetchDashboardData();
        setShowDonationModal(false);
    };

    return (
        <div className="dashboard-container">
            <DashboardHeader title="Donor Dashboard" role="donor" />

            <div className="dashboard-content">
                <div className="dashboard-grid">
                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-content">
                            <h3>Total Donations</h3>
                            <p className="stat-value">₹{stats.totalDonations.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-content">
                            <h3>Active Projects</h3>
                            <p className="stat-value">{stats.activeProjects}</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <h3>Verified Transactions</h3>
                            <p className="stat-value">{stats.verifiedTransactions}</p>
                        </div>
                    </div>
                </div>

                <div className="action-section">
                    <h2>Quick Actions</h2>
                    <div className="action-buttons">
                        <button 
                            className="action-btn primary"
                            onClick={() => setShowDonationModal(true)}
                        >
                            Make a Donation
                        </button>
                        <button 
                            className="action-btn secondary"
                            onClick={() => setShowProjectsModal(true)}
                        >
                            View Projects
                        </button>
                        <button 
                            className="action-btn secondary"
                            onClick={() => setShowHistoryModal(true)}
                        >
                            Transaction History
                        </button>
                    </div>
                </div>
            </div>

            {/* Donation Modal */}
            {showDonationModal && (
                <DonationForm 
                    onClose={() => setShowDonationModal(false)} 
                    onSuccess={handleDonationSuccess}
                />
            )}

            {/* View Projects Modal */}
            {showProjectsModal && (
                <div className="modal-overlay">
                    <div className="modal-content large-modal">
                        <div className="modal-header">
                            <h3>Active Projects</h3>
                            <button className="close-btn" onClick={() => setShowProjectsModal(false)}>×</button>
                        </div>
                        <div className="table-container">
                            {schemes.length === 0 ? (
                                <p className="empty-state">No projects available.</p>
                            ) : (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Project Name</th>
                                            <th>Region</th>
                                            <th>Budget</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {schemes.map(scheme => (
                                            <tr key={scheme.schemeId}>
                                                <td>{scheme.schemeName}</td>
                                                <td>{scheme.region}</td>
                                                <td>₹{scheme.budget.toLocaleString()}</td>
                                                <td>
                                                    <span className={`status-badge ${scheme.isFinished ? 'completed' : 'active'}`}>
                                                        {scheme.isFinished ? 'Completed' : 'Active'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Transaction History Modal */}
            {showHistoryModal && (
                <div className="modal-overlay">
                    <div className="modal-content large-modal">
                        <div className="modal-header">
                            <h3>Transaction History</h3>
                            <button className="close-btn" onClick={() => setShowHistoryModal(false)}>×</button>
                        </div>
                        <div className="table-container">
                            {donations.length === 0 ? (
                                <p className="empty-state">No donations found.</p>
                            ) : (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Project</th>
                                            <th>Amount</th>
                                            <th>Transaction Ref</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {donations.map(donation => (
                                            <tr key={donation.donationId}>
                                                <td>{new Date(donation.timestamp).toLocaleDateString()}</td>
                                                <td>{donation.scheme ? donation.scheme.schemeName : 'Unknown'}</td>
                                                <td>₹{donation.amount.toLocaleString()}</td>
                                                <td className="monospace">{donation.transactionRef}</td>
                                                <td>
                                                    <span className="status-badge success">Completed</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DonorDashboard;
