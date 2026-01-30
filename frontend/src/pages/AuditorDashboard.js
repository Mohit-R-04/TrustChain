import React from 'react';
import { useAuth } from '@clerk/clerk-react';
import DashboardHeader from '../components/DashboardHeader';
import BlockchainPanel from '../components/BlockchainPanel';
import './DashboardPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const AuditorDashboard = () => {
    const { getToken } = useAuth();

    const [schemes, setSchemes] = React.useState([]);
    const [schemesLoading, setSchemesLoading] = React.useState(false);

    const [showAuditModal, setShowAuditModal] = React.useState(false);
    const [selectedSchemeId, setSelectedSchemeId] = React.useState('');

    const [auditLoading, setAuditLoading] = React.useState(false);
    const [auditError, setAuditError] = React.useState('');
    const [auditSchemeName, setAuditSchemeName] = React.useState('');
    const [auditDeposits, setAuditDeposits] = React.useState([]);
    const [auditReleases, setAuditReleases] = React.useState([]);

    const [ipfsByCid, setIpfsByCid] = React.useState({});

    React.useEffect(() => {
        const loadSchemes = async () => {
            setSchemesLoading(true);
            try {
                const res = await fetch(`${API_URL}/api/scheme`);
                if (!res.ok) return;
                const data = await res.json();
                setSchemes(Array.isArray(data) ? data : []);
            } finally {
                setSchemesLoading(false);
            }
        };
        loadSchemes();
    }, []);

    const fetchIpfsJson = async (cid, suggestedFilename) => {
        if (!cid) return null;
        const bases = ['https://gateway.pinata.cloud', 'https://ipfs.io', 'https://w3s.link'];
        const gatewayUrls = [];
        for (const base of bases) {
            gatewayUrls.push(`${base}/ipfs/${cid}`);
            if (suggestedFilename) {
                gatewayUrls.push(`${base}/ipfs/${cid}/${suggestedFilename}`);
            }
        }

        let lastErr = null;
        for (const url of gatewayUrls) {
            try {
                const res = await fetch(url);
                if (!res.ok) {
                    lastErr = new Error(`HTTP ${res.status}`);
                    continue;
                }
                const text = await res.text();
                try {
                    return JSON.parse(text);
                } catch {
                    lastErr = new Error('Invalid JSON response');
                }
            } catch (e) {
                lastErr = e;
            }
        }
        throw lastErr || new Error('Failed to fetch from IPFS gateways');
    };

    const loadAuditTransactions = async () => {
        if (!selectedSchemeId) {
            setAuditError('Please select a scheme');
            return;
        }
        setAuditLoading(true);
        setAuditError('');
        setAuditSchemeName('');
        setAuditDeposits([]);
        setAuditReleases([]);
        setIpfsByCid({});
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/auditor/schemes/${selectedSchemeId}/audit-transactions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                setAuditError('Failed to load audit transactions');
                return;
            }
            const data = await res.json();
            setAuditSchemeName(data?.schemeName || '');
            const deposits = Array.isArray(data?.deposits) ? data.deposits : [];
            const releases = Array.isArray(data?.releases) ? data.releases : [];
            setAuditDeposits(deposits);
            setAuditReleases(releases);

            const allTx = [...deposits, ...releases];
            const cidHints = {};
            const cids = allTx
                .map((t) => {
                    const cid = t?.ipfsCid;
                    if (typeof cid === 'string' && cid.trim().length > 0 && t?.txHash && !cidHints[cid]) {
                        cidHints[cid] = `tx-${t.txHash}.json`;
                    }
                    return cid;
                })
                .filter((c) => typeof c === 'string' && c.trim().length > 0);
            const unique = Array.from(new Set(cids));

            const next = {};
            await Promise.all(
                unique.map(async (cid) => {
                    try {
                        const json = await fetchIpfsJson(cid, cidHints[cid]);
                        next[cid] = { status: 'loaded', json };
                    } catch (e) {
                        next[cid] = { status: 'error', error: e?.message || 'Failed to load' };
                    }
                })
            );
            setIpfsByCid(next);
        } catch (e) {
            setAuditError(e?.message || 'Failed to load audit transactions');
        } finally {
            setAuditLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <DashboardHeader title="Auditor Dashboard" role="auditor" />

            <div className="dashboard-content">
                <div className="dashboard-grid">
                    <div className="stat-card">
                        <div className="stat-icon">🔍</div>
                        <div className="stat-content">
                            <h3>Pending Audits</h3>
                            <p className="stat-value">0</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">⚠️</div>
                        <div className="stat-content">
                            <h3>Flagged Transactions</h3>
                            <p className="stat-value">0</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <h3>Verified Transactions</h3>
                            <p className="stat-value">0</p>
                        </div>
                    </div>
                </div>

                <div className="action-section">
                    <h2>Quick Actions</h2>
                    <div className="action-buttons">
                        <button className="action-btn primary" onClick={() => setShowAuditModal(true)}>Start Audit</button>
                        <button className="action-btn secondary">Flag Transaction</button>
                        <button className="action-btn secondary">Generate Report</button>
                    </div>
                </div>

                {showAuditModal && (
                    <div className="modal-overlay" onClick={() => setShowAuditModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>{auditSchemeName ? `Audit: ${auditSchemeName}` : 'Start Audit'}</h2>
                                <button className="close-btn" onClick={() => setShowAuditModal(false)}>×</button>
                            </div>

                            <div className="form-group">
                                <label>Select scheme</label>
                                <select
                                    value={selectedSchemeId}
                                    onChange={(e) => setSelectedSchemeId(e.target.value)}
                                    disabled={schemesLoading || auditLoading}
                                >
                                    <option value="">Choose a scheme…</option>
                                    {schemes.map((s) => (
                                        <option key={s.schemeId} value={s.schemeId}>
                                            {s.schemeName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="action-buttons" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                                <button className="action-btn primary" onClick={loadAuditTransactions} disabled={auditLoading || !selectedSchemeId}>
                                    {auditLoading ? 'Loading…' : 'Load Transactions'}
                                </button>
                                <button className="action-btn secondary" onClick={() => setShowAuditModal(false)} disabled={auditLoading}>
                                    Close
                                </button>
                            </div>

                            {auditError && (
                                <div style={{ marginTop: 16, color: '#fca5a5' }}>
                                    {auditError}
                                </div>
                            )}

                            {(auditDeposits.length > 0 || auditReleases.length > 0) && (
                                <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, background: 'rgba(15, 23, 42, 0.6)' }}>
                                        <h3 style={{ marginTop: 0, marginBottom: 12 }}>Donor → Wallet</h3>
                                        {auditDeposits.length === 0 ? (
                                            <div style={{ color: '#94a3b8' }}>No deposit transactions found.</div>
                                        ) : (
                                            auditDeposits.map((t) => (
                                                <div key={t.txHash} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 12, marginBottom: 12 }}>
                                                    <div style={{ fontWeight: 600, marginBottom: 6 }}>{t.txHash}</div>
                                                    <div style={{ color: '#cbd5e1', fontSize: 14 }}>
                                                        <div>From: {t.fromAddress}</div>
                                                        <div>To: {t.toAddress || '—'}</div>
                                                        {t.amountInr != null ? <div>Amount (INR): {t.amountInr}</div> : null}
                                                        {t.amountWei != null ? <div>Amount (wei): {t.amountWei}</div> : null}
                                                        <div>Root hash: {t.rootHash || t.ipfsCid || '—'}</div>
                                                    </div>
                                                    {t.ipfsCid && ipfsByCid[t.ipfsCid]?.status === 'loaded' && (
                                                        <pre style={{ marginTop: 10, whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: 'rgba(0,0,0,0.25)', padding: 10, borderRadius: 8, fontSize: 12 }}>
                                                            {JSON.stringify(ipfsByCid[t.ipfsCid].json, null, 2)}
                                                        </pre>
                                                    )}
                                                    {t.ipfsCid && ipfsByCid[t.ipfsCid]?.status === 'error' && (
                                                        <div style={{ marginTop: 10, color: '#fca5a5', fontSize: 13 }}>
                                                            Failed to load IPFS JSON: {ipfsByCid[t.ipfsCid].error}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, background: 'rgba(15, 23, 42, 0.6)' }}>
                                        <h3 style={{ marginTop: 0, marginBottom: 12 }}>Wallet → Vendor</h3>
                                        {auditReleases.length === 0 ? (
                                            <div style={{ color: '#94a3b8' }}>No release transactions found.</div>
                                        ) : (
                                            auditReleases.map((t) => (
                                                <div key={t.txHash} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 12, marginBottom: 12 }}>
                                                    <div style={{ fontWeight: 600, marginBottom: 6 }}>{t.txHash}</div>
                                                    <div style={{ color: '#cbd5e1', fontSize: 14 }}>
                                                        <div>From: {t.fromAddress || '—'}</div>
                                                        <div>To: {t.toAddress}</div>
                                                        {t.amountInr != null ? <div>Amount (INR): {t.amountInr}</div> : null}
                                                        {t.amountWei != null ? <div>Amount (wei): {t.amountWei}</div> : null}
                                                        <div>Invoice: {t.invoiceId || '—'}</div>
                                                        <div>Root hash: {t.rootHash || t.ipfsCid || '—'}</div>
                                                    </div>
                                                    {t.ipfsCid && ipfsByCid[t.ipfsCid]?.status === 'loaded' && (
                                                        <pre style={{ marginTop: 10, whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: 'rgba(0,0,0,0.25)', padding: 10, borderRadius: 8, fontSize: 12 }}>
                                                            {JSON.stringify(ipfsByCid[t.ipfsCid].json, null, 2)}
                                                        </pre>
                                                    )}
                                                    {t.ipfsCid && ipfsByCid[t.ipfsCid]?.status === 'error' && (
                                                        <div style={{ marginTop: 10, color: '#fca5a5', fontSize: 13 }}>
                                                            Failed to load IPFS JSON: {ipfsByCid[t.ipfsCid].error}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <BlockchainPanel />
            </div>
        </div>
    );
};

export default AuditorDashboard;
