import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import DashboardHeader from '../components/DashboardHeader';
import {useNavigate} from 'react-router-dom';
import './DashboardPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const NGODashboard = () => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const navigate = useNavigate();
    
    const [ngoDetails, setNgoDetails] = useState(null);
    const [schemes, setSchemes] = useState([]);
    const [allSchemes, setAllSchemes] = useState([]);
    
    const [showCreateProject, setShowCreateProject] = useState(false);
    const [showUploadDocs, setShowUploadDocs] = useState(false);
    const [showBeneficiaries, setShowBeneficiaries] = useState(false);

    const [createProjectStep, setCreateProjectStep] = useState('scheme');
    const [createdManage, setCreatedManage] = useState(null);
    const [vendors, setVendors] = useState([]);
    const [vendorsError, setVendorsError] = useState(null);
    const [selectedVendorIds, setSelectedVendorIds] = useState([]);
    const [vendorBudgets, setVendorBudgets] = useState({});

    const [showManageVendors, setShowManageVendors] = useState(false);
    const [ngoProjects, setNgoProjects] = useState([]);
    const [selectedManageId, setSelectedManageId] = useState('');
    const [selectedManage, setSelectedManage] = useState(null);
    const [existingAssignments, setExistingAssignments] = useState([]);
    const [manageVendorsError, setManageVendorsError] = useState(null);

    const [projectForm, setProjectForm] = useState({
        schemeId: ''
    });

    const [selectedCategory, setSelectedCategory] = useState('All');
    const [schemesError, setSchemesError] = useState(null);

    const [stats, setStats] = useState({
        activeProjects: 0,
        beneficiaries: 0,
        fundsReceived: 0
    });

    const [showInvoices, setShowInvoices] = useState(false);
    const [invoices, setInvoices] = useState([]);
    const [invoicesError, setInvoicesError] = useState(null);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    // Client-side filtering when category changes
    useEffect(() => {
        if (selectedCategory === 'All') {
            setSchemes(allSchemes);
        } else {
            setSchemes(allSchemes.filter(s => s.category === selectedCategory));
        }
    }, [selectedCategory, allSchemes]);

    const fetchDashboardData = async () => {
        try {
            const token = await getToken();
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch NGO Details
            const ngoRes = await fetch(`${API_URL}/api/ngo/user/${user.id}`, { headers });
            if (ngoRes.ok) {
                const data = await ngoRes.json();
                setNgoDetails(data);
            }

            // Fetch Schemes (for project creation)
            const schemesRes = await fetch(`${API_URL}/api/scheme`, { headers });
            if (schemesRes.ok) {
                const data = await schemesRes.json();
                console.log("Fetched schemes:", data); // Debug log
                setSchemes(data);
                setAllSchemes(data);
            } else {
                console.error("Failed to fetch schemes:", schemesRes.status);
                setSchemesError(`Failed to fetch schemes (Status: ${schemesRes.status})`);
            }

            // Mock Stats (can be real if endpoints exist)
            setStats({
                activeProjects: 2,
                beneficiaries: 150,
                fundsReceived: 500000
            });

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!ngoDetails) {
            alert("NGO details not found. Please contact support.");
            return;
        }
        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/api/manage`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ngo: { ngoId: ngoDetails.ngoId },
                    scheme: { schemeId: projectForm.schemeId }
                })
            });

            if (response.ok) {
                const manage = await response.json();
                setCreatedManage(manage);
                setCreateProjectStep('vendors');
                setVendorsError(null);
                setSelectedVendorIds([]);

                const vendorsRes = await fetch(`${API_URL}/api/vendor`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (vendorsRes.ok) {
                    const vendorData = await vendorsRes.json();
                    setVendors(vendorData);
                } else {
                    setVendorsError(`Failed to fetch vendors (Status: ${vendorsRes.status})`);
                    setVendors([]);
                }
            } else if (response.status === 409) {
                const errText = await response.text();
                alert(errText || 'This scheme is already accepted (duplicate).');
            } else {
                alert('Failed to create project');
            }
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Error creating project');
        }
    };

    const toggleVendorSelection = (vendorId) => {
        setSelectedVendorIds(prev => {
            if (prev.includes(vendorId)) {
                return prev.filter(id => id !== vendorId);
            }
            return [...prev, vendorId];
        });
    };

    const setVendorBudget = (vendorId, value) => {
        setVendorBudgets(prev => ({
            ...prev,
            [vendorId]: value
        }));
    };

    const getSchemeBudgetForSchemeId = (schemeId) => {
        const scheme = allSchemes.find(s => s.schemeId === schemeId);
        return scheme?.budget ?? null;
    };

    const getSelectedVendorsBudgetTotal = () => {
        return selectedVendorIds.reduce((sum, vendorId) => {
            const v = vendorBudgets[vendorId];
            const n = typeof v === 'number' ? v : parseFloat(v);
            return sum + (Number.isFinite(n) ? n : 0);
        }, 0);
    };

    const handleAssignVendors = async (e) => {
        e.preventDefault();
        if (!createdManage?.manageId) {
            alert('Project not created yet.');
            return;
        }
        try {
            const token = await getToken();
            const schemeBudget = getSchemeBudgetForSchemeId(projectForm.schemeId);
            const totalAllocated = getSelectedVendorsBudgetTotal();
            if (schemeBudget != null && totalAllocated > schemeBudget) {
                alert(`Total vendor budgets (₹${totalAllocated}) exceed scheme budget (₹${schemeBudget}).`);
                return;
            }

            const payloadVendors = selectedVendorIds.map(vendorId => ({
                vendorId,
                allocatedBudget: (() => {
                    const n = parseFloat(vendorBudgets[vendorId]);
                    return Number.isFinite(n) ? n : 0;
                })()
            }));

            const res = await fetch(`${API_URL}/api/ngo-vendor/manage/${createdManage.manageId}/vendors/allocate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    vendors: payloadVendors
                })
            });

            if (res.ok) {
                alert('Vendors assigned to project successfully!');
                setShowCreateProject(false);
                setProjectForm({ schemeId: '' });
                setCreateProjectStep('scheme');
                setCreatedManage(null);
                setVendors([]);
                setSelectedVendorIds([]);
                setVendorBudgets({});
                fetchDashboardData();
            } else if (res.status === 409) {
                const errText = await res.text();
                alert(errText || 'Vendor budgets exceed scheme budget.');
            } else {
                alert('Failed to assign vendors');
            }
        } catch (error) {
            console.error('Error assigning vendors:', error);
            alert('Error assigning vendors');
        }
    };

    const openManageVendors = async () => {
        if (!ngoDetails) {
            alert("NGO details not found. Please contact support.");
            return;
        }
        try {
            const token = await getToken();
            const headers = { 'Authorization': `Bearer ${token}` };

            const [projectsRes, vendorsRes] = await Promise.all([
                fetch(`${API_URL}/api/manage/ngo/${ngoDetails.ngoId}`, { headers }),
                fetch(`${API_URL}/api/vendor`, { headers })
            ]);

            if (projectsRes.ok) {
                const data = await projectsRes.json();
                setNgoProjects(data);
            } else {
                setNgoProjects([]);
            }

            if (vendorsRes.ok) {
                const data = await vendorsRes.json();
                setVendors(data);
            } else {
                setVendors([]);
            }

            setSelectedManageId('');
            setSelectedManage(null);
            setExistingAssignments([]);
            setSelectedVendorIds([]);
            setVendorBudgets({});
            setManageVendorsError(null);
            setShowManageVendors(true);
        } catch (e) {
            console.error('Error opening manage vendors:', e);
            setManageVendorsError('Failed to load projects/vendors');
            setShowManageVendors(true);
        }
    };

    const loadProjectAssignments = async (manageId) => {
        try {
            const token = await getToken();
            const headers = { 'Authorization': `Bearer ${token}` };

            const res = await fetch(`${API_URL}/api/ngo-vendor/manage/${manageId}`, { headers });
            if (!res.ok) {
                setExistingAssignments([]);
                setManageVendorsError(`Failed to fetch assignments (Status: ${res.status})`);
                return;
            }
            const data = await res.json();
            setExistingAssignments(data);
            setManageVendorsError(null);

            const nonRejected = data.filter(a => (a.status || '').toUpperCase() !== 'REJECTED');
            setSelectedVendorIds(nonRejected.map(a => a.vendor?.vendorId).filter(Boolean));

            const budgets = {};
            nonRejected.forEach(a => {
                if (a.vendor?.vendorId) {
                    budgets[a.vendor.vendorId] = a.allocatedBudget ?? '';
                }
            });
            setVendorBudgets(budgets);
        } catch (e) {
            console.error('Error loading assignments:', e);
            setExistingAssignments([]);
            setManageVendorsError('Failed to fetch assignments');
        }
    };

    const handleSaveProjectVendors = async (e) => {
        e.preventDefault();
        if (!selectedManage?.manageId) {
            alert('Select a project first.');
            return;
        }
        try {
            const token = await getToken();
            const schemeBudget = selectedManage?.scheme?.budget ?? null;
            const totalAllocated = getSelectedVendorsBudgetTotal();
            if (schemeBudget != null && totalAllocated > schemeBudget) {
                alert(`Total vendor budgets (₹${totalAllocated}) exceed scheme budget (₹${schemeBudget}).`);
                return;
            }

            const payloadVendors = selectedVendorIds.map(vendorId => ({
                vendorId,
                allocatedBudget: (() => {
                    const n = parseFloat(vendorBudgets[vendorId]);
                    return Number.isFinite(n) ? n : 0;
                })()
            }));

            const res = await fetch(`${API_URL}/api/ngo-vendor/manage/${selectedManage.manageId}/vendors/allocate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ vendors: payloadVendors })
            });

            if (res.ok) {
                alert('Vendors saved successfully!');
                setShowManageVendors(false);
                setSelectedManageId('');
                setSelectedManage(null);
                setExistingAssignments([]);
                setSelectedVendorIds([]);
                setVendorBudgets({});
            } else if (res.status === 409) {
                const errText = await res.text();
                alert(errText || 'Vendor budgets exceed scheme budget.');
            } else {
                alert('Failed to save vendors');
            }
        } catch (e) {
            console.error('Error saving vendors:', e);
            alert('Error saving vendors');
        }
    };

    const fetchInvoices = async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/invoice/visible`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
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

    const ngoInvoiceDecision = async (invoiceId, decision) => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/invoice/${invoiceId}/ngo/decision`, {
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
            <DashboardHeader title="NGO Dashboard" role="ngo" />

            <div className="dashboard-content">
                <div className="dashboard-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📁</div>
                        <div className="stat-content">
                            <h3>Active Projects</h3>
                            <p className="stat-value">{stats.activeProjects}</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-content">
                            <h3>Beneficiaries</h3>
                            <p className="stat-value">{stats.beneficiaries}</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-content">
                            <h3>Funds Received</h3>
                            <p className="stat-value">₹{stats.fundsReceived.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="action-section">
                    <h2>Quick Actions</h2>
                    <div className="action-buttons">
                        <button 
                            className="action-btn secondary"
                            onClick={() => navigate('/ngo-kyc')}
                        >
                            Verify KYC
                        </button>
                        <button 
                            className="action-btn primary"
                            onClick={() => {
                                fetchDashboardData();
                                setShowCreateProject(true);
                                setCreateProjectStep('scheme');
                                setCreatedManage(null);
                                setVendors([]);
                                setSelectedVendorIds([]);
                                setVendorBudgets({});
                                setVendorsError(null);
                            }}
                        >
                            New Project
                        </button>
                        <button
                            className="action-btn secondary"
                            onClick={openManageVendors}
                            disabled={!ngoDetails}
                            title={!ngoDetails ? "NGO details not loaded" : ""}
                        >
                            Manage Vendors
                        </button>
                        <button 
                            className="action-btn secondary"
                            onClick={() => setShowUploadDocs(true)}
                        >
                            Upload Documents
                        </button>
                        <button
                            className="action-btn secondary"
                            onClick={() => {
                                fetchInvoices();
                                setShowInvoices(true);
                            }}
                        >
                            Invoices
                        </button>
                        <button 
                            className="action-btn secondary"
                            onClick={() => setShowBeneficiaries(true)}
                        >
                            View Beneficiaries
                        </button>
                    </div>
                </div>
            </div>

            {/* Create Project Modal */}
            {showCreateProject && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h3>{createProjectStep === 'scheme' ? 'Create New Project' : 'Select Vendors'}</h3>
                            <button
                                className="close-btn"
                                onClick={() => {
                                    setShowCreateProject(false);
                                    setProjectForm({ schemeId: '' });
                                    setCreateProjectStep('scheme');
                                    setCreatedManage(null);
                                    setVendors([]);
                                    setSelectedVendorIds([]);
                                    setVendorBudgets({});
                                    setVendorsError(null);
                                }}
                            >
                                ×
                            </button>
                        </div>
                        {createProjectStep === 'scheme' ? (
                            <form onSubmit={handleCreateProject}>
                                <div className="form-group">
                                    <label>Filter by Category</label>
                                    <select 
                                        value={selectedCategory} 
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        style={{ marginBottom: '15px' }}
                                    >
                                        {['All', ...new Set(allSchemes.map(s => s.category).filter(Boolean))].map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
                                            <tr>
                                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Select</th>
                                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Scheme Name</th>
                                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Category</th>
                                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Region</th>
                                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Budget</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {schemes.map(scheme => (
                                                <tr 
                                                    key={scheme.schemeId} 
                                                    onClick={() => setProjectForm({...projectForm, schemeId: scheme.schemeId})}
                                                    style={{ 
                                                        cursor: 'pointer', 
                                                        backgroundColor: projectForm.schemeId === scheme.schemeId ? 'rgba(79, 70, 229, 0.25)' : 'transparent',
                                                        color: projectForm.schemeId === scheme.schemeId ? '#ffffff' : undefined,
                                                        borderBottom: '1px solid #f1f5f9'
                                                    }}
                                                >
                                                    <td style={{ padding: '12px' }}>
                                                        <input 
                                                            type="radio" 
                                                            name="selectedScheme" 
                                                            checked={projectForm.schemeId === scheme.schemeId}
                                                            onChange={() => setProjectForm({...projectForm, schemeId: scheme.schemeId})}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '12px' }}>{scheme.schemeName}</td>
                                                    <td style={{ padding: '12px' }}>{scheme.category || '-'}</td>
                                                    <td style={{ padding: '12px' }}>{scheme.region || '-'}</td>
                                                    <td style={{ padding: '12px' }}>₹{scheme.budget?.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                            {schemes.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                                                        {schemesError ? <span style={{color: 'red'}}>{schemesError}</span> : "No schemes available."}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                    <button 
                                        type="button" 
                                        className="action-btn secondary" 
                                        onClick={() => {
                                            setShowCreateProject(false);
                                            setProjectForm({ schemeId: '' });
                                            setCreateProjectStep('scheme');
                                            setCreatedManage(null);
                                            setVendors([]);
                                            setSelectedVendorIds([]);
                                            setVendorsError(null);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="submit-btn" 
                                        disabled={!projectForm.schemeId}
                                        style={{ width: 'auto', marginTop: 0 }}
                                    >
                                        Accept Project
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleAssignVendors}>
                                <div style={{ marginBottom: '10px', color: '#64748b' }}>
                                    Project created. You can assign vendors now or later.
                                </div>

                                <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
                                            <tr>
                                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Select</th>
                                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Vendor Name</th>
                                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Email</th>
                                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>GSTIN</th>
                                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>KYC Status</th>
                                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Budget (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vendors.map(vendor => (
                                                <tr
                                                    key={vendor.vendorId}
                                                    onClick={() => toggleVendorSelection(vendor.vendorId)}
                                                    style={{
                                                        cursor: 'pointer',
                                                        backgroundColor: selectedVendorIds.includes(vendor.vendorId) ? 'rgba(79, 70, 229, 0.25)' : 'transparent',
                                                        color: selectedVendorIds.includes(vendor.vendorId) ? '#ffffff' : undefined,
                                                        borderBottom: '1px solid #f1f5f9'
                                                    }}
                                                >
                                                    <td style={{ padding: '12px' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedVendorIds.includes(vendor.vendorId)}
                                                            onChange={() => toggleVendorSelection(vendor.vendorId)}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '12px' }}>{vendor.name || '-'}</td>
                                                    <td style={{ padding: '12px' }}>{vendor.email || '-'}</td>
                                                    <td style={{ padding: '12px' }}>{vendor.gstin || '-'}</td>
                                                    <td style={{ padding: '12px' }}>{vendor.kycStatus || '-'}</td>
                                                    <td style={{ padding: '12px' }}>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={vendorBudgets[vendor.vendorId] ?? ''}
                                                            onChange={(e) => setVendorBudget(vendor.vendorId, e.target.value)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            style={{ width: '120px' }}
                                                            disabled={!selectedVendorIds.includes(vendor.vendorId)}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                            {vendors.length === 0 && (
                                                <tr>
                                                    <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                                                        {vendorsError ? <span style={{color: 'red'}}>{vendorsError}</span> : "No vendors available."}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                                    <button
                                        type="button"
                                        className="action-btn secondary"
                                        onClick={() => setCreateProjectStep('scheme')}
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        className="action-btn secondary"
                                        onClick={() => {
                                            setShowCreateProject(false);
                                            setProjectForm({ schemeId: '' });
                                            setCreateProjectStep('scheme');
                                            setCreatedManage(null);
                                            setVendors([]);
                                            setSelectedVendorIds([]);
                                            setVendorBudgets({});
                                            setVendorsError(null);
                                        }}
                                    >
                                        Skip For Now
                                    </button>
                                    <button
                                        type="submit"
                                        className="submit-btn"
                                        disabled={selectedVendorIds.length === 0}
                                        style={{ width: 'auto', marginTop: 0 }}
                                    >
                                        Save Vendors
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {showManageVendors && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '900px' }}>
                        <div className="modal-header">
                            <h3>Manage Project Vendors</h3>
                            <button
                                className="close-btn"
                                onClick={() => {
                                    setShowManageVendors(false);
                                    setSelectedManageId('');
                                    setSelectedManage(null);
                                    setExistingAssignments([]);
                                    setSelectedVendorIds([]);
                                    setVendorBudgets({});
                                    setManageVendorsError(null);
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {manageVendorsError && (
                            <div style={{ marginBottom: '10px', color: 'red' }}>{manageVendorsError}</div>
                        )}

                        <div className="form-group">
                            <label>Select Project</label>
                            <select
                                value={selectedManageId}
                                onChange={(e) => {
                                    const id = e.target.value;
                                    setSelectedManageId(id);
                                    const m = ngoProjects.find(p => p.manageId === id) || null;
                                    setSelectedManage(m);
                                    setExistingAssignments([]);
                                    setSelectedVendorIds([]);
                                    setVendorBudgets({});
                                    if (id) {
                                        loadProjectAssignments(id);
                                    }
                                }}
                            >
                                <option value="">Select...</option>
                                {ngoProjects.map(p => (
                                    <option key={p.manageId} value={p.manageId}>
                                        {p.scheme?.schemeName || p.scheme?.name || 'Scheme'} (Budget: ₹{p.scheme?.budget?.toLocaleString?.() || p.scheme?.budget || 0})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedManage && (
                            <form onSubmit={handleSaveProjectVendors}>
                                <div style={{ marginBottom: '10px', color: '#64748b' }}>
                                    Scheme budget: ₹{selectedManage.scheme?.budget?.toLocaleString?.() || selectedManage.scheme?.budget || 0} | Selected total: ₹{getSelectedVendorsBudgetTotal()}
                                </div>

                                <div className="table-container" style={{ maxHeight: '320px', overflowY: 'auto', marginBottom: '20px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
                                            <tr>
                                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Select</th>
                                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Vendor</th>
                                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Email</th>
                                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Budget (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vendors.map(vendor => {
                                                const assignment = existingAssignments.find(a => a.vendor?.vendorId === vendor.vendorId) || null;
                                                const isRejected = (assignment?.status || '').toUpperCase() === 'REJECTED';
                                                const isExistingNonRejected = assignment && !isRejected;
                                                const status = (assignment?.status || '').toUpperCase();
                                                const statusClass = status === 'ACCEPTED' ? 'accepted' : status === 'REJECTED' ? 'rejected' : status === 'PENDING' ? 'pending' : '';
                                                const statusLabel = status === 'ACCEPTED' ? 'Accepted' : status === 'REJECTED' ? 'Rejected' : status === 'PENDING' ? 'Pending' : '-';
                                                return (
                                                    <tr
                                                        key={vendor.vendorId}
                                                        onClick={() => {
                                                            if (isExistingNonRejected) return;
                                                            toggleVendorSelection(vendor.vendorId);
                                                        }}
                                                        style={{
                                                            cursor: isExistingNonRejected ? 'default' : 'pointer',
                                                            backgroundColor: selectedVendorIds.includes(vendor.vendorId) ? 'rgba(79, 70, 229, 0.25)' : 'transparent',
                                                            color: selectedVendorIds.includes(vendor.vendorId) ? '#ffffff' : undefined,
                                                            borderBottom: '1px solid #f1f5f9'
                                                        }}
                                                    >
                                                        <td style={{ padding: '12px' }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedVendorIds.includes(vendor.vendorId)}
                                                                disabled={isExistingNonRejected}
                                                                onChange={() => {
                                                                    if (isExistingNonRejected) return;
                                                                    toggleVendorSelection(vendor.vendorId);
                                                                }}
                                                            />
                                                        </td>
                                                        <td style={{ padding: '12px' }}>{vendor.name || '-'}</td>
                                                        <td style={{ padding: '12px' }}>{vendor.email || '-'}</td>
                                                        <td style={{ padding: '12px' }}>
                                                            {statusLabel === '-' ? (
                                                                <span>-</span>
                                                            ) : (
                                                                <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '12px' }}>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={vendorBudgets[vendor.vendorId] ?? (assignment?.allocatedBudget ?? '')}
                                                                onChange={(e) => setVendorBudget(vendor.vendorId, e.target.value)}
                                                                onClick={(e) => e.stopPropagation()}
                                                                style={{ width: '120px' }}
                                                                disabled={!selectedVendorIds.includes(vendor.vendorId)}
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {vendors.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                                                        No vendors available.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                    <button type="button" className="action-btn secondary" onClick={() => setShowManageVendors(false)}>
                                        Close
                                    </button>
                                    <button type="submit" className="submit-btn" style={{ width: 'auto', marginTop: 0 }}>
                                        Save
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {showInvoices && (
                <div className="modal-overlay">
                    <div className="modal-content large-modal">
                        <div className="modal-header">
                            <h3>Invoices</h3>
                            <button className="close-btn" onClick={() => setShowInvoices(false)}>×</button>
                        </div>
                        <div className="table-container">
                            {invoices.length === 0 ? (
                                <p className="empty-state">{invoicesError || 'No invoices found.'}</p>
                            ) : (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Scheme</th>
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
                                            const statusClass = status === 'ACCEPTED' ? 'accepted' : status === 'REJECTED' ? 'rejected' : status === 'NGO_ACCEPTED' ? 'accepted' : 'pending';
                                            const gatewayBaseRaw = process.env.REACT_APP_IPFS_GATEWAY_BASE || 'https://gateway.pinata.cloud/ipfs/';
                                            const gatewayBase = gatewayBaseRaw.endsWith('/') ? gatewayBaseRaw : `${gatewayBaseRaw}/`;
                                            const ipfsUrl = inv.invoiceIpfsHash ? `${gatewayBase}${inv.invoiceIpfsHash}` : null;
                                            return (
                                                <tr key={inv.invoiceId}>
                                                    <td>{inv.manage?.scheme?.schemeName || inv.manage?.scheme?.name || '-'}</td>
                                                    <td>{inv.vendor?.name || inv.vendor?.email || '-'}</td>
                                                    <td>₹{Number(inv.amount || 0).toLocaleString()}</td>
                                                    <td>
                                                        <span className={`status-badge ${statusClass}`}>{status || 'PENDING'}</span>
                                                    </td>
                                                    <td>
                                                        {ipfsUrl ? <a href={ipfsUrl} target="_blank" rel="noreferrer">View</a> : '-'}
                                                    </td>
                                                    <td>
                                                        {status === 'PENDING' && (
                                                            <div className="action-buttons-small">
                                                                <button className="btn-accept" onClick={() => ngoInvoiceDecision(inv.invoiceId, 'ACCEPTED')}>Accept</button>
                                                                <button className="btn-reject" onClick={() => ngoInvoiceDecision(inv.invoiceId, 'REJECTED')}>Reject</button>
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

            {/* Upload Documents Modal (Mock) */}
            {showUploadDocs && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Upload Documents</h3>
                            <button className="close-btn" onClick={() => setShowUploadDocs(false)}>×</button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); alert("Document uploaded! IPFS Hash: QmHash..."); setShowUploadDocs(false); }}>
                            <div className="form-group">
                                <label>Document Type</label>
                                <select>
                                    <option>Impact Report</option>
                                    <option>Financial Statement</option>
                                    <option>Beneficiary List</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>File</label>
                                <input type="file" required />
                            </div>
                            <button type="submit" className="submit-btn">Upload</button>
                        </form>
                    </div>
                </div>
            )}

            {/* View Beneficiaries Modal (Mock) */}
            {showBeneficiaries && (
                <div className="modal-overlay">
                    <div className="modal-content large-modal">
                        <div className="modal-header">
                            <h3>Beneficiaries</h3>
                            <button className="close-btn" onClick={() => setShowBeneficiaries(false)}>×</button>
                        </div>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>ID</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>John Doe</td>
                                        <td className="monospace">BEN-001</td>
                                        <td><span className="status-badge success">Verified</span></td>
                                        <td>2024-01-15</td>
                                    </tr>
                                    <tr>
                                        <td>Jane Smith</td>
                                        <td className="monospace">BEN-002</td>
                                        <td><span className="status-badge pending">Pending</span></td>
                                        <td>2024-01-20</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NGODashboard;
