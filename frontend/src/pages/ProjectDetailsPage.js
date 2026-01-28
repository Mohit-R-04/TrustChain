import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './CitizenPage.css';

const ProjectDetailsPage = () => {
    const navigate = useNavigate();
    const { projectId } = useParams();
    const location = useLocation();

    const projects = [
        {
            id: '0',
            title: "Clean Water Initiative",
            location: "Maharashtra",
            category: "Water",
            progress: 75,
            amount: "₹12,50,000",
            donors: "5,000",
            description:
                "Installing community RO systems and repairing pipelines to provide safe drinking water in remote villages."
        },
        {
            id: '1',
            title: "Rural Education Program",
            location: "Bihar",
            category: "Education",
            progress: 45,
            amount: "₹8,00,000",
            donors: "2,500",
            description:
                "Upgrading classrooms, providing learning materials, and enabling after-school tutoring for rural students."
        },
        {
            id: '2',
            title: "Health Camp Network",
            location: "Rajasthan",
            category: "Health",
            progress: 90,
            amount: "₹6,50,000",
            donors: "8,000",
            description:
                "Recurring mobile health camps with diagnostics, medicines, and specialist consultations across districts."
        },
        {
            id: '3',
            title: "Solar Village Project",
            location: "Gujarat",
            category: "Infrastructure",
            progress: 30,
            amount: "₹15,00,000",
            donors: "3,000",
            description:
                "Deploying solar microgrids, streetlights, and basic electrification for community facilities."
        },
        {
            id: '4',
            title: "Women Empowerment",
            location: "Uttar Pradesh",
            category: "Education",
            progress: 65,
            amount: "₹4,20,000",
            donors: "1,500",
            description:
                "Skill training, micro-entrepreneur support, and awareness programs focused on women-led livelihoods."
        },
        {
            id: '5',
            title: "Tribal Healthcare",
            location: "Jharkhand",
            category: "Health",
            progress: 55,
            amount: "₹9,80,000",
            donors: "6,000",
            description:
                "Primary healthcare outreach and preventive care programs in tribal areas with local health workers."
        }
    ];

    const projectFromState = location?.state?.project;
    const projectFromList = projects.find(p => p.id === String(projectId));
    const project = projectFromState || projectFromList;

    const [commentText, setCommentText] = React.useState('');
    const [commentImage, setCommentImage] = React.useState(null);
    const [commentImagePreview, setCommentImagePreview] = React.useState('');

    const [email, setEmail] = React.useState('');
    const [otp, setOtp] = React.useState('');
    const [isOtpSent, setIsOtpSent] = React.useState(false);
    const [isOtpVerified, setIsOtpVerified] = React.useState(false);
    const [statusMessage, setStatusMessage] = React.useState('');
    const [timer, setTimer] = React.useState(0);

    const commentsStorageKey = React.useMemo(() => {
        if (!project) return 'project-comments-unknown';
        return `project-comments-${project.id}`;
    }, [project]);

    const votesStorageKey = React.useMemo(() => {
        if (!project) return 'project-comment-votes-unknown';
        return `project-comment-votes-${project.id}`;
    }, [project]);

    const [comments, setComments] = React.useState(() => {
        try {
            const raw = window.localStorage.getItem(commentsStorageKey);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed)
                ? parsed.map((c) => ({
                    ...c,
                    score: typeof c?.score === 'number' ? c.score : 0
                }))
                : [];
        } catch {
            return [];
        }
    });

    const [votes, setVotes] = React.useState(() => {
        try {
            const raw = window.localStorage.getItem(votesStorageKey);
            const parsed = raw ? JSON.parse(raw) : {};
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch {
            return {};
        }
    });

    React.useEffect(() => {
        try {
            window.localStorage.setItem(commentsStorageKey, JSON.stringify(comments));
        } catch {
        }
    }, [comments, commentsStorageKey]);

    React.useEffect(() => {
        try {
            window.localStorage.setItem(votesStorageKey, JSON.stringify(votes));
        } catch {
        }
    }, [votes, votesStorageKey]);

    React.useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [timer]);

    const resetOtpState = () => {
        setOtp('');
        setIsOtpSent(false);
        setIsOtpVerified(false);
        setStatusMessage('');
        setTimer(0);
    };

    const validateEmail = (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    };

    const handleSendOtp = async () => {
        if (!email) {
            setStatusMessage('Please enter an email address.');
            return;
        }
        if (!validateEmail(email)) {
            setStatusMessage('Please enter a valid email address.');
            return;
        }

        setStatusMessage('Sending OTP...');
        try {
            const response = await fetch('http://localhost:8080/api/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (response.ok) {
                setIsOtpSent(true);
                setTimer(30);
                setStatusMessage('OTP sent. Please check your email.');
            } else {
                const text = await response.text().catch(() => '');
                setStatusMessage(text || 'Failed to send OTP. Please try again.');
            }
        } catch {
            setStatusMessage('Unable to reach server. Please ensure backend is running.');
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            setStatusMessage('Please enter the OTP.');
            return;
        }
        if (String(otp).length < 6) {
            setStatusMessage('OTP must be 6 digits.');
            return;
        }
        if (timer === 0) {
            setStatusMessage('OTP expired. Please resend OTP.');
            return;
        }

        setStatusMessage('Verifying OTP...');
        try {
            const response = await fetch('http://localhost:8080/api/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });
            if (response.ok) {
                setIsOtpVerified(true);
                setStatusMessage('Email verified. You can post a comment now.');
            } else {
                const text = await response.text().catch(() => '');
                setStatusMessage(text || 'Invalid or expired OTP.');
            }
        } catch {
            setStatusMessage('Unable to reach server. Please ensure backend is running.');
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) {
            setCommentImage(null);
            setCommentImagePreview('');
            return;
        }
        if (!file.type.startsWith('image/')) {
            setStatusMessage('Please upload a valid image file.');
            return;
        }
        setCommentImage(file);
        const reader = new FileReader();
        reader.onload = () => {
            const result = typeof reader.result === 'string' ? reader.result : '';
            setCommentImagePreview(result);
        };
        reader.readAsDataURL(file);
    };

    const handlePostComment = (e) => {
        e.preventDefault();
        if (!isOtpVerified) {
            setStatusMessage('Please verify your email with OTP before commenting.');
            return;
        }
        if (!commentText.trim() && !commentImagePreview) {
            setStatusMessage('Please add a comment or upload an image.');
            return;
        }

        const newComment = {
            id: `${Date.now()}`,
            email,
            text: commentText.trim(),
            image: commentImagePreview || '',
            score: 0,
            createdAt: new Date().toISOString()
        };

        setComments(prev => [newComment, ...prev]);
        setCommentText('');
        setCommentImage(null);
        setCommentImagePreview('');
        resetOtpState();
        setEmail('');
        setStatusMessage('Comment posted successfully.');
    };

    const handleVote = (commentId, direction) => {
        const currentVote = votes?.[commentId] || null;
        let nextVote = currentVote;
        let delta = 0;

        if (direction === 'up') {
            if (currentVote === 'up') {
                nextVote = null;
                delta = -1;
            } else if (currentVote === 'down') {
                nextVote = 'up';
                delta = 2;
            } else {
                nextVote = 'up';
                delta = 1;
            }
        } else if (direction === 'down') {
            if (currentVote === 'down') {
                nextVote = null;
                delta = 1;
            } else if (currentVote === 'up') {
                nextVote = 'down';
                delta = -2;
            } else {
                nextVote = 'down';
                delta = -1;
            }
        }

        setComments((prev) =>
            prev.map((c) => {
                if (c.id !== commentId) return c;
                const currentScore = typeof c.score === 'number' ? c.score : 0;
                return { ...c, score: currentScore + delta };
            })
        );

        setVotes((prev) => {
            const updated = { ...(prev || {}) };
            if (!nextVote) {
                delete updated[commentId];
                return updated;
            }
            updated[commentId] = nextVote;
            return updated;
        });
    };

    if (!project) {
        return (
            <div className="citizen-container">
                <nav className="citizen-nav">
                    <div className="nav-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/citizen')}>
                        <span className="logo-icon">🔗</span>
                        <h2>Trust<span className="highlight">Chain</span></h2>
                    </div>
                    <button className="nav-login-btn" onClick={() => navigate('/citizen')}>Back</button>
                </nav>
                <div className="project-details-wrap">
                    <div className="project-details-card">
                        <h2 className="project-details-title">Project not found</h2>
                        <p className="project-details-subtitle">Please go back and choose a project.</p>
                        <button className="btn-primary" onClick={() => navigate('/citizen')} style={{ marginTop: '16px' }}>
                            Go to Citizen Page
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const statusIsError = /failed|invalid|error|unable|expired|must|please/i.test(statusMessage);
    const statusIsSuccess = /sent|verified|success/i.test(statusMessage) && !statusIsError;

    return (
        <div className="citizen-container">
            <nav className="citizen-nav">
                <div className="nav-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/citizen')}>
                    <span className="logo-icon">🔗</span>
                    <h2>Trust<span className="highlight">Chain</span></h2>
                </div>
                <button className="nav-login-btn" onClick={() => navigate('/citizen')}>Back</button>
            </nav>

            <div className="project-details-wrap">
                <div className="project-details-card animate-scale-in">
                    <div className="project-details-header">
                        <div>
                            <div className="project-details-badge">{project.category}</div>
                            <h1 className="project-details-title">{project.title}</h1>
                            <p className="project-details-subtitle">📍 {project.location}</p>
                        </div>
                        <div className="project-details-metrics">
                            <div className="project-details-metric">
                                <span className="metric-label">Amount</span>
                                <span className="metric-value">{project.amount}</span>
                            </div>
                            <div className="project-details-metric">
                                <span className="metric-label">Donors</span>
                                <span className="metric-value">{project.donors}</span>
                            </div>
                        </div>
                    </div>

                    <div className="project-details-progress">
                        <div className="progress-info">
                            <span>Progress</span>
                            <span>{project.progress}%</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
                        </div>
                    </div>

                    <div className="project-details-section">
                        <h3 className="section-title-small">About this project</h3>
                        <p className="project-details-text">{project.description}</p>
                    </div>

                    <div className="project-details-divider"></div>

                    <div className="project-details-section">
                        <h3 className="section-title-small">Comments</h3>

                        <div className="comment-box">
                            <div className="comment-otp">
                                <div className="comment-otp-header">
                                    <div className="comment-otp-title">Verify email before commenting</div>
                                    {isOtpVerified && <div className="comment-otp-pill">Verified</div>}
                                </div>

                                <div className="comment-otp-grid">
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                setStatusMessage('');
                                                setIsOtpVerified(false);
                                                if (!isOtpSent) setTimer(0);
                                            }}
                                            placeholder="you@example.com"
                                            className="form-input"
                                            disabled={isOtpSent && timer > 0}
                                        />
                                    </div>

                                    {!isOtpSent ? (
                                        <button type="button" className="btn-primary" onClick={handleSendOtp}>
                                            Send OTP
                                        </button>
                                    ) : (
                                        <div className="comment-otp-actions">
                                            <div className="form-group" style={{ margin: 0 }}>
                                                <label>OTP</label>
                                                <div style={{ position: 'relative' }}>
                                                    <input
                                                        type="text"
                                                        value={otp}
                                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                        placeholder="6 digits"
                                                        className="form-input"
                                                        maxLength={6}
                                                        style={{ letterSpacing: '2px', fontSize: '1.05rem', fontWeight: 600 }}
                                                    />
                                                    <span className="otp-timer">
                                                        00:{timer < 10 ? `0${timer}` : timer}
                                                    </span>
                                                </div>
                                            </div>
                                            <button type="button" className="btn-primary" onClick={handleVerifyOtp}>
                                                Verify
                                            </button>
                                            <button
                                                type="button"
                                                className="link-button"
                                                disabled={timer > 0}
                                                onClick={() => {
                                                    if (timer === 0) {
                                                        setIsOtpSent(false);
                                                        setOtp('');
                                                        setStatusMessage('');
                                                    }
                                                }}
                                            >
                                                {timer > 0 ? `Resend in ${timer}s` : 'Resend / Change email'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <form className="comment-form" onSubmit={handlePostComment}>
                                <div className="comment-form-row">
                                    <textarea
                                        className="form-textarea"
                                        rows="4"
                                        placeholder="Write your comment..."
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                    />
                                </div>

                                <div className="comment-form-row">
                                    <div className="comment-upload">
                                        <label className="comment-upload-label">
                                            <input type="file" accept="image/*" onChange={handleImageChange} />
                                            Upload image
                                        </label>
                                        {commentImage && (
                                            <div className="comment-upload-meta">
                                                {commentImage.name}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {commentImagePreview && (
                                    <div className="comment-preview">
                                        <img src={commentImagePreview} alt="Preview" />
                                    </div>
                                )}

                                {statusMessage && (
                                    <div className={`status-banner ${statusIsError ? 'status-error' : statusIsSuccess ? 'status-success' : 'status-neutral'}`}>
                                        {statusMessage}
                                    </div>
                                )}

                                <div className="comment-actions">
                                    <button type="submit" className="btn-primary" disabled={!isOtpVerified}>
                                        Post Comment
                                    </button>
                                    {!isOtpVerified && (
                                        <div className="comment-hint">
                                            Verify OTP to enable posting.
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>

                        <div className="comments-list">
                            {comments.length === 0 ? (
                                <div className="empty-comments">
                                    No comments yet. Be the first to comment.
                                </div>
                            ) : (
                                comments.map(c => (
                                    <div className="comment-item" key={c.id}>
                                        <div className="comment-meta">
                                            <div className="comment-email">{c.email || 'Anonymous'}</div>
                                            <div className="comment-date">
                                                {new Date(c.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="comment-votes">
                                            <button
                                                type="button"
                                                className={`vote-btn ${votes?.[c.id] === 'up' ? 'active' : ''}`}
                                                onClick={() => handleVote(c.id, 'up')}
                                                aria-label="Upvote"
                                            >
                                                ▲
                                            </button>
                                            <div className="vote-count">{typeof c.score === 'number' ? c.score : 0}</div>
                                            <button
                                                type="button"
                                                className={`vote-btn ${votes?.[c.id] === 'down' ? 'active' : ''}`}
                                                onClick={() => handleVote(c.id, 'down')}
                                                aria-label="Downvote"
                                            >
                                                ▼
                                            </button>
                                        </div>
                                        {c.text && <div className="comment-text">{c.text}</div>}
                                        {c.image && (
                                            <div className="comment-image">
                                                <img src={c.image} alt="Comment attachment" />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <footer className="citizen-footer">
                <p>Secured by blockchain technology • Transparent • Immutable</p>
            </footer>
        </div>
    );
};

export default ProjectDetailsPage;
