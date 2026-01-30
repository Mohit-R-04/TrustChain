import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './ProjectDetailsPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const ProjectDetailsPage = () => {
    const navigate = useNavigate();
    const { projectId } = useParams();
    const location = useLocation();
    const projectFromState = location?.state?.project;
    const [project, setProject] = React.useState(projectFromState || null);
    const [projectLoading, setProjectLoading] = React.useState(false);
    const [projectError, setProjectError] = React.useState('');

    React.useEffect(() => {
        if (project) return;
        if (!projectId) return;
        const load = async () => {
            setProjectLoading(true);
            setProjectError('');
            try {
                const res = await fetch(`${API_URL}/api/scheme/${projectId}`);
                if (!res.ok) {
                    setProjectError('Failed to load project details');
                    return;
                }
                const scheme = await res.json();
                setProject({
                    id: scheme.schemeId,
                    title: scheme.schemeName,
                    location: scheme.region,
                    category: scheme.category,
                    progress: 0,
                    amountInr: scheme.budget,
                    donors: 0,
                    description: scheme.description
                });
            } catch (err) {
                setProjectError(err?.message || 'Failed to load project details');
            } finally {
                setProjectLoading(false);
            }
        };
        load();
    }, [project, projectId]);

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
            const response = await fetch(`${API_URL}/api/otp/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (response.ok) {
                setIsOtpSent(true);
                setTimer(30);
                const text = await response.text().catch(() => '');
                setStatusMessage(text || 'OTP sent. Please check your email.');
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

        setStatusMessage('Verifying OTP...');
        try {
            const response = await fetch(`${API_URL}/api/otp/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });
            if (response.ok) {
                setIsOtpVerified(true);
                setStatusMessage('');
            } else {
                const data = await response.json().catch(() => null);
                if (data && data.message) {
                    setStatusMessage(String(data.message));
                } else {
                    const text = await response.text().catch(() => '');
                    setStatusMessage(text || 'Invalid or expired OTP.');
                }
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

    if (projectLoading) {
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
                        <h2 className="project-details-title">Loading...</h2>
                    </div>
                </div>
            </div>
        );
    }

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
                        <p className="project-details-subtitle">{projectError || 'Please go back and choose a project.'}</p>
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
        <div className="project-details-container">
            <nav className="project-nav">
                <div className="project-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/citizen')}>
                    <span className="project-logo-icon">🔗</span>
                    <h2>Trust<span className="highlight">Chain</span></h2>
                </div>
                <button className="back-button" onClick={() => navigate('/citizen')}>Back</button>
            </nav>

            <div className="project-header">
                <div className="animate-scale-in">
                    <div className="content-section">
                        <div>
                            <div className={`project-category-badge ${String(project.category || '').toLowerCase()}`}>{project.category}</div>
                            <h1 className="project-title">{project.title}</h1>
                            <p className="project-location">📍 {project.location}</p>
                        </div>
                        <div className="project-stats-grid">
                            <div className="stat-card">
                                <span className="stat-label">Amount</span>
                                <span className="stat-value">₹{Number(project.amountInr || 0).toLocaleString()}</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Donors</span>
                                <span className="stat-value">{Number(project.donors || 0).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="progress-section" style={{ marginTop: '32px' }}>
                            <div className="progress-header">
                                <span>Progress</span>
                                <span>{project.progress}%</span>
                            </div>
                            <div className="progress-bar-container">
                                <div className="progress-bar-fill" style={{ width: `${project.progress}%` }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="content-section">
                        <h3 className="section-title">About this project</h3>
                        <p className="project-description">{project.description}</p>
                    </div>

                    <div className="content-section">
                        <h3 className="section-title">Comments</h3>

                        <div className="comments-section">
                            <div className="otp-section">
                                <div className="otp-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <div className="otp-title">Verify email before commenting</div>
                                    {isOtpVerified && <div className="otp-status success">Verified</div>}
                                </div>

                                <div>
                                    <div className="otp-input-group">

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
                                            className="otp-input"
                                            disabled={isOtpSent && timer > 0}
                                        />


                                        {!isOtpSent ? (
                                            <button type="button" className="otp-button" onClick={handleSendOtp}>
                                                Send OTP
                                            </button>
                                        ) : (
                                            <div className="comment-otp-actions">
                                                <div className="otp-input-group">

                                                    <div style={{ position: 'relative' }}>
                                                        <input
                                                            type="text"
                                                            value={otp}
                                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                            placeholder="6 digits"
                                                            className="otp-input otp-code"
                                                            maxLength={6}
                                                            style={{}}
                                                        />
                                                        <span className="otp-timer">
                                                            00:{timer < 10 ? `0${timer}` : timer}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button type="button" className="otp-button" onClick={handleVerifyOtp}>
                                                    Verify
                                                </button>
                                                <button
                                                    type="button"
                                                    className="otp-button"
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
                                    <div className="comment-form-row comment-input-group">
                                        <textarea
                                            className="comment-textarea"
                                            rows="4"
                                            placeholder="Write your comment..."
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                        />
                                    </div>

                                    <div className="comment-form-row">
                                        <div className="image-upload-section">
                                            <label className="file-label">
                                                <input type="file" className="file-input" accept="image/*" onChange={handleImageChange} />
                                                Upload image
                                            </label>
                                            {commentImage && (
                                                <div className="file-name">
                                                    {commentImage.name}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {commentImagePreview && (
                                        <div className="image-preview">
                                            <img src={commentImagePreview} alt="Preview" />
                                        </div>
                                    )}

                                    {statusMessage && (
                                        <div className={`otp-status ${statusIsError ? 'error' : statusIsSuccess ? 'success' : ''}`}>
                                            {statusMessage}
                                        </div>
                                    )}

                                    <div className="comment-actions">
                                        <button type="submit" className="submit-button" disabled={!isOtpVerified}>
                                            Post Comment
                                        </button>
                                        {!isOtpVerified && (
                                            <div className="otp-notice">
                                                Please verify email with OTP to enable posting.
                                            </div>
                                        )}
                                    </div>
                                </form>
                            </div>

                            <div className="comments-list">
                                {comments.length === 0 ? (
                                    <div className="no-comments">
                                        No comments yet. Be the first to comment.
                                    </div>
                                ) : (
                                    comments.map(c => (
                                        <div className="comment-card" key={c.id}>
                                            <div className="comment-header">
                                                <div className="comment-author">{c.email || 'Anonymous'}</div>
                                                <div className="comment-date">
                                                    {new Date(c.createdAt).toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="comment-actions" style={{ marginBottom: '16px' }}>
                                                <button
                                                    type="button"
                                                    className={`vote-button ${votes?.[c.id] === 'up' ? 'upvoted' : ''}`}
                                                    onClick={() => handleVote(c.id, 'up')}
                                                    aria-label="Upvote"
                                                >
                                                    ▲
                                                </button>
                                                <div className="vote-count">{typeof c.score === 'number' ? c.score : 0}</div>
                                                <button
                                                    type="button"
                                                    className={`vote-button ${votes?.[c.id] === 'down' ? 'downvoted' : ''}`}
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
            </div>

            <footer className="project-footer">
                <p>Secured by blockchain technology • Transparent • Immutable</p>
            </footer>
        </div>
    );
};

export default ProjectDetailsPage;
