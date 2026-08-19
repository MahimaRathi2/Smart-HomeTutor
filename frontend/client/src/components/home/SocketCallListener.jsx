import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const SocketCallListener = () => {
  const { userId, userRole, userName } = useAuth();
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    if (!userId || typeof window === 'undefined' || !window.io) return;

    const socket = window.socket || window.io();
    window.socket = socket;

    socket.emit('join', userId);
    socket.emit('check-active-call', { userId });

    const handleActiveStatus = ({ hasActiveCall, call }) => {
      if (hasActiveCall && call && call.status === 'calling') {
        setIncomingCall({
          bookingId: call.bookingId,
          callerName: call.callerName,
          subject: call.subject,
          callerRole: call.callerRole,
        });
      } else {
        setIncomingCall(null);
      }
    };

    const handleIncomingCall = ({ bookingId, callerName, subject, callerRole }) => {
      setIncomingCall({ bookingId, callerName, subject, callerRole });
    };

    const handleCallEnded = () => setIncomingCall(null);

    socket.on('active-call-status', handleActiveStatus);
    socket.on('incoming-video-call', handleIncomingCall);
    socket.on('call-cancelled', handleCallEnded);
    socket.on('call-ended', handleCallEnded);
    socket.on('call-timeout', handleCallEnded);
    socket.on('call-declined', handleCallEnded);

    return () => {
      socket.off('active-call-status', handleActiveStatus);
      socket.off('incoming-video-call', handleIncomingCall);
      socket.off('call-cancelled', handleCallEnded);
      socket.off('call-ended', handleCallEnded);
      socket.off('call-timeout', handleCallEnded);
      socket.off('call-declined', handleCallEnded);
    };
  }, [userId]);

  if (!incomingCall) return null;

  const acceptCall = () => {
    if (window.socket) {
      window.socket.emit('accept-video-call', { bookingId: incomingCall.bookingId });
    }
    window.location.href = `/video-call/${incomingCall.bookingId}`;
  };

  const declineCall = () => {
    if (window.socket) {
      window.socket.emit('decline-video-call', { bookingId: incomingCall.bookingId });
    }
    setIncomingCall(null);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1250,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          maxWidth: '440px',
          width: '100%',
          textAlign: 'center',
          borderTop: '4px solid #10b981',
          borderRadius: '16px',
          padding: '28px',
          background: '#1e293b',
          color: '#ffffff',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.2)',
            color: '#34d399',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '34px',
            marginBottom: '16px',
            border: '2px solid rgba(52, 211, 153, 0.4)',
          }}
        >
          <i className="fa-solid fa-video fa-beat"></i>
        </div>
        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
          Incoming HD Video Call
        </h3>
        <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '20px', lineHeight: 1.5 }}>
          <strong style={{ color: '#38bdf8' }}>{incomingCall.callerName || 'Participant'}</strong> (
          {incomingCall.callerRole || 'User'}) is calling you for{' '}
          <strong style={{ color: '#f1f5f9' }}>{incomingCall.subject || 'Tuition Class'}</strong>.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
          <button
            type="button"
            style={{
              background: '#ef4444',
              color: '#ffffff',
              flex: 1,
              padding: '12px',
              fontWeight: 700,
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onClick={declineCall}
          >
            <i className="fa-solid fa-phone-slash"></i> Decline
          </button>
          <button
            type="button"
            style={{
              background: '#10b981',
              color: '#ffffff',
              flex: 1,
              padding: '12px',
              fontWeight: 700,
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onClick={acceptCall}
          >
            <i className="fa-solid fa-video"></i> Accept & Join
          </button>
        </div>
      </div>
    </div>
  );
};
