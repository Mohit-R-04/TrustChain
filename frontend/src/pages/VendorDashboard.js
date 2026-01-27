import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import './DashboardPage.css';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const VendorDashboard = () => {
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const [kycStatus, setKycStatus] = useState('LOADING'); // LOADING, VERIFIED, PENDING

    useEffect(() => {
        if (isLoaded && user) {
            checkKycStatus();
        }
    }, [isLoaded, user]);

    const checkKycStatus = async () => {
        try {
            const token = await getToken();
            const headers = { 'Authorization': `Bearer ${token}` };

            // Check both records
            const [aadhaarRes, panRes] = await Promise.all([
                fetch(`${API_URL}/api/kyc/${user.id}/record`, { headers }),
                fetch(`${API_URL}/api/pan/${user.id}/record`, { headers })
            ]);

            if (aadhaarRes.ok && panRes.ok) {
                setKycStatus('VERIFIED');
            } else {
                setKycStatus('PENDING');
            }
        } catch (error) {
            console.error('Error checking KYC status:', error);
            setKycStatus('PENDING');
        }
    };

    return (
        <div className="dashboard-container">
            <DashboardHeader title="Vendor Dashboard" role="vendor" />

            <div className="dashboard-content">
                {/* KYC Alert Banner */}
                {kycStatus === 'PENDING' && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '16px',
                        padding: '24px',
                        marginBottom: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ fontSize: '32px' }}>⚠️</div>
                            <div>
                                <h3 style={{ color: '#ef4444', margin: '0 0 4px 0', fontSize: '18px' }}>Action Required: Complete KYC</h3>
                                <p style={{ color: '#e2e8f0', margin: 0, fontSize: '14px' }}>
                                    You must complete your KYC verification to start accepting orders and receiving payments.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/vendor-kyc')}
                            style={{
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '10px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '14px',
                                transition: 'all 0.2s'
                            }}
                        >
                            Complete Verification →
                        </button>
                    </div>
                )}

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
                        <button className="action-btn primary" disabled={kycStatus !== 'VERIFIED'} title={kycStatus !== 'VERIFIED' ? "Complete KYC first" : ""}>Submit Invoice</button>
                        <button className="action-btn secondary">View Orders</button>
                        <button className="action-btn secondary">Payment History</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
