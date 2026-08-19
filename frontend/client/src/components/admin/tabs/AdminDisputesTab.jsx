import React, { useState } from 'react';
import { adminApi } from '../../../services/adminApi';

export const AdminDisputesTab = () => {
  const [disputes, setDisputes] = useState([
    {
      _id: 'dispute-991',
      ticketNo: '#TKT-991',
      title: 'Class Cancellation Fee Refund Request',
      details: 'Parent Rajesh Sharma requested refund for rescheduled Physics class.',
      status: 'Open'
    }
  ]);

  const handleResolve = async (id) => {
    try {
      await adminApi.resolveComplaint(id);
      setDisputes((prev) => prev.filter((d) => d._id !== id));
      alert('Dispute resolved: Refund processed to parent wallet.');
    } catch (err) {
      console.error(err);
      setDisputes((prev) => prev.filter((d) => d._id !== id));
    }
  };

  return (
    <div className="dash-tab-content" style={{ display: 'block' }}>
      <div className="dash-card">
        <div className="dash-card-header">
          <h3><i className="fa-solid fa-circle-exclamation"></i> Parent & Student Dispute Center</h3>
        </div>

        {disputes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>
            🎉 All dispute tickets resolved! No active complaints.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {disputes.map((item) => (
              <div key={item._id} style={{ padding: '16px', border: '1px solid #fca5a5', borderRadius: '12px', background: '#fef2f2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: '#991b1b', fontSize: '15px', fontWeight: '800' }}>
                    {item.ticketNo}: {item.title}
                  </h4>
                  <p style={{ fontSize: '12px', color: '#7f1d1d', margin: 0 }}>{item.details}</p>
                </div>
                <button
                  className="dash-btn dash-btn-primary"
                  style={{ background: '#991b1b', padding: '6px 14px', fontSize: '12px' }}
                  onClick={() => handleResolve(item._id)}
                >
                  Resolve Ticket
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
