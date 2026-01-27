import React from 'react';
import { useUser } from '@clerk/clerk-react';
import DashboardHeader from '../components/DashboardHeader';
import './DashboardPage.css';

const VendorDashboard = () => {
    const { user } = useUser();

    return (
        <div className="dashboard-container">
            <DashboardHeader title="Vendor Dashboard" role="vendor" />

            <div className="dashboard-content">
                <div className="dashboard-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📦</div>
                        <div className="stat-content">
                            <h3>Active Orders</h3>
                            <p className="stat-value">0</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">📄</div>
                        <div className="stat-content">
                            <h3>Pending Invoices</h3>
                            <p className="stat-value">0</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">💳</div>
                        <div className="stat-content">
                            <h3>Total Payments</h3>
                            <p className="stat-value">₹0</p>
                        </div>
                    </div>
                </div>

                <div className="action-section">
                    <h2>Quick Actions</h2>
                    <div className="action-buttons">
                        <button className="action-btn primary">Submit Invoice</button>
                        <button className="action-btn secondary">View Orders</button>
                        <button className="action-btn secondary">Payment History</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
