import React, { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const BlockchainPanel = ({ getToken, scope }) => {
    const [status, setStatus] = useState(null);
    const [escrow, setEscrow] = useState(null);
    const [events, setEvents] = useState([]);
    const [error, setError] = useState(null);

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
        const load = async () => {
            try {
                setError(null);
                const [statusRes, escrowRes] = await Promise.all([
                    fetch(`${API_URL}/api/public/blockchain/status`),
                    fetch(`${API_URL}/api/public/blockchain/escrow/balance`)
                ]);
                if (statusRes.ok) {
                    setStatus(await statusRes.json());
                }
                if (escrowRes.ok) {
                    setEscrow(await escrowRes.json());
                }

                let nextEvents = [];
                if (scope === 'donor' && typeof getToken === 'function') {
                    const token = await getToken();
                    const fromAddress = window.localStorage.getItem('trustchain_wallet_address') || '';
                    const url = `${API_URL}/api/donor/blockchain/events${fromAddress ? `?fromAddress=${encodeURIComponent(fromAddress)}` : ''}`;
                    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
                    if (res.ok) {
                        const data = await res.json();
                        nextEvents = Array.isArray(data) ? data : [];
                    }
                }
                if (nextEvents.length === 0) {
                    const eventsRes = await fetch(`${API_URL}/api/public/blockchain/events/recent`);
                    if (eventsRes.ok) {
                        const data = await eventsRes.json();
                        nextEvents = Array.isArray(data) ? data : [];
                    }
                }
                setEvents(nextEvents);
            } catch (e) {
                setError(e?.message || 'Failed to load blockchain info');
            }
        };
        load();
    }, [getToken, scope]);

    if (status && !status.enabled) {
        return null;
    }

    return (
        <div className="action-section">
            <h2>Blockchain</h2>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '16px', padding: '16px', display: 'grid', gap: '10px' }}>
                {error && <div style={{ color: '#ef4444' }}>{error}</div>}
                {status && (
                    <div style={{ display: 'grid', gap: '6px' }}>
                        <div style={{ color: '#e2e8f0' }}>
                            Status: {status.enabled ? 'Enabled' : 'Disabled'}
                            {status.demoMode ? <span style={{ marginLeft: '8px', color: '#f59e0b', fontWeight: 700 }}>DEMO</span> : null}
                        </div>
                        <div style={{ color: '#94a3b8' }}>ChainId: {status.chainId}</div>
                        {status.contractAddress && (
                            <div style={{ color: '#94a3b8', wordBreak: 'break-all' }}>
                                Escrow Contract: {status.contractAddress}
                            </div>
                        )}
                    </div>
                )}
                {escrow?.balanceWei && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'baseline' }}>
                        <div style={{ fontWeight: 700, color: '#e2e8f0' }}>Escrow Wallet (Global)</div>
                        <div style={{ fontWeight: 800, color: '#e2e8f0' }}>₹{formatInrBigInt(weiToInr(escrow.balanceWei) || 0)}</div>
                    </div>
                )}
                <div style={{ display: 'grid', gap: '8px' }}>
                    <div style={{ fontWeight: 700, color: '#e2e8f0' }}>
                        Recent Activity{scope === 'donor' ? ' (You)' : ' (Global)'}
                    </div>
                    {events.length === 0 ? (
                        <div style={{ color: '#94a3b8' }}>No recent blockchain events found.</div>
                    ) : (
                        <div style={{ display: 'grid', gap: '8px' }}>
                            {events.slice(0, 5).map((ev) => (
                                <div key={ev.eventId} style={{ display: 'grid', gap: '4px', padding: '10px', borderRadius: '12px', background: 'rgba(2, 6, 23, 0.35)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                                        <div style={{ fontWeight: 700 }}>
                                            {ev.eventName}
                                            {typeof ev.transactionHash === 'string' && ev.transactionHash.startsWith('demo-') && (
                                                <span style={{ marginLeft: '8px', color: '#f59e0b', fontWeight: 700 }}>DEMO</span>
                                            )}
                                        </div>
                                        <div style={{ color: '#94a3b8' }}>
                                            {ev.createdAt ? new Date(ev.createdAt).toLocaleString() : ''}
                                        </div>
                                    </div>
                                    {ev.amountWei && (
                                        <div style={{ color: '#e2e8f0' }}>
                                            Amount: ₹{formatInrBigInt(weiToInr(ev.amountWei) || 0)}
                                        </div>
                                    )}
                                    {ev.schemeId && <div style={{ color: '#94a3b8', wordBreak: 'break-all' }}>SchemeId: {ev.schemeId}</div>}
                                    {ev.fromAddress && <div style={{ color: '#94a3b8', wordBreak: 'break-all' }}>From: {ev.fromAddress}</div>}
                                    {ev.transactionHash && <div style={{ color: '#94a3b8', wordBreak: 'break-all' }}>Tx: {ev.transactionHash}</div>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BlockchainPanel;
