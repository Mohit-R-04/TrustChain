import React, { useState, useEffect } from "react";
import "./GovernmentDonationForm.css";

const GovernmentDonationForm = ({ onClose }) => {
    const [schemes, setSchemes] = useState([]);
    const [selectedScheme, setSelectedScheme] = useState("");
    const [amount, setAmount] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        // Fetch schemes from backend
        fetch("http://localhost:8080/api/scheme")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setSchemes(data);
                } else {
                    console.error("API did not return an array:", data);
                    setSchemes([]);
                }
            })
            .catch((err) => {
                console.error("Error fetching schemes:", err);
                setSchemes([]);
            });
    }, []);

    const handleDonate = async () => {
        if (!selectedScheme || !amount) {
            alert("Please select a scheme and enter an amount.");
            return;
        }

        setIsProcessing(true);

        // Simulate payment processing delay
        setTimeout(async () => {
            try {
                // Record donation in backend
                const response = await fetch("http://localhost:8080/api/donation", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        amount: parseFloat(amount),
                        scheme: { schemeId: selectedScheme },
                        paymentIntentId: "SIMULATED_" + Date.now(),
                        donorName: "Anonymous",
                    }),
                });

                if (response.ok) {
                    alert("Donation Successful! (Simulated)");
                    setAmount("");
                    setSelectedScheme("");
                    if (onClose) onClose(); // Close modal on success
                } else {
                    alert("Failed to record donation.");
                }
            } catch (error) {
                console.error("Error recording donation:", error);
                alert("Error recording donation.");
            } finally {
                setIsProcessing(false);
            }
        }, 1500);
    };

    return (
        <div className="modal-overlay" onClick={(e) => {
            if (e.target.className === 'modal-overlay' && onClose) onClose();
        }}>
            <div className="donation-modal-container">
                <div className="form-header">
                    <h2>Make a Donation</h2>
                    {onClose && (
                        <button className="close-btn" onClick={onClose}>×</button>
                    )}
                </div>

                <div className="donation-inputs">
                    <div className="form-group">
                        <label>Select Scheme</label>
                        <select
                            value={selectedScheme}
                            onChange={(e) => setSelectedScheme(e.target.value)}
                            className="scheme-select"
                        >
                            <option value="">-- Select a Scheme --</option>
                            {schemes.map((scheme) => (
                                <option key={scheme.schemeId} value={scheme.schemeId}>
                                    {scheme.schemeName} (Target: ₹{scheme.budget})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Enter Amount (₹)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="amount-input"
                            min="1"
                            placeholder="e.g. 1000"
                        />
                    </div>

                    <div className="form-actions" style={{ marginTop: '20px' }}>
                        {onClose && (
                            <button className="cancel-btn" onClick={onClose}>
                                Cancel
                            </button>
                        )}
                        <button
                            onClick={handleDonate}
                            className="proceed-button"
                            disabled={isProcessing}
                        >
                            {isProcessing ? "Processing..." : "Donate Now"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GovernmentDonationForm;
