import React, { useState } from 'react';

export const ReferralSection = ({
  referralCode = '',
  referralEarnings = 0,
  referredCount = 0,
  referredUsers = [],
  userRole = 'user',
  title = 'Payment-Based Referral Rewards',
  description = 'Share your referral link and earn ₹100 when your referred friend completes their first successful tuition payment. They receive ₹50.',
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const codeValue = referralCode || 'REF-GEN123';
  const referralLinkUrl = `${window.location.origin}/signup?ref=${codeValue}`;

  const copyReferralCode = () => {
    navigator.clipboard.writeText(codeValue);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLinkUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareReferralLink = async () => {
    const shareData = {
      title: 'Join Smart HomeTutor',
      text: `Join Smart HomeTutor using my referral code ${codeValue} and get a ₹50 Welcome Bonus on your first tuition payment!`,
      url: referralLinkUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        copyReferralLink();
      }
    } else {
      copyReferralLink();
    }
  };

  return (
    <div className="dash-card" style={{ padding: '18px 20px' }}>
      <div className="dash-card-header" style={{ marginBottom: '12px', paddingBottom: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '15px', color: '#0f2a4a', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fa-solid fa-gift" style={{ color: '#10b981' }}></i> {title}
        </h3>
      </div>

      <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 14px 0', lineHeight: '1.45' }}>
        {description}
      </p>

      {/* REFERRAL CODE BOX */}
      <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '10px' }}>
        <span style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
          Referral Code
        </span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <strong style={{ fontSize: '15px', color: '#0f2a4a', letterSpacing: '0.5px', fontFamily: 'monospace' }}>
            {codeValue}
          </strong>
          <button
            type="button"
            className="dash-btn dash-btn-outline"
            style={{ fontSize: '11px', padding: '4px 10px', height: '28px' }}
            onClick={copyReferralCode}
          >
            <i className="fa-solid fa-copy" style={{ marginRight: '4px' }}></i> {copiedCode ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* REFERRAL LINK BOX */}
      <div style={{ background: '#f1f5f9', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '12px' }}>
        <span style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
          Referral Link
        </span>
        <div style={{ fontSize: '11.5px', color: '#0284c7', fontWeight: '600', wordBreak: 'break-all', lineHeight: '1.3' }}>
          {referralLinkUrl}
        </div>
      </div>

      {/* LINK ACTION BUTTONS */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <button
          type="button"
          className="dash-btn dash-btn-outline"
          style={{ fontSize: '11px', padding: '6px 10px', flex: 1, justifyContent: 'center' }}
          onClick={copyReferralLink}
        >
          <i className="fa-solid fa-link" style={{ marginRight: '4px' }}></i> {copiedLink ? 'Copied!' : 'Copy Link'}
        </button>
        <button
          type="button"
          className="dash-btn dash-btn-primary"
          style={{ fontSize: '11px', padding: '6px 10px', flex: 1, justifyContent: 'center' }}
          onClick={shareReferralLink}
        >
          <i className="fa-solid fa-share-nodes" style={{ marginRight: '4px' }}></i> Share Link
        </button>
      </div>

      {/* STATS BOXES */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div style={{ background: '#e0f2fe', padding: '10px 12px', borderRadius: '8px', textAlign: 'center', border: '1px solid #bae6fd' }}>
          <span style={{ fontSize: '10.5px', color: '#0369a1', fontWeight: '700', display: 'block' }}>
            <i className="fa-solid fa-wallet" style={{ marginRight: '4px' }}></i> Credited
          </span>
          <strong style={{ fontSize: '15px', color: '#0284c7' }}>
            ₹{(referralEarnings || 0).toLocaleString('en-IN')}
          </strong>
        </div>
        <div style={{ background: '#dcfce7', padding: '10px 12px', borderRadius: '8px', textAlign: 'center', border: '1px solid #bbf7d0' }}>
          <span style={{ fontSize: '10.5px', color: '#15803d', fontWeight: '700', display: 'block' }}>
            <i className="fa-solid fa-users" style={{ marginRight: '4px' }}></i> Friends
          </span>
          <strong style={{ fontSize: '15px', color: '#16a34a' }}>
            {referredCount} Referred
          </strong>
        </div>
      </div>

      {/* REFERRED FRIENDS HISTORY LIST (IF PROVIDED) */}
      {referredUsers && referredUsers.length > 0 && (
        <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
          <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '8px', textTransform: 'uppercase' }}>
            Referred Friends History
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {referredUsers.map((u, idx) => {
              const dateStr = u.createdAt
                ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                : 'Recently';
              const isRewarded = u.referralRewardStatus === 'Rewarded';
              return (
                <div
                  key={u._id || idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 10px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div>
                    <strong style={{ color: '#0f2a4a', fontSize: '12.5px', display: 'block' }}>
                      {u.name || u.email}
                    </strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      Joined on {dateStr}
                    </span>
                  </div>
                  <span
                    style={{
                      background: isRewarded ? '#dcfce7' : '#fef3c7',
                      color: isRewarded ? '#15803d' : '#b45309',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '12px',
                    }}
                  >
                    {isRewarded ? '+₹100 Earned' : 'Pending Payment'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
