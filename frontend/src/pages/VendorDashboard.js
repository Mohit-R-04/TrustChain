import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import BlockchainPanel from '../components/BlockchainPanel';
import './DashboardPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const VendorDashboard = () => {
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const [kycStatus, setKycStatus] = useState('LOADING'); // LOADING, VERIFIED, PENDING
    const [stats, setStats] = useState({
        activeOrders: 0,
        pendingInvoices: 0,
        totalPayments: 0
    });
    const [orders, setOrders] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [payments, setPayments] = useState([]);

    const [activeModal, setActiveModal] = useState(null); // 'invoice', 'orders', 'payments'
    const [invoiceForm, setInvoiceForm] = useState({
        manageId: '',
        amount: '',
        invoiceFile: null
    });

    const [vendorDetails, setVendorDetails] = useState(null);

    // Debugging
    useEffect(() => {
        console.log('VendorDashboard Component Loaded');
        console.log('Current User:', user);
    }, [user]);

    useEffect(() => {
        if (isLoaded && user) {
            checkKycStatus();
            fetchDashboardData();
            fetchVendorDetails();
        }
    }, [isLoaded, user]);

    const fetchDashboardData = async () => {
        try {
            const token = await getToken();
            const headers = { 'Authorization': `Bearer ${token}` };

            console.log('Fetching dashboard data for user:', user.id);

            const [ordersRes, invoicesRes, paymentsRes] = await Promise.all([
                fetch(`${API_URL}/api/ngo-vendor/user/${user.id}`, { headers }),
                fetch(`${API_URL}/api/invoice/user/${user.id}`, { headers }),
                fetch(`${API_URL}/api/transaction/user/${user.id}`, { headers })
            ]);

            if (ordersRes.ok) {
                const data = await ordersRes.json();
                console.log('Orders data:', data);
                setOrders(data);
                setStats(prev => ({ ...prev, activeOrders: data.filter(o => o.status === 'ACCEPTED').length }));
            } else {
                console.error('Failed to fetch orders');
            }

            if (invoicesRes.ok) {
                const data = await invoicesRes.json();
                console.log('Invoices data:', data);
                setInvoices(data);
                setStats(prev => ({ ...prev, pendingInvoices: data.filter(i => i.status === 'PENDING').length }));
            } else {
                console.error('Failed to fetch invoices');
            }

            if (paymentsRes.ok) {
                const data = await paymentsRes.json();
                console.log('Payments data:', data);
                setPayments(data);
                const total = data.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
                setStats(prev => ({ ...prev, totalPayments: total }));
            } else {
                console.error('Failed to fetch payments');
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

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
                const [aadhaarData, panData] = await Promise.all([aadhaarRes.json(), panRes.json()]);
                const aadhaarVerified = aadhaarData?.status === 'VERIFIED';
                const panVerified = panData?.status === 'VERIFIED';
                setKycStatus(aadhaarVerified && panVerified ? 'VERIFIED' : 'PENDING');
            } else {
                setKycStatus('PENDING');
            }
        } catch (error) {
            console.error('Error checking KYC status:', error);
            setKycStatus('PENDING');
        }
    };

    const fetchVendorDetails = async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/vendor/user/${user.id}`, {
                 headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                console.log('Vendor details:', data);
                setVendorDetails(data);
            } else {
                console.error('Failed to fetch vendor details');
            }
        } catch (e) {
            console.error('Error fetching vendor details:', e);
        }
    }

    const handleInvoiceSubmitWithVendorId = async (e) => {
        e.preventDefault();
        if (!vendorDetails) {
            alert("Vendor details not found. Please contact support.");
            return;
        }
        if (!invoiceForm.invoiceFile) {
            alert("Please upload the invoice file.");
            return;
        }
        try {
            const token = await getToken();
            if (!token) {
                alert("Not authenticated. Please sign in again.");
                return;
            }
            const formData = new FormData();
            formData.append('manageId', invoiceForm.manageId);
            formData.append('amount', String(parseFloat(invoiceForm.amount)));
            formData.append('file', invoiceForm.invoiceFile);

            const response = await fetch(`${API_URL}/api/invoice/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                alert('Invoice submitted successfully!');
                setActiveModal(null);
                fetchDashboardData();
                setInvoiceForm({ manageId: '', amount: '', invoiceFile: null });
            } else {
                const errText = await response.text();
                alert('Failed to submit invoice: ' + errText);
            }
        } catch (error) {
            console.error('Error submitting invoice:', error);
            alert('Error submitting invoice');
        }
    };

    const handleOrderAction = async (orderId, action) => {
        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/api/ngo-vendor/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: action })
            });

            if (response.ok) {
                alert(`Order ${action.toLowerCase()} successfully!`);
                fetchDashboardData();
            } else {
                alert(`Failed to ${action.toLowerCase()} order`);
            }
        } catch (error) {
            console.error(`Error updating order status:`, error);
            alert('Error updating order status');
        }
    };

    return (
        <div className="dashboard-container">
            <DashboardHeader title="Vendor Dashboard" role="vendor" />

            <div className="dashboard-content">
                {/* KYC Alert Banner */}
                {kycStatus === 'PENDING' && (
                    <div className="kyc-alert">
                        <div className="kyc-alert-content">
                            <div className="kyc-icon">⚠️</div>
                            <div>
                                <h3>Action Required: Complete KYC</h3>
                                <p>You must complete your KYC verification to start accepting orders and receiving payments.</p>
                            </div>
                        </div>
                        <button onClick={() => navigate('/vendor-kyc')} className="kyc-btn">
                            Complete Verification →
                        </button>
                    </div>
                )}

                <div className="dashboard-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📦</div>
                        <div className="stat-content">
                            <h3>Active Orders</h3>
                            <p className="stat-value">{stats.activeOrders}</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">📄</div>
                        <div className="stat-content">
                            <h3>Pending Invoices</h3>
                            <p className="stat-value">{stats.pendingInvoices}</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">💳</div>
                        <div className="stat-content">
                            <h3>Total Payments</h3>
                            <p className="stat-value">₹{stats.totalPayments.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="action-section">
                    <h2>Quick Actions</h2>
                    <div className="action-buttons">
                        <button 
                            className="action-btn primary" 
                            disabled={kycStatus !== 'VERIFIED'} 
                            title={kycStatus !== 'VERIFIED' ? "Complete KYC first" : ""}
                            onClick={() => setActiveModal('invoice')}
                        >
                            Submit Invoice
                        </button>
                        <button 
                            className="action-btn secondary"
                            onClick={() => setActiveModal('orders')}
                        >
                            View Orders
                        </button>
                        <button 
                            className="action-btn secondary"
                            onClick={() => setActiveModal('payments')}
                        >
                            Payment History
                        </button>
                    </div>
                </div>

                <BlockchainPanel />
            </div>

            {/* Modals */}
            {activeModal === 'invoice' && (
                <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Submit Invoice</h2>
                            <button className="close-btn" onClick={() => setActiveModal(null)}>×</button>
                        </div>
                        <form onSubmit={handleInvoiceSubmitWithVendorId}>
                            <div className="form-group">
                                <label>Select Order</label>
                                <select 
                                    value={invoiceForm.manageId}
                                    onChange={e => setInvoiceForm({...invoiceForm, manageId: e.target.value})}
                                    required
                                >
                                    <option value="">Select an order...</option>
                                    {orders.filter(o => o.status === 'ACCEPTED').map(order => (
                                        <option key={order.manage.manageId} value={order.manage.manageId}>
                                            {(order.manage.scheme.schemeName || order.manage.scheme.name)} (NGO: {order.manage.ngo.name})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Amount (₹)</label>
                                <input 
                                    type="number" 
                                    value={invoiceForm.amount}
                                    onChange={e => setInvoiceForm({...invoiceForm, amount: e.target.value})}
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div className="form-group">
                                <label>Upload Invoice</label>
                                <input 
                                    type="file"
                                    onChange={e => setInvoiceForm({...invoiceForm, invoiceFile: e.target.files?.[0] || null})}
                                    required
                                />
                            </div>
                            <button type="submit" className="submit-btn">Submit Invoice</button>
                        </form>
                    </div>
                </div>
            )}

            {activeModal === 'orders' && (
                <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>My Orders</h2>
                            <button className="close-btn" onClick={() => setActiveModal(null)}>×</button>
                        </div>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Scheme</th>
                                        <th>NGO</th>
                                        <th>Budget</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.length > 0 ? orders.map(order => (
                                        <tr key={order.ngoVendorId}>
                                            <td>{order.manage.scheme.schemeName || order.manage.scheme.name}</td>
                                            <td>{order.manage.ngo.name}</td>
                                            <td>{order.allocatedBudget != null ? `₹${Number(order.allocatedBudget).toLocaleString()}` : '-'}</td>
                                            <td>
                                                <span className={`status-badge ${order.status ? order.status.toLowerCase() : 'unknown'}`}>
                                                    {order.status || 'Unknown'}
                                                </span>
                                            </td>
                                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                {(order.status === 'PENDING' || order.status === 'REQUESTED') && (
                                                    <div className="action-buttons-small">
                                                        <button 
                                                            className="btn-accept"
                                                            onClick={() => handleOrderAction(order.ngoVendorId, 'ACCEPTED')}
                                                        >
                                                            Accept
                                                        </button>
                                                        <button 
                                                            className="btn-reject"
                                                            onClick={() => handleOrderAction(order.ngoVendorId, 'REJECTED')}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className="empty-state">
                                                No orders found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeModal === 'payments' && (
                <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Payment History</h2>
                            <button className="close-btn" onClick={() => setActiveModal(null)}>×</button>
                        </div>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Transaction ID</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.length > 0 ? payments.map(payment => (
                                        <tr key={payment.transactionId}>
                                            <td className="monospace">{payment.transactionId.substring(0, 8)}...</td>
                                            <td>₹{payment.totalAmount.toLocaleString()}</td>
                                            <td>{payment.status}</td>
                                            <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="empty-state">
                                                No payments found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorDashboard;
