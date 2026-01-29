import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import './StripePayment.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const StripePayment = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const [amountInr, setAmountInr] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [blockchainEnabled, setBlockchainEnabled] = useState(false);
    const [blockchainDemoMode, setBlockchainDemoMode] = useState(false);
    const [blockchainTxHash, setBlockchainTxHash] = useState(null);
    const [blockchainStatusError, setBlockchainStatusError] = useState(null);

    // Form states
    const [cardDetails, setCardDetails] = useState({
        number: '',
        expiry: '',
        cvc: ''
    });
    const [upiId, setUpiId] = useState('');

    // Retrieve scheme details from navigation state
    const { schemeId, schemeName } = state || {};
    const inrToWeiMultiplier = window.BigInt('100000000000');
    const amoyChainIdHex = '0x13882';

    const getOnChainWeiForInr = () => {
        try {
            if (!amountInr) return null;
            const inr = window.BigInt(amountInr);
            if (inr <= 0) return null;
            return inr * inrToWeiMultiplier;
        } catch {
            return null;
        }
    };

    const getOnChainPolForInr = () => {
        const wei = getOnChainWeiForInr();
        if (!wei) return null;
        const whole = wei / window.BigInt('1000000000000000000');
        const frac = (wei % window.BigInt('1000000000000000000')).toString().padStart(18, '0').replace(/0+$/, '');
        return frac ? `${whole.toString()}.${frac}` : whole.toString();
    };

    const ensurePolygonAmoyNetwork = async () => {
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (currentChainId === amoyChainIdHex) return;
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: amoyChainIdHex }]
            });
        } catch (e) {
            if (e && (e.code === 4902 || e?.data?.originalError?.code === 4902)) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: amoyChainIdHex,
                            chainName: 'Polygon Amoy',
                            rpcUrls: ['https://rpc-amoy.polygon.technology'],
                            nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
                            blockExplorerUrls: ['https://amoy.polygonscan.com']
                        }
                    ]
                });
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: amoyChainIdHex }]
                });
            } else {
                throw new Error('Switch MetaMask network to Polygon Amoy (chainId 80002) and try again');
            }
        }
        const after = await window.ethereum.request({ method: 'eth_chainId' });
        if (after !== amoyChainIdHex) {
            throw new Error('MetaMask network must be Polygon Amoy (chainId 80002)');
        }
    };

    useEffect(() => {
        fetchBlockchainStatus();
    }, []);

    const fetchBlockchainStatus = async () => {
        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/api/blockchain/status`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                return;
            }
            const data = await response.json();
            setBlockchainEnabled(!!data.enabled && !!data.contractAddress);
            setBlockchainDemoMode(!!data.demoMode);
        } catch (err) {
            setBlockchainStatusError(err?.message || 'Failed to load blockchain status');
        }
    };

    if (!schemeId) {
        return (
            <div className="stripe-container">
                <div className="error-message">Invalid session. Please select a scheme again.</div>
                <button onClick={() => navigate('/')}>Go Back</button>
            </div>
        );
    }

    const handleCardChange = (e) => {
        setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setBlockchainTxHash(null);

        try {
            // Validation
            if (paymentMethod === 'card') {
                if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc) {
                    throw new Error('Please enter all card details');
                }
            } else {
                if (!upiId || !upiId.includes('@')) {
                    throw new Error('Please enter a valid UPI ID');
                }
            }

            const token = await getToken();
            const response = await fetch(`${API_URL}/api/donor/donate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    schemeId: schemeId,
                    schemeName: schemeName,
                    amount: parseFloat(amountInr),
                    paymentToken: paymentMethod === 'card' ? "tok_visa" : "tok_upi_mock"
                })
            });

            const data = await response.json();

            if (response.ok) {
                if (blockchainEnabled) {
                    const token = await getToken();
                    const onChainWei = getOnChainWeiForInr();
                    if (!onChainWei) {
                        throw new Error('Enter a valid INR amount');
                    }

                    let donorAddress = '0x0000000000000000000000000000000000000000';
                    if (window.ethereum) {
                        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                        if (accounts?.[0]) donorAddress = accounts[0];
                    } else if (!blockchainDemoMode) {
                        throw new Error('Blockchain is enabled, but MetaMask is not available. Open http://localhost:3000 in Chrome/Brave with MetaMask installed (IDE preview browsers do not support extensions).');
                    }

                    let txHashToStore = '';

                    if (blockchainDemoMode) {
                        txHashToStore = '';
                    } else {
                        await ensurePolygonAmoyNetwork();
                        const txResponse = await fetch(
                            `${API_URL}/api/blockchain/tx/deposit/${schemeId}?amountWei=${encodeURIComponent(onChainWei.toString())}`,
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
                        if (!txData?.to || typeof txData.to !== 'string' || !txData.to.startsWith('0x') || txData.to.length !== 42) {
                            throw new Error('Invalid escrow contract address returned by backend');
                        }
                        const valueHex = '0x' + window.BigInt(txData.valueWei).toString(16);
                        const sentHash = await window.ethereum.request({
                            method: 'eth_sendTransaction',
                            params: [
                                {
                                    from: donorAddress,
                                    to: txData.to,
                                    value: valueHex,
                                    data: txData.data
                                }
                            ]
                        });
                        txHashToStore = sentHash;
                        setBlockchainTxHash(sentHash);
                    }
                    try {
                        window.localStorage.setItem('lastSchemeUuid', schemeId);
                        window.localStorage.setItem('lastDonationTxHash', txHashToStore);
                    } catch {
                    }
                }
                setSuccess(true);
                setTimeout(() => {
                    navigate('/donor'); // Navigate back to donor dashboard
                }, 3000);
            } else {
                setError(data.message || 'Payment failed');
            }
        } catch (err) {
            setError(err.message || 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="stripe-container">
                <div className="success-message">
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                    <h3>Payment Successful!</h3>
                    <p>Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="stripe-container">
            <div className="stripe-card">
                <div className="stripe-header">
                    <h2>TrustChain Secure Payment</h2>
                    <p>Powered by Stripe (Simulated)</p>
                </div>
                
                <div className="order-summary">
                    <h3>Donation for: {schemeName}</h3>
                </div>

                {error && <div className="stripe-error">{error}</div>}

                <div className="payment-method-selector">
                    <button 
                        className={`method-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('card')}
                    >
                        💳 Card
                    </button>
                    <button 
                        className={`method-btn ${paymentMethod === 'upi' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('upi')}
                    >
                        📱 UPI
                    </button>
                </div>

                <form onSubmit={handlePayment}>
                    <div className="stripe-form-group">
                        <label>Amount (₹)</label>
                        <input 
                            type="number" 
                            value={amountInr} 
                            onChange={(e) => setAmountInr(e.target.value)} 
                            min="1" 
                            step="1"
                            required 
                            placeholder="0"
                        />
                        <div style={{ marginTop: '8px', color: '#94a3b8', fontSize: '13px' }}>
                            Conversion: ₹100000 → 0.01 POL
                            {getOnChainPolForInr() && (
                                <div style={{ marginTop: '4px' }}>
                                    Your on-chain deposit: {getOnChainPolForInr()} POL
                                </div>
                            )}
                        </div>
                    </div>

                    {paymentMethod === 'card' ? (
                        <div className="stripe-form-group">
                            <label>Card Information</label>
                            <div className="card-element-mock">
                                <input 
                                    type="text" 
                                    name="number"
                                    placeholder="0000 0000 0000 0000" 
                                    className="card-number"
                                    value={cardDetails.number}
                                    onChange={handleCardChange}
                                    maxLength="19"
                                />
                                <input 
                                    type="text" 
                                    name="expiry"
                                    placeholder="MM/YY" 
                                    className="card-expiry"
                                    value={cardDetails.expiry}
                                    onChange={handleCardChange}
                                    maxLength="5"
                                />
                                <input 
                                    type="text" 
                                    name="cvc"
                                    placeholder="CVC" 
                                    className="card-cvc"
                                    value={cardDetails.cvc}
                                    onChange={handleCardChange}
                                    maxLength="3"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="stripe-form-group">
                            <label>UPI ID</label>
                            <input 
                                type="text" 
                                placeholder="username@bank" 
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                            />
                            <small style={{color: '#666', marginTop: '5px', display: 'block'}}>
                                Enter any valid UPI ID (e.g., user@okhdfcbank)
                            </small>
                        </div>
                    )}

                    <button type="submit" className="stripe-pay-btn" disabled={loading}>
                        {loading ? 'Processing...' : `Pay ₹${amountInr || '0'} via ${paymentMethod === 'card' ? 'Card' : 'UPI'}`}
                    </button>
                </form>

                {blockchainStatusError && (
                    <div className="stripe-error">{blockchainStatusError}</div>
                )}

                {blockchainEnabled && (
                    <div style={{ marginTop: '16px', color: '#e2e8f0', fontSize: '13px' }}>
                        Blockchain deposit will be requested via MetaMask after payment.
                        {blockchainTxHash && (
                            <div style={{ marginTop: '8px', wordBreak: 'break-all' }}>
                                On-chain Tx: {blockchainTxHash}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StripePayment;
