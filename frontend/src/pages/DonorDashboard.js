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
    const [stats, setStats] = useState({
        totalDonations: 0,
        activeProjects: 0,
        verifiedTransactions: 0
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/api/donor/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                if (data.stats) {
                    setStats(data.stats);
                }
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const handleDonationSuccess = () => {
        fetchDashboardData();
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
                            <p className="stat-value">₹{stats.totalDonations}</p>
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
                        <button className="action-btn secondary">View Projects</button>
                        <button className="action-btn secondary">Transaction History</button>
                    </div>
                </div>
            </div>

            {showDonationModal && (
                <DonationForm 
                    onClose={() => setShowDonationModal(false)} 
                    onSuccess={handleDonationSuccess}
                />
            )}
        </div>
    );
};

export default DonorDashboard;
