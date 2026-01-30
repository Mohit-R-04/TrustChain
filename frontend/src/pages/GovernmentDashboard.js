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

    const [stats, setStats] = useState({
        totalSchemes: 0,
        fundsAllocated: 0,
        pendingReviews: 0,
        beneficiariesReached: 0
    });

    const [transactions, setTransactions] = useState([]);
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
                    fundsAllocated: data.reduce((sum, s) => sum + (s.budget || 0), 0),
                    beneficiariesReached: data.reduce((sum, s) => sum + (s.expectedBeneficiaries || 0), 0)
                }));
            }

            let combinedTransactions = [];

            // Fetch Transactions (Payments/Expenses)
            const txRes = await fetch(`${API_URL}/api/transaction`, { headers });
            if (txRes.ok) {
                const txData = await txRes.json();
                const formattedTx = txData.map(tx => ({
                    id: tx.transactionId,
                    type: 'Payment',
                    amount: tx.totalAmount,
                    date: tx.createdAt,
                    status: tx.status
                }));
                combinedTransactions = [...combinedTransactions, ...formattedTx];
            }

            // Fetch Donations (Deposits)
            const donationRes = await fetch(`${API_URL}/api/donation`, { headers });
            if (donationRes.ok) {
                const donationData = await donationRes.json();
                const formattedDonations = donationData.map(d => ({
                    id: d.donationId,
                    type: 'Deposit',
                    amount: d.amount,
                    date: d.timestamp,
                    status: d.status
                }));
                combinedTransactions = [...combinedTransactions, ...formattedDonations];
            }

            // Sort by date descending
            combinedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
            setTransactions(combinedTransactions);

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

    const governmentInvoiceChangeDecision = async (invoiceId, decision) => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/invoice/${invoiceId}/change-request/government/decision`, {
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
                alert(errText || 'Failed to update invoice change request');
            }
        } catch (e) {
            console.error('Error updating invoice change request:', e);
            alert('Error updating invoice change request');
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
                            <p className="stat-value">{stats.beneficiariesReached?.toLocaleString() || 0}</p>
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
                            {transactions.length === 0 ? (
                                <p className="empty-state">No transactions found.</p>
                            ) : (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Type</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map(tx => (
                                            <tr key={tx.id}>
                                                <td className="monospace">{tx.id.substring(0, 8)}...</td>
                                                <td>
                                                    <span className={`status-badge ${tx.type === 'Deposit' ? 'active' : 'completed'}`}>
                                                        {tx.type}
                                                    </span>
                                                </td>
                                                <td>₹{tx.amount}</td>
                                                <td>
                                                    <span className={`status-badge ${tx.status.toLowerCase()}`}>
                                                        {tx.status}
                                                    </span>
                                                </td>
                                                <td>{new Date(tx.date).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
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
                                            <th>Change</th>
                                            <th>IPFS</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoices.map(inv => {
                                            const status = (inv.status || '').toUpperCase();
                                            const statusClass = status === 'ACCEPTED' ? 'accepted' : status === 'REJECTED' ? 'rejected' : status === 'NGO_ACCEPTED' ? 'pending' : 'pending';
                                            const changeStatus = (inv.changeRequestStatus || '').toUpperCase();
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
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                            <span className="status-text">{changeStatus || 'NONE'}</span>
                                                            {inv.changeRequestReason ? (
                                                                <span className="status-text" title={inv.changeRequestReason}>
                                                                    {inv.changeRequestReason.length > 40 ? `${inv.changeRequestReason.substring(0, 40)}...` : inv.changeRequestReason}
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {ipfsUrl ? <a href={ipfsUrl} target="_blank" rel="noreferrer">View</a> : '-'}
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                            {status === 'PENDING' && (
                                                                <span className="status-text">Waiting for NGO</span>
                                                            )}
                                                            {status === 'NGO_ACCEPTED' && (
                                                                <div className="action-buttons-small">
                                                                    <button className="btn-accept" onClick={() => governmentInvoiceDecision(inv.invoiceId, 'ACCEPTED')}>Accept</button>
                                                                    <button className="btn-reject" onClick={() => governmentInvoiceDecision(inv.invoiceId, 'REJECTED')}>Reject</button>
                                                                </div>
                                                            )}
                                                            {changeStatus === 'NGO_APPROVED' && (
                                                                <div className="action-buttons-small">
                                                                    <button className="btn-accept" onClick={() => governmentInvoiceChangeDecision(inv.invoiceId, 'ACCEPTED')}>Approve Change</button>
                                                                    <button className="btn-reject" onClick={() => governmentInvoiceChangeDecision(inv.invoiceId, 'REJECTED')}>Reject Change</button>
                                                                </div>
                                                            )}
                                                        </div>
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
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {communityNeeds.map((n) => (
                                            <tr key={n.needId}>
                                                <td>{n.title}</td>
                                                <td>{n.category}</td>
                                                <td>{n.location}</td>
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
