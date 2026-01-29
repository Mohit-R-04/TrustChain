import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import DashboardHeader from '../components/DashboardHeader';
import CreateSchemeForm from '../components/CreateSchemeForm';
import DonationForm from '../components/DonationForm';
import BlockchainPanel from '../components/BlockchainPanel';
import './DashboardPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const GovernmentDashboard = () => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showMonitorModal, setShowMonitorModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showDonationModal, setShowDonationModal] = useState(false);
    const [showCommunityNeedsModal, setShowCommunityNeedsModal] = useState(false);
    const [showSchemeDetailsModal, setShowSchemeDetailsModal] = useState(false);
    const [showInvoicesModal, setShowInvoicesModal] = useState(false);
    const [selectedSchemeId, setSelectedSchemeId] = useState(null);
    const [schemeDetails, setSchemeDetails] = useState(null);
    const [schemeDetailsLoading, setSchemeDetailsLoading] = useState(false);
    const [schemeDetailsError, setSchemeDetailsError] = useState(null);
    const [schemeBalance, setSchemeBalance] = useState(null);
    const [communityNeeds, setCommunityNeeds] = useState([]);
    const [communityNeedsLoading, setCommunityNeedsLoading] = useState(false);
    const [communityNeedsError, setCommunityNeedsError] = useState(null);
    const [implementingNeedId, setImplementingNeedId] = useState(null);

    const [stats, setStats] = useState({
        totalSchemes: 0,
        fundsAllocated: 0,
        pendingReviews: 0
    });

    const [transactions, setTransactions] = useState([]);
    const [donations, setDonations] = useState([]);
    const [schemes, setSchemes] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [invoicesError, setInvoicesError] = useState(null);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    useEffect(() => {
        if (!showSchemeDetailsModal || !selectedSchemeId) return;
        fetchSchemeDetails(selectedSchemeId);
    }, [showSchemeDetailsModal, selectedSchemeId]);

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

            const donationRes = await fetch(`${API_URL}/api/donation`, { headers });
            if (donationRes.ok) {
                const data = await donationRes.json();
                setDonations(Array.isArray(data) ? data : []);
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const fetchSchemeDetails = async (schemeId) => {
        setSchemeDetailsLoading(true);
        setSchemeDetailsError(null);
        setSchemeDetails(null);
        setSchemeBalance(null);
        try {
            const schemeRes = await fetch(`${API_URL}/api/scheme/${schemeId}`);
            if (!schemeRes.ok) {
                setSchemeDetailsError('Failed to load scheme details');
                return;
            }
            const schemeData = await schemeRes.json();
            setSchemeDetails(schemeData);

            const balRes = await fetch(`${API_URL}/api/public/blockchain/schemes/${schemeId}/balance`);
            if (balRes.ok) {
                const balData = await balRes.json();
                setSchemeBalance(balData);
            }
        } catch (err) {
            setSchemeDetailsError(err?.message || 'Failed to load scheme details');
        } finally {
            setSchemeDetailsLoading(false);
        }
    };

    const fetchCommunityNeeds = async () => {
        setCommunityNeedsLoading(true);
        setCommunityNeedsError(null);
        try {
            const res = await fetch(`${API_URL}/api/community-needs`);
            if (!res.ok) {
                setCommunityNeedsError('Failed to load community needs');
                return;
            }
            const data = await res.json();
            setCommunityNeeds(Array.isArray(data) ? data : []);
        } catch (err) {
            setCommunityNeedsError(err?.message || 'Failed to load community needs');
        } finally {
            setCommunityNeedsLoading(false);
        }
    };

    const voteOnNeed = async (needId, value) => {
        const voterEmail =
            user?.primaryEmailAddress?.emailAddress ||
            user?.emailAddresses?.[0]?.emailAddress ||
            `${user?.id || 'government'}@trustchain.local`;

        try {
            const res = await fetch(`${API_URL}/api/community-needs/${needId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: voterEmail, value })
            });
            if (!res.ok) return;
            const updated = await res.json();
            setCommunityNeeds((prev) =>
                prev.map((n) => (n.needId === updated.needId ? updated : n))
            );
        } catch {
        }
    };

    const implementNeed = async (need) => {
        if (!need?.needId) return;
        const ok = window.confirm('Implement this community need as an official project?');
        if (!ok) return;

        setImplementingNeedId(need.needId);
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/government/community-needs/${need.needId}/implement`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                const contentType = res.headers.get('content-type') || '';
                let msg = 'Failed to implement community need';
                if (contentType.includes('application/json')) {
                    const body = await res.json().catch(() => null);
                    msg = body?.error || body?.message || msg;
                } else {
                    const text = await res.text().catch(() => '');
                    if (text) msg = text;
                }
                setCommunityNeedsError(msg);
                return;
            }
            const scheme = await res.json().catch(() => null);
            if (!scheme?.schemeId) {
                setCommunityNeedsError('Implemented, but no project was returned by the server');
                return;
            }
            await fetchDashboardData();
            await fetchCommunityNeeds();
            setShowCommunityNeedsModal(false);
            setShowApproveModal(true);
            setSelectedSchemeId(scheme.schemeId);
            setShowSchemeDetailsModal(true);
        } catch {
            setCommunityNeedsError('Failed to implement community need');
        } finally {
            setImplementingNeedId(null);
            const fetchInvoices = async () => {
                try {
                    const token = await getToken();
                    const headers = { 'Authorization': `Bearer ${token}` };
                    const res = await fetch(`${API_URL}/api/invoice/visible`, { headers });
                    if (res.ok) {
                        const data = await res.json();
                        setInvoices(Array.isArray(data) ? data : []);
                        setInvoicesError(null);
                    } else {
                        setInvoices([]);
                        setInvoicesError(`Failed to fetch invoices (Status: ${res.status})`);
                    }
                } catch (e) {
                    console.error('Error fetching invoices:', e);
                    setInvoices([]);
                    setInvoicesError('Failed to fetch invoices');
                }
            };

            const governmentInvoiceDecision = async (invoiceId, decision) => {
                try {
                    const token = await getToken();
                    const res = await fetch(`${API_URL}/api/invoice/${invoiceId}/government/decision`, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ decision })
                    });
                    if (res.ok) {
                        const updated = await res.json();
                        setInvoices(prev => prev.map(i => i.invoiceId === updated.invoiceId ? updated : i));
                    } else {
                        const errText = await res.text();
                        alert(errText || 'Failed to update invoice');
                    }
                } catch (e) {
                    console.error('Error updating invoice:', e);
                    alert('Error updating invoice');
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
                                    className="action-btn primary"
                                    onClick={() => setShowDonationModal(true)}
                                >
                                    Donate to a Scheme
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
                                    Projects
                                </button>
                                <button
                                    className="action-btn secondary"
                                    onClick={() => {
                                        fetchInvoices();
                                        setShowInvoicesModal(true);
                                    }}
                                >
                                    Invoices
                                </button>
                                <button
                                    className="action-btn secondary"
                                    onClick={() => {
                                        fetchCommunityNeeds();
                                        setShowCommunityNeedsModal(true);
                                    }}
                                >
                                    Community Needs
                                </button>
                            </div>
                        </div>

                        <BlockchainPanel />
                    </div>

                    {showDonationModal && (
                        <DonationForm
                            onClose={() => setShowDonationModal(false)}
                        />
                    )}

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
                                    {donations.length === 0 && transactions.length === 0 ? (
                                        <p className="empty-state">No records found.</p>
                                    ) : null}

                                    {donations.length > 0 ? (
                                        <>
                                            <h4 style={{ margin: '12px 0', color: '#e2e8f0' }}>Donations</h4>
                                            <table className="data-table">
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Project</th>
                                                        <th>Amount</th>
                                                        <th>Ref</th>
                                                        <th>Status</th>
                                                        <th>Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {donations.map(d => (
                                                        <tr key={d.donationId}>
                                                            <td className="monospace">{String(d.donationId).substring(0, 8)}...</td>
                                                            <td>{d.scheme?.schemeName || 'Unknown'}</td>
                                                            <td>₹{d.amount}</td>
                                                            <td className="monospace">{d.transactionRef}</td>
                                                            <td>
                                                                <span className={`status-badge ${(d.status || 'completed').toLowerCase()}`}>
                                                                    {d.status || 'COMPLETED'}
                                                                </span>
                                                            </td>
                                                            <td>{d.timestamp ? new Date(d.timestamp).toLocaleDateString() : ''}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </>
                                    ) : null}

                                    {transactions.length > 0 ? (
                                        <>
                                            <h4 style={{ margin: '16px 0 12px', color: '#e2e8f0' }}>Vendor Escrow Transactions</h4>
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
                                                            <td>₹{tx.totalAmount}</td>
                                                            <td>
                                                                <span className={`status-badge ${tx.status.toLowerCase()}`}>
                                                                    {tx.status}
                                                                </span>
                                                            </td>
                                                            <td>{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : ''}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    )}

                    {showInvoicesModal && (
                        <div className="modal-overlay">
                            <div className="modal-content large-modal">
                                <div className="modal-header">
                                    <h3>Invoices</h3>
                                    <button className="close-btn" onClick={() => setShowInvoicesModal(false)}>×</button>
                                </div>
                                <div className="table-container">
                                    {invoices.length === 0 ? (
                                        <p className="empty-state">{invoicesError || 'No invoices found.'}</p>
                                    ) : (
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Scheme</th>
                                                    <th>NGO</th>
                                                    <th>Vendor</th>
                                                    <th>Amount</th>
                                                    <th>Status</th>
                                                    <th>IPFS</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {invoices.map(inv => {
                                                    const status = (inv.status || '').toUpperCase();
                                                    const statusClass = status === 'ACCEPTED' ? 'accepted' : status === 'REJECTED' ? 'rejected' : status === 'NGO_ACCEPTED' ? 'pending' : 'pending';
                                                    const gatewayBaseRaw = process.env.REACT_APP_IPFS_GATEWAY_BASE || 'https://gateway.pinata.cloud/ipfs/';
                                                    const gatewayBase = gatewayBaseRaw.endsWith('/') ? gatewayBaseRaw : `${gatewayBaseRaw}/`;
                                                    const ipfsUrl = inv.invoiceIpfsHash ? `${gatewayBase}${inv.invoiceIpfsHash}` : null;
                                                    return (
                                                        <tr key={inv.invoiceId}>
                                                            <td>{inv.manage?.scheme?.schemeName || inv.manage?.scheme?.name || '-'}</td>
                                                            <td>{inv.manage?.ngo?.name || '-'}</td>
                                                            <td>{inv.vendor?.name || inv.vendor?.email || '-'}</td>
                                                            <td>₹{Number(inv.amount || 0).toLocaleString()}</td>
                                                            <td>
                                                                <span className={`status-badge ${statusClass}`}>{status || 'PENDING'}</span>
                                                            </td>
                                                            <td>
                                                                {ipfsUrl ? <a href={ipfsUrl} target="_blank" rel="noreferrer">View</a> : '-'}
                                                            </td>
                                                            <td>
                                                                {status === 'NGO_ACCEPTED' && (
                                                                    <div className="action-buttons-small">
                                                                        <button className="btn-accept" onClick={() => governmentInvoiceDecision(inv.invoiceId, 'ACCEPTED')}>Accept</button>
                                                                        <button className="btn-reject" onClick={() => governmentInvoiceDecision(inv.invoiceId, 'REJECTED')}>Reject</button>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
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
                                    <h3>Projects</h3>
                                    <button className="close-btn" onClick={() => setShowApproveModal(false)}>×</button>
                                </div>
                                <div className="table-container">
                                    {schemes.length === 0 ? (
                                        <p className="empty-state">No schemes found.</p>
                                    ) : (
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Project Name</th>
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
                                                            <button
                                                                className="action-btn small"
                                                                onClick={() => {
                                                                    setSelectedSchemeId(scheme.schemeId);
                                                                    setShowSchemeDetailsModal(true);
                                                                }}
                                                            >
                                                                View Details
                                                            </button>
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

                    {showSchemeDetailsModal && (
                        <div className="modal-overlay">
                            <div className="modal-content large-modal">
                                <div className="modal-header">
                                    <h3>Scheme Details</h3>
                                    <button
                                        className="close-btn"
                                        onClick={() => {
                                            setShowSchemeDetailsModal(false);
                                            setSelectedSchemeId(null);
                                            setSchemeDetails(null);
                                            setSchemeBalance(null);
                                            setSchemeDetailsError(null);
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                                <div className="table-container">
                                    {schemeDetailsLoading ? (
                                        <p className="empty-state">Loading...</p>
                                    ) : schemeDetailsError ? (
                                        <p className="empty-state">{schemeDetailsError}</p>
                                    ) : !schemeDetails ? (
                                        <p className="empty-state">No scheme details found.</p>
                                    ) : (
                                        <div style={{ display: 'grid', gap: '12px' }}>
                                            <div style={{ display: 'grid', gap: '6px' }}>
                                                <div><strong>Name:</strong> {schemeDetails.schemeName}</div>
                                                <div><strong>Category:</strong> {schemeDetails.category || '—'}</div>
                                                <div><strong>Region:</strong> {schemeDetails.region || '—'}</div>
                                                <div><strong>Budget:</strong> ₹{(schemeDetails.budget || 0).toLocaleString()}</div>
                                                <div><strong>Status:</strong> {schemeDetails.isFinished ? 'Finished' : 'Active'}</div>
                                                <div><strong>Start Date:</strong> {schemeDetails.startDate || '—'}</div>
                                                <div><strong>End Date:</strong> {schemeDetails.endDate || '—'}</div>
                                                <div><strong>Expected Beneficiaries:</strong> {schemeDetails.expectedBeneficiaries ?? '—'}</div>
                                                <div><strong>Milestones:</strong> {schemeDetails.milestoneCount ?? '—'}</div>
                                            </div>
                                            <div style={{ display: 'grid', gap: '6px' }}>
                                                <div><strong>Description:</strong></div>
                                                <div style={{ whiteSpace: 'pre-wrap' }}>{schemeDetails.description || '—'}</div>
                                            </div>
                                            {schemeBalance && (
                                                <div style={{ display: 'grid', gap: '6px' }}>
                                                    <div><strong>Escrow Balance (Demo/Chain):</strong> {schemeBalance.balancePol} POL</div>
                                                    <div className="monospace"><strong>Scheme UUID:</strong> {schemeDetails.schemeId}</div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {showCommunityNeedsModal && (
                        <div className="modal-overlay">
                            <div className="modal-content large-modal">
                                <div className="modal-header">
                                    <h3>Community Needs</h3>
                                    <button className="close-btn" onClick={() => setShowCommunityNeedsModal(false)}>×</button>
                                </div>
                                <div className="table-container">
                                    {communityNeedsLoading ? (
                                        <p className="empty-state">Loading...</p>
                                    ) : communityNeedsError ? (
                                        <p className="empty-state">{communityNeedsError}</p>
                                    ) : communityNeeds.length === 0 ? (
                                        <p className="empty-state">No community needs found.</p>
                                    ) : (
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Title</th>
                                                    <th>Category</th>
                                                    <th>Location</th>
                                                    <th>Status</th>
                                                    <th>Votes</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {communityNeeds.map((n) => (
                                                    <tr key={n.needId}>
                                                        <td>{n.title}</td>
                                                        <td>{n.category}</td>
                                                        <td>{n.location}</td>
                                                        <td>
                                                            <span className={`status-badge ${String(n.status || '').toLowerCase()}`}>
                                                                {n.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span style={{ display: 'inline-flex', gap: '10px', alignItems: 'center' }}>
                                                                <span>↑ {n.upvotes || 0}</span>
                                                                <span>↓ {n.downvotes || 0}</span>
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span style={{ display: 'inline-flex', gap: '8px' }}>
                                                                <button className="action-btn small" onClick={() => voteOnNeed(n.needId, 1)}>
                                                                    Upvote
                                                                </button>
                                                                <button className="action-btn small" onClick={() => voteOnNeed(n.needId, -1)}>
                                                                    Downvote
                                                                </button>
                                                                <button
                                                                    className="action-btn small primary"
                                                                    onClick={() => implementNeed(n)}
                                                                    disabled={Boolean(n.implementedSchemeId) || implementingNeedId === n.needId}
                                                                >
                                                                    Implement
                                                                </button>
                                                            </span>
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
