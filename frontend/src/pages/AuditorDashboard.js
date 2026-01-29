import React from 'react';
import { useUser } from '@clerk/clerk-react';
import DashboardHeader from '../components/DashboardHeader';
import BlockchainPanel from '../components/BlockchainPanel';
import './DashboardPage.css';

const AuditorDashboard = () => {
    const { user } = useUser();

    return (
        <div className="dashboard-container">
            <DashboardHeader title="Auditor Dashboard" role="auditor" />

            <div className="dashboard-content">
                <div className="dashboard-grid">
                    <div className="stat-card">
                        <div className="stat-icon">🔍</div>
                        <div className="stat-content">
                            <h3>Pending Audits</h3>
                            <p className="stat-value">0</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">⚠️</div>
                        <div className="stat-content">
                            <h3>Flagged Transactions</h3>
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
                        <button className="action-btn primary">Start Audit</button>
                        <button className="action-btn secondary">Flag Transaction</button>
                        <button className="action-btn secondary">Generate Report</button>
                    </div>
                </div>

                <BlockchainPanel />
            </div>
        </div>
    );
};

export default AuditorDashboard;
