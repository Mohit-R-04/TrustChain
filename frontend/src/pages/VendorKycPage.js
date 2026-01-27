import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import './VendorKycPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const VendorKycPage = () => {
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const navigate = useNavigate();

    // States for inputs
    const [aadhaarNumber, setAadhaarNumber] = useState('');
    const [panNumber, setPanNumber] = useState('');

    // States for verification status
    const [aadhaarStatus, setAadhaarStatus] = useState('PENDING'); // PENDING, VERIFIED, FAILED
    const [panStatus, setPanStatus] = useState('PENDING'); // PENDING, VERIFIED, FAILED

    // States for verificaton data
    const [aadhaarData, setAadhaarData] = useState(null);
    const [panData, setPanData] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Initial check for existing records
    useEffect(() => {
        if (isLoaded && user) {
            checkExistingKyc();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded, user]);

    const checkExistingKyc = async () => {
        try {
            const token = await getToken();
            const headers = { 'Authorization': `Bearer ${token}` };

            // Check Aadhaar
            const aadhaarRes = await fetch(`${API_URL}/api/kyc/${user.id}/record`, { headers });
            if (aadhaarRes.ok) {
                const data = await aadhaarRes.json();
                setAadhaarData(data);
                setAadhaarStatus('VERIFIED');
                setAadhaarNumber(data.aadhaarNumber || ''); // Might be masked
            }

            // Check PAN
            const panRes = await fetch(`${API_URL}/api/pan/${user.id}/record`, { headers });
            if (panRes.ok) {
                const data = await panRes.json();
                setPanData(data);
                setPanStatus('VERIFIED');
                setPanNumber(data.panNumber || ''); // Might be masked
            }
        } catch (err) {
            console.error("Error fetching KYC records", err);
        }
    };

    const handleAadhaarVerify = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/api/kyc/${user.id}/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ aadhaarNumber, consent: 'Y' })
            });

            const data = await response.json();

            if (data.success) {
                setAadhaarStatus('VERIFIED');
                setAadhaarData(data); // Use response data immediately
            } else {
                setAadhaarStatus('FAILED');
                setError(data.message || 'Verification failed');
            }
        } catch (err) {
            setAadhaarStatus('FAILED');
            setError('Network error or server unavailable');
        } finally {
            setLoading(false);
        }
    };

    const handlePanVerify = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/api/pan/${user.id}/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ panNumber, consent: 'Y' })
            });

            const data = await response.json();

            if (data.success) {
                setPanStatus('VERIFIED');
                setPanData(data); // Use response data immediately
            } else {
                setPanStatus('FAILED');
                setError(data.message || 'Verification failed');
            }
        } catch (err) {
            setPanStatus('FAILED');
            setError('Network error or server unavailable');
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = () => {
        navigate('/vendor-dashboard');
    };

    if (!isLoaded) return <div>Loading...</div>;

    const isAadhaarVerified = aadhaarStatus === 'VERIFIED';
    const isPanVerified = panStatus === 'VERIFIED';
    const isAllVerified = isAadhaarVerified && isPanVerified;

    return (
        <div className="kyc-container">
            <div className="kyc-card">
                <div className="kyc-header">
                    <h1>Vendor Verification</h1>
                    <p>Complete your KYC to activate your vendor account</p>
                </div>

                <div className="kyc-steps">
                    {/* Aadhaar Step */}
                    <div className={`kyc-step ${isAadhaarVerified ? 'completed' : 'active'}`}>
                        <div className="step-header">
                            <div className="step-number">{isAadhaarVerified ? '✓' : '1'}</div>
                            <div className="step-title">Aadhaar Verification</div>
                        </div>

                        {!isAadhaarVerified ? (
                            <>
                                <div className="input-group">
                                    <label className="input-label">Aadhaar Number</label>
                                    <input
                                        type="text"
                                        className="text-input"
                                        placeholder="Enter 12-digit Aadhaar Number"
                                        value={aadhaarNumber}
                                        onChange={(e) => setAadhaarNumber(e.target.value)}
                                        maxLength={12}
                                        disabled={loading}
                                    />
                                </div>
                                <button
                                    className="action-btn"
                                    onClick={handleAadhaarVerify}
                                    disabled={!aadhaarNumber || aadhaarNumber.length !== 12 || loading}
                                >
                                    {loading ? 'Verifying...' : 'Verify Aadhaar'}
                                </button>
                                {error && aadhaarStatus === 'FAILED' && <p style={{ color: '#ef4444', marginTop: '10px' }}>{error}</p>}
                            </>
                        ) : (
                            <div className="verification-details">
                                <div className="success-message">
                                    <span>Verified Successfully</span>
                                </div>
                                {aadhaarData && (
                                    <div style={{ marginTop: '10px' }}>
                                        <div className="detail-row">
                                            <span className="detail-label">Name:</span>
                                            <span>{aadhaarData.name}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">DOB:</span>
                                            <span>{aadhaarData.dateOfBirth}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* PAN Step - Only enabled after Aadhaar is verified (optional, but good flow) */}
                    <div className={`kyc-step ${isPanVerified ? 'completed' : (!isAadhaarVerified ? '' : 'active')}`} style={{ opacity: !isAadhaarVerified ? 0.5 : 1, pointerEvents: !isAadhaarVerified ? 'none' : 'auto' }}>
                        <div className="step-header">
                            <div className="step-number">{isPanVerified ? '✓' : '2'}</div>
                            <div className="step-title">PAN Verification</div>
                        </div>

                        {!isPanVerified ? (
                            <>
                                <div className="input-group">
                                    <label className="input-label">PAN Number</label>
                                    <input
                                        type="text"
                                        className="text-input"
                                        placeholder="Enter 10-character PAN (e.g., ABCDE1234F)"
                                        value={panNumber}
                                        onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                                        maxLength={10}
                                        disabled={loading}
                                    />
                                </div>
                                <button
                                    className="action-btn"
                                    onClick={handlePanVerify}
                                    disabled={!panNumber || panNumber.length !== 10 || loading}
                                >
                                    {loading ? 'Verifying...' : 'Verify PAN'}
                                </button>
                                {error && panStatus === 'FAILED' && <p style={{ color: '#ef4444', marginTop: '10px' }}>{error}</p>}
                            </>
                        ) : (
                            <div className="verification-details">
                                <div className="success-message">
                                    <span>Verified Successfully</span>
                                </div>
                                {panData && (
                                    <div style={{ marginTop: '10px' }}>
                                        <div className="detail-row">
                                            <span className="detail-label">Name:</span>
                                            <span>{panData.name}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Category:</span>
                                            <span>{panData.category}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Completion Button */}
                    {isAllVerified && (
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <button
                                className="action-btn"
                                style={{ background: '#10B981' }}
                                onClick={handleComplete}
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorKycPage;
