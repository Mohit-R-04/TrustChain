import React from 'react';
import { useNavigate } from 'react-router-dom';

const WaitlistThanksPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '560px',
        background: 'rgba(30, 41, 59, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '18px',
        padding: '28px',
        color: '#e2e8f0',
        backdropFilter: 'blur(14px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            color: '#fff',
            userSelect: 'none'
          }}>
            TC
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Waitlist request received</div>
        </div>

        <div style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
          Your email has been submitted for early access. Once approved, you’ll be able to sign in.
          If you don’t see an update, check your email inbox (and spam) for an invite or approval message.
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '18px' }}>
          <button
            onClick={() => navigate('/sign-in')}
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              color: '#fff',
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)'
            }}
          >
            Go to Sign In
          </button>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              cursor: 'pointer',
              fontWeight: 700,
              color: '#e2e8f0',
              background: 'rgba(15, 23, 42, 0.6)'
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitlistThanksPage;

