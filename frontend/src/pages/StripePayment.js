import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import './StripePayment.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const StripePayment = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Form states
    const [cardDetails, setCardDetails] = useState({
        number: '',
        expiry: '',
        cvc: ''
    });
    const [upiId, setUpiId] = useState('');

    // Retrieve scheme details from navigation state
    const { schemeId, schemeName } = state || {};

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
                    amount: parseFloat(amount),
                    paymentToken: paymentMethod === 'card' ? "tok_visa" : "tok_upi_mock"
                })
            });

            const data = await response.json();

            if (response.ok) {
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
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)} 
                            min="1" 
                            required 
                            placeholder="0.00"
                        />
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
                        {loading ? 'Processing...' : `Pay ₹${amount || '0'} via ${paymentMethod === 'card' ? 'Card' : 'UPI'}`}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StripePayment;
