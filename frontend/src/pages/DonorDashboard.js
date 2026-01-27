import React from 'react';
import { useUser } from '@clerk/clerk-react';
import DashboardHeader from '../components/DashboardHeader';
import './DashboardPage.css';

const DonorDashboard = () => {
    const { user } = useUser();

    return (
        <div className="dashboard-container">
            <DashboardHeader title="Donor Dashboard" role="donor" />

            <div className="dashboard-content">
                <div className="dashboard-grid">
                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-content">
                            <h3>Total Donations</h3>
                            <p className="stat-value">₹0</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-content">
                            <h3>Active Projects</h3>
                            <p className="stat-value">0</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <h3>Verified Transactions</h3>
                            <p className="stat-value">0</p>
                        </div>
                    </div>
                </div>

                <div className="action-section">
                    <h2>Quick Actions</h2>
                    <div className="action-buttons">
                        <button className="action-btn primary">Make a Donation</button>
                        <button className="action-btn secondary">View Projects</button>
                        <button className="action-btn secondary">Transaction History</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonorDashboard;
