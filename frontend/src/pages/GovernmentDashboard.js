import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import DashboardHeader from '../components/DashboardHeader';
import CreateSchemeForm from '../components/CreateSchemeForm';
import './DashboardPage.css';

const GovernmentDashboard = () => {
    const { user } = useUser();
    const [showCreateForm, setShowCreateForm] = useState(false);

    return (
        <div className="dashboard-container">
            <DashboardHeader title="Government Dashboard" role="government" />

            <div className="dashboard-content">
                <div className="dashboard-grid">
                    <div className="stat-card">
                        <div className="stat-icon">🏛️</div>
                        <div className="stat-content">
                            <h3>Active Schemes</h3>
                            <p className="stat-value">0</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">💵</div>
                        <div className="stat-content">
                            <h3>Total Funds Allocated</h3>
                            <p className="stat-value">₹0</p>
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
                        <button className="action-btn secondary">Monitor Funds</button>
                        <button className="action-btn secondary">Generate Reports</button>
                    </div>
                </div>
            </div>

            {showCreateForm && (
                <CreateSchemeForm 
                    onClose={() => setShowCreateForm(false)}
                    onSuccess={(data) => {
                        console.log('Scheme created:', data);
                        // Optional: Refresh stats or list
                    }}
                />
            )}
        </div>
    );
};

export default GovernmentDashboard;
