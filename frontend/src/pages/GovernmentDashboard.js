import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import DashboardHeader from '../components/DashboardHeader';
import CreateSchemeForm from '../components/CreateSchemeForm';
import BlockchainPanel from '../components/BlockchainPanel';
import './DashboardPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const GovernmentDashboard = () => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showMonitorModal, setShowMonitorModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    
    const [stats, setStats] = useState({
        totalSchemes: 0,
        fundsAllocated: 0,
        pendingReviews: 0
    });
    
    const [transactions, setTransactions] = useState([]);
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
            
            // Fetch Schemes
            const schemesRes = await fetch(`${API_URL}/api/scheme`);
            if (schemesRes.ok) {
                const data = await schemesRes.json();
                setSchemes(data);
                setStats(prev => ({ 
                    ...prev, 
                    totalSchemes: data.length,
                    fundsAllocated: data.reduce((sum, s) => sum + (s.budget || 0), 0)
                }));
            }

            // Fetch Transactions (for Monitor Funds)
            const txRes = await fetch(`${API_URL}/api/transaction`, { headers });
            if (txRes.ok) {
                const data = await txRes.json();
                setTransactions(data);
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    return (
        <div className="dashboard-container">
            <DashboardHeader title="Government Dashboard" role="government" />

            <div className="dashboard-content">
                <div className="dashboard-grid">
                    <div className="stat-card">
                        <div className="stat-icon">🏛️</div>
                        <div className="stat-content">
                            <h3>Active Schemes</h3>
                            <p className="stat-value">{stats.totalSchemes}</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">💵</div>
                        <div className="stat-content">
                            <h3>Total Funds Allocated</h3>
                            <p className="stat-value">₹{stats.fundsAllocated.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">📈</div>
                        <div className="stat-content">
                            <h3>Beneficiaries Reached</h3>
                            <p className="stat-value">0</p>
                        </div>
                    </div>
                </div>

                <div className="action-section">
                    <h2>Quick Actions</h2>
                    <div className="action-buttons">
                        <button 
                            className="action-btn primary"
                            onClick={() => setShowCreateForm(true)}
                        >
                            Create New Scheme
                        </button>
                        <button 
                            className="action-btn secondary"
                            onClick={() => {
                                fetchDashboardData();
                                setShowMonitorModal(true);
                            }}
                        >
                            Monitor Funds
                        </button>
                        <button 
                            className="action-btn secondary"
                            onClick={() => {
                                fetchDashboardData();
                                setShowApproveModal(true);
                            }}
                        >
                            Approve Projects
                        </button>
                    </div>
                </div>

                <BlockchainPanel />
            </div>

            {/* Create Scheme Modal */}
            {showCreateForm && (
                <CreateSchemeForm 
                    onClose={() => setShowCreateForm(false)}
                    onSuccess={(data) => {
                        console.log('Scheme created:', data);
                        fetchDashboardData();
                        setShowCreateForm(false);
                    }}
                />
            )}

            {/* Monitor Funds Modal */}
            {showMonitorModal && (
                <div className="modal-overlay">
                    <div className="modal-content large-modal">
                        <div className="modal-header">
                            <h3>Fund Monitoring</h3>
                            <button className="close-btn" onClick={() => setShowMonitorModal(false)}>×</button>
                        </div>
                        <div className="table-container">
                            {transactions.length === 0 ? (
                                <p className="empty-state">No transactions found.</p>
                            ) : (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map(tx => (
                                            <tr key={tx.transactionId}>
                                                <td className="monospace">{tx.transactionId.substring(0, 8)}...</td>
                                                <td>₹{tx.amount}</td>
                                                <td>
                                                    <span className={`status-badge ${tx.status.toLowerCase()}`}>
                                                        {tx.status}
                                                    </span>
                                                </td>
                                                <td>{new Date(tx.timestamp).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Approve Projects Modal */}
            {showApproveModal && (
                <div className="modal-overlay">
                    <div className="modal-content large-modal">
                        <div className="modal-header">
                            <h3>Approve Projects</h3>
                            <button className="close-btn" onClick={() => setShowApproveModal(false)}>×</button>
                        </div>
                        <div className="table-container">
                            {schemes.length === 0 ? (
                                <p className="empty-state">No schemes found.</p>
                            ) : (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Scheme Name</th>
                                            <th>Budget</th>
                                            <th>Region</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {schemes.map(scheme => (
                                            <tr key={scheme.schemeId}>
                                                <td>{scheme.schemeName}</td>
                                                <td>₹{scheme.budget}</td>
                                                <td>{scheme.region}</td>
                                                <td>
                                                    <span className={`status-badge ${scheme.isFinished ? 'completed' : 'active'}`}>
                                                        {scheme.isFinished ? 'Finished' : 'Active'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="action-btn small">View Details</button>
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

export default GovernmentDashboard;
