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
    const [schemeUuid, setSchemeUuid] = useState('');
    const [milestoneId, setMilestoneId] = useState('');
    const [ipfsHash, setIpfsHash] = useState('');
    const [submitError, setSubmitError] = useState(null);
    const [submitTxHash, setSubmitTxHash] = useState(null);
    const [submitting, setSubmitting] = useState(false);

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

    const submitProofOnChain = async () => {
        setSubmitError(null);
        setSubmitTxHash(null);
        setSubmitting(true);
        try {
            if (!window.ethereum) {
                throw new Error('MetaMask is required to submit proof on-chain');
            }
            if (!schemeUuid || !milestoneId || !ipfsHash) {
                throw new Error('Scheme UUID, milestone ID, and IPFS hash are required');
            }
            const token = await getToken();
            const txResponse = await fetch(
                `${API_URL}/api/blockchain/tx/submitProof/${schemeUuid}/${milestoneId}?ipfsHash=${encodeURIComponent(ipfsHash)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            if (!txResponse.ok) {
                const errData = await txResponse.json().catch(() => ({}));
                throw new Error(errData?.message || 'Failed to build blockchain transaction');
            }
            const txData = await txResponse.json();
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const from = accounts?.[0];
            const sentHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [
                    {
                        from,
                        to: txData.to,
                        value: '0x0',
                        data: txData.data
                    }
                ]
            });
            setSubmitTxHash(sentHash);
        } catch (e) {
            setSubmitError(e?.message || 'Failed to submit proof');
        } finally {
            setSubmitting(false);
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

                <div className="action-section">
                    <h2>Submit Proof On-Chain</h2>
                    <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '16px', padding: '16px', display: 'grid', gap: '12px' }}>
                        <input
                            value={schemeUuid}
                            onChange={(e) => setSchemeUuid(e.target.value)}
                            placeholder="Scheme UUID (from app)"
                            style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(148, 163, 184, 0.25)', background: 'rgba(2, 6, 23, 0.35)', color: '#e2e8f0' }}
                        />
                        <input
                            value={milestoneId}
                            onChange={(e) => setMilestoneId(e.target.value)}
                            placeholder="Milestone ID (number)"
                            style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(148, 163, 184, 0.25)', background: 'rgba(2, 6, 23, 0.35)', color: '#e2e8f0' }}
                        />
                        <input
                            value={ipfsHash}
                            onChange={(e) => setIpfsHash(e.target.value)}
                            placeholder="IPFS CID (proof bundle)"
                            style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(148, 163, 184, 0.25)', background: 'rgba(2, 6, 23, 0.35)', color: '#e2e8f0' }}
                        />
                        <button
                            className="action-btn primary"
                            onClick={submitProofOnChain}
                            disabled={kycStatus !== 'VERIFIED' || submitting}
                            title={kycStatus !== 'VERIFIED' ? "Complete KYC first" : ""}
                            style={{ justifySelf: 'start' }}
                        >
                            {submitting ? 'Submitting...' : 'Submit Proof via MetaMask'}
                        </button>
                        {submitError && <div style={{ color: '#ef4444' }}>{submitError}</div>}
                        {submitTxHash && <div style={{ color: '#94a3b8', wordBreak: 'break-all' }}>Tx: {submitTxHash}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
