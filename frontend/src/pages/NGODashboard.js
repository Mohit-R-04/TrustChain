import React, { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import DashboardHeader from '../components/DashboardHeader';
import './DashboardPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const NGODashboard = () => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const [schemeUuid, setSchemeUuid] = useState('');
    const [milestoneId, setMilestoneId] = useState('');
    const [amountEth, setAmountEth] = useState('');
    const [vendorAddress, setVendorAddress] = useState('');
    const [ipfsHash, setIpfsHash] = useState('');
    const [toAddress, setToAddress] = useState('');
    const [actionError, setActionError] = useState(null);
    const [actionResult, setActionResult] = useState(null);
    const [recentEvents, setRecentEvents] = useState([]);

    const INR_PER_POL = window.BigInt('10000000');
    const WEI_PER_POL = window.BigInt('1000000000000000000');

    const formatInrBigInt = (inr) => {
        try {
            const s0 = window.BigInt(inr).toString();
            const s = s0.startsWith('-') ? s0.slice(1) : s0;
            if (s.length <= 3) return (s0.startsWith('-') ? '-' : '') + s;
            const last3 = s.slice(-3);
            let rest = s.slice(0, -3);
            const parts = [];
            while (rest.length > 2) {
                parts.unshift(rest.slice(-2));
                rest = rest.slice(0, -2);
            }
            if (rest) parts.unshift(rest);
            const out = `${parts.join(',')},${last3}`;
            return s0.startsWith('-') ? `-${out}` : out;
        } catch {
            return '0';
        }
    };

    const weiToInr = (weiStr) => {
        try {
            if (!weiStr) return null;
            const wei = window.BigInt(weiStr);
            return (wei * INR_PER_POL) / WEI_PER_POL;
        } catch {
            return null;
        }
    };

    useEffect(() => {
        fetchRecentEvents();
    }, []);

    const fetchRecentEvents = async () => {
        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/api/blockchain/events/recent`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setRecentEvents(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error('Error fetching blockchain events:', e);
        }
    };

    const post = async (path) => {
        setActionError(null);
        setActionResult(null);
        const token = await getToken();
        const response = await fetch(`${API_URL}${path}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data?.message || 'Blockchain request failed');
        }
        setActionResult(data);
        await fetchRecentEvents();
    };

    const runAction = async (path) => {
        try {
            await post(path);
        } catch (e) {
            setActionError(e?.message || 'Blockchain request failed');
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
                            <p className="stat-value">0</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-content">
                            <h3>Beneficiaries</h3>
                            <p className="stat-value">0</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-content">
                            <h3>Funds Received</h3>
                            <p className="stat-value">₹0</p>
                        </div>
                    </div>
                </div>

                <div className="action-section">
                    <h2>Quick Actions</h2>
                    <div className="action-buttons">
                        <button className="action-btn primary">Create Project</button>
                        <button className="action-btn secondary">Upload Documents</button>
                        <button className="action-btn secondary">View Beneficiaries</button>
                    </div>
                </div>

                <div className="action-section">
                    <h2>Blockchain Admin</h2>
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
                            value={amountEth}
                            onChange={(e) => setAmountEth(e.target.value)}
                            placeholder="Amount (POL) for milestone"
                            style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(148, 163, 184, 0.25)', background: 'rgba(2, 6, 23, 0.35)', color: '#e2e8f0' }}
                        />
                        <input
                            value={vendorAddress}
                            onChange={(e) => setVendorAddress(e.target.value)}
                            placeholder="Vendor wallet (0x...)"
                            style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(148, 163, 184, 0.25)', background: 'rgba(2, 6, 23, 0.35)', color: '#e2e8f0' }}
                        />
                        <input
                            value={ipfsHash}
                            onChange={(e) => setIpfsHash(e.target.value)}
                            placeholder="IPFS hash (quotation/proof)"
                            style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(148, 163, 184, 0.25)', background: 'rgba(2, 6, 23, 0.35)', color: '#e2e8f0' }}
                        />
                        <input
                            value={toAddress}
                            onChange={(e) => setToAddress(e.target.value)}
                            placeholder="Refund to address (0x...)"
                            style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(148, 163, 184, 0.25)', background: 'rgba(2, 6, 23, 0.35)', color: '#e2e8f0' }}
                        />
                        <div className="action-buttons">
                            <button className="action-btn primary" onClick={() => runAction(`/api/blockchain/schemes/${schemeUuid}/create`)}>Create Scheme</button>
                            <button className="action-btn secondary" onClick={() => runAction(`/api/blockchain/schemes/${schemeUuid}/lock`)}>Lock Funds</button>
                            <button className="action-btn secondary" onClick={() => runAction(`/api/blockchain/schemes/${schemeUuid}/milestones/${milestoneId}?amountEth=${encodeURIComponent(amountEth)}`)}>Create Milestone</button>
                            <button className="action-btn secondary" onClick={() => runAction(`/api/blockchain/schemes/${schemeUuid}/milestones/${milestoneId}/vendor?vendorAddress=${encodeURIComponent(vendorAddress)}`)}>Set Vendor</button>
                            <button className="action-btn secondary" onClick={() => runAction(`/api/blockchain/schemes/${schemeUuid}/milestones/${milestoneId}/quotation?ipfsHash=${encodeURIComponent(ipfsHash)}`)}>Store Quotation</button>
                            <button className="action-btn secondary" onClick={() => runAction(`/api/blockchain/schemes/${schemeUuid}/milestones/${milestoneId}/approve`)}>Approve Proof</button>
                            <button className="action-btn secondary" onClick={() => runAction(`/api/blockchain/schemes/${schemeUuid}/milestones/${milestoneId}/reject`)}>Reject Proof</button>
                            <button className="action-btn secondary" onClick={() => runAction(`/api/blockchain/schemes/${schemeUuid}/milestones/${milestoneId}/release`)}>Release Payment</button>
                            <button className="action-btn secondary" onClick={() => runAction(`/api/blockchain/schemes/${schemeUuid}/milestones/${milestoneId}/refund?toAddress=${encodeURIComponent(toAddress)}`)}>Refund</button>
                        </div>
                        {actionError && <div style={{ color: '#ef4444' }}>{actionError}</div>}
                        {actionResult && <div style={{ color: '#94a3b8', wordBreak: 'break-all' }}>{JSON.stringify(actionResult)}</div>}
                    </div>
                </div>

                <div className="action-section">
                    <h2>On-Chain Activity</h2>
                    <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '16px', padding: '16px' }}>
                        {recentEvents.length === 0 ? (
                            <div style={{ color: '#94a3b8' }}>No recent blockchain events found.</div>
                        ) : (
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {recentEvents.slice(0, 8).map((ev) => (
                                    <div key={ev.eventId} style={{ display: 'grid', gap: '4px', padding: '10px', borderRadius: '12px', background: 'rgba(2, 6, 23, 0.35)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                                            <div style={{ fontWeight: 700 }}>
                                                {ev.eventName}
                                                {typeof ev.transactionHash === 'string' && ev.transactionHash.startsWith('demo-') && (
                                                    <span style={{ marginLeft: '8px', color: '#f59e0b', fontWeight: 700 }}>DEMO</span>
                                                )}
                                            </div>
                                            <div style={{ color: '#94a3b8' }}>{ev.blockNumber !== null && ev.blockNumber !== undefined ? `#${ev.blockNumber}` : ''}</div>
                                        </div>
                                        {ev.amountWei && (
                                            <div style={{ color: '#e2e8f0' }}>
                                                Amount: ₹{formatInrBigInt(weiToInr(ev.amountWei) || 0)}
                                            </div>
                                        )}
                                        {ev.schemeId && <div style={{ color: '#94a3b8', wordBreak: 'break-all' }}>SchemeId: {ev.schemeId}</div>}
                                        {ev.fromAddress && <div style={{ color: '#94a3b8', wordBreak: 'break-all' }}>From: {ev.fromAddress}</div>}
                                        {ev.ipfsHash && <div style={{ color: '#e2e8f0', wordBreak: 'break-all' }}>IPFS: {ev.ipfsHash}</div>}
                                        {ev.transactionHash && <div style={{ color: '#94a3b8', wordBreak: 'break-all' }}>Tx: {ev.transactionHash}</div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NGODashboard;
