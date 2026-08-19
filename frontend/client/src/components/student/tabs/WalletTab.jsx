import React, { useState } from 'react';
import { studentApi } from '../../../services/studentApi';

export const WalletTab = ({ walletBalance, transactions, onWalletTopupSuccess }) => {
  const [promoCode, setPromoCode] = useState('');
  const [promoMsg, setPromoMsg] = useState('');

  const handleTopup = async (amount) => {
    try {
      const res = await studentApi.topupWallet(amount);
      if (res.success) {
        if (onWalletTopupSuccess) onWalletTopupSuccess(res.walletBalance, res.message);
      } else {
        alert(res.message || 'Top-up failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error during wallet top-up.');
    }
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    if (promoCode.trim().toUpperCase() === 'WELCOME10') {
      handleTopup(100);
      setPromoMsg('✅ Promo WELCOME10 applied! ₹100 bonus credits added!');
      setPromoCode('');
    } else {
      setPromoMsg('❌ Invalid or expired promo code.');
    }
  };

  return (
    <div className="dash-tab-content" style={{ display: 'block' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        {/* WALLET BALANCE CARD */}
        <div className="wallet-card-bg">
          <div className="wallet-balance-title">Smart Wallet Balance</div>
          <div className="wallet-balance-amount">₹{walletBalance ? walletBalance.toFixed(2) : '0.00'}</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="dash-btn dash-btn-primary" style={{ background: '#ffffff', color: '#0284c7' }} onClick={() => handleTopup(500)}>
              + Add ₹500 Credits
            </button>
          </div>

          {promoMsg && (
            <div style={{ marginTop: '10px', fontSize: '12px', background: 'rgba(255,255,255,0.2)', padding: '6px 10px', borderRadius: '6px', color: '#ffffff' }}>
              {promoMsg}
            </div>
          )}

          <div style={{ marginTop: '20px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>Promo Discount Code</label>
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              <input
                type="text"
                placeholder="Try WELCOME10"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: 'none', fontSize: '12px', flex: 1 }}
              />
              <button className="dash-btn dash-btn-accent" style={{ padding: '6px 12px' }} onClick={handleApplyPromo}>
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* INVOICES TABLE */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3><i className="fa-solid fa-file-invoice-dollar"></i> Payment History & Invoices</h3>
          </div>

          <div className="dash-table-wrapper">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions && transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx._id}>
                      <td>#{tx._id.substring(0, 8)}</td>
                      <td>{tx.description || tx.type || 'Transaction'}</td>
                      <td>{new Date(tx.createdAt || Date.now()).toLocaleDateString()}</td>
                      <td style={{ fontWeight: 700, color: '#0f2a4a' }}>₹{tx.amount}</td>
                      <td>
                        <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: '#dcfce7', color: '#15803d' }}>
                          {tx.status || 'Completed'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                      No payment or top-up transaction history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
