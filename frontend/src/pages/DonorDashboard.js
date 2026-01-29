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
    const [recentEvents, setRecentEvents] = useState([]);
    const [escrowInfo, setEscrowInfo] = useState(null);
    const [schemes, setSchemes] = useState([]);
    const [selectedSchemeId, setSelectedSchemeId] = useState('');
    const [walletAddress, setWalletAddress] = useState('');
    const [schemeInfo, setSchemeInfo] = useState(null);
    const [schemeInfoError, setSchemeInfoError] = useState(null);
    const [stats, setStats] = useState({
        totalDonations: 0,
        activeProjects: 0,
        verifiedTransactions: 0
    });

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
        try {
            const last = window.localStorage.getItem('lastSchemeUuid');
            if (last) setSelectedSchemeId(last);
        } catch {
        }
        fetchSchemes();
        fetchDashboardData();
        fetchRecentBlockchainEvents();
        fetchEscrowInfo();
    }, []);

    const fetchSchemes = async () => {
        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/api/scheme`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const arr = Array.isArray(data) ? data : [];
                setSchemes(arr);
                if (!selectedSchemeId && arr.length > 0) {
                    setSelectedSchemeId(arr[0].schemeId);
                }
            }
        } catch (e) {
        }
    };

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
        fetchRecentBlockchainEvents();
        fetchEscrowInfo();
    };

    const loadSchemeOnChainInfo = async () => {
        setSchemeInfoError(null);
        setSchemeInfo(null);
        try {
            if (!selectedSchemeId) {
                throw new Error('Select a scheme');
            }
            let addr = '0x0000000000000000000000000000000000000000';
            if (window.ethereum) {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                if (accounts?.[0]) addr = accounts[0];
            }
            setWalletAddress(addr === '0x0000000000000000000000000000000000000000' ? '' : addr);
            const selected = schemes.find((s) => s?.schemeId === selectedSchemeId);

            const token = await getToken();
            const [balanceRes, contribRes] = await Promise.all([
                fetch(`${API_URL}/api/blockchain/schemes/${selectedSchemeId}/balance`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_URL}/api/blockchain/schemes/${selectedSchemeId}/donors/${addr}/contribution`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);
            const balanceData = await balanceRes.json().catch(() => ({}));
            const contribData = await contribRes.json().catch(() => ({}));
            if (!balanceRes.ok) {
                throw new Error(balanceData?.message || 'Failed to load scheme balance');
            }
            if (!contribRes.ok) {
                throw new Error(contribData?.message || 'Failed to load your contribution');
            }
            setSchemeInfo({
                schemeUuid: balanceData.schemeUuid,
                schemeId: balanceData.schemeId,
                schemeName: selected?.schemeName || '',
                schemeBalancePol: balanceData.balancePol,
                schemeBalanceWei: balanceData.balanceWei,
                contributionPol: contribData.contributionPol,
                contributionWei: contribData.contributionWei
            });
        } catch (e) {
            setSchemeInfoError(e?.message || 'Failed to load scheme info');
        }
    };

    const fetchEscrowInfo = async () => {
        try {
            const token = await getToken();
            const [statusRes, balanceRes] = await Promise.all([
                fetch(`${API_URL}/api/blockchain/status`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/api/blockchain/escrow/balance`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            if (statusRes.ok && balanceRes.ok) {
                const status = await statusRes.json();
                const balance = await balanceRes.json();
                setEscrowInfo({
                    contractAddress: status.contractAddress,
                    balancePol: balance.balancePol,
                    balanceWei: balance.balanceWei
                });
            }
        } catch (error) {
            console.error('Error fetching escrow info:', error);
        }
    };

    const fetchRecentBlockchainEvents = async () => {
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
        } catch (error) {
            console.error('Error fetching blockchain events:', error);
        }
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

                    <div className="stat-card">
                        <div className="stat-icon">🔒</div>
                        <div className="stat-content">
                            <h3>Escrow Wallet</h3>
                            <p className="stat-value">
                                {escrowInfo?.balanceWei ? `₹${formatInrBigInt(weiToInr(escrowInfo.balanceWei) || 0)}` : '—'}
                            </p>
                            {escrowInfo?.contractAddress && (
                                <div style={{ color: '#94a3b8', fontSize: '12px', wordBreak: 'break-all', marginTop: '6px' }}>
                                    {escrowInfo.contractAddress}
                                </div>
                            )}
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

                <div className="action-section">
                    <h2>My Scheme Escrow</h2>
                    <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '16px', padding: '16px', display: 'grid', gap: '12px' }}>
                        <select
                            value={selectedSchemeId}
                            onChange={(e) => setSelectedSchemeId(e.target.value)}
                            style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(148, 163, 184, 0.25)', background: 'rgba(2, 6, 23, 0.35)', color: '#e2e8f0' }}
                        >
                            <option value="">Choose a scheme</option>
                            {schemes.map((s) => (
                                <option key={s.schemeId} value={s.schemeId}>
                                    {s.schemeName}
                                </option>
                            ))}
                        </select>
                        <button className="action-btn primary" onClick={loadSchemeOnChainInfo} style={{ justifySelf: 'start' }}>
                            Load On-Chain Balances
                        </button>
                        {walletAddress && (
                            <div style={{ color: '#94a3b8', fontSize: '12px', wordBreak: 'break-all' }}>
                                Wallet: {walletAddress}
                            </div>
                        )}
                        {schemeInfoError && <div style={{ color: '#ef4444' }}>{schemeInfoError}</div>}
                        {schemeInfo && (
                            <div style={{ display: 'grid', gap: '8px' }}>
                                {schemeInfo.schemeName && (
                                    <div style={{ color: '#94a3b8' }}>{schemeInfo.schemeName}</div>
                                )}
                                <div style={{ color: '#e2e8f0' }}>
                                    Scheme pool balance: ₹{formatInrBigInt(weiToInr(schemeInfo.schemeBalanceWei) || 0)}
                                </div>
                                <div style={{ color: '#e2e8f0' }}>
                                    My contribution: ₹{formatInrBigInt(weiToInr(schemeInfo.contributionWei) || 0)}
                                </div>
                                <div style={{ color: '#94a3b8', fontSize: '12px', wordBreak: 'break-all' }}>
                                    SchemeId (uint256): {schemeInfo.schemeId}
                                </div>
                            </div>
                        )}
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
