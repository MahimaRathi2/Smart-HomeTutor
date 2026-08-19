import React, { useState } from 'react';

export const ParentChatTab = ({ assignedTutors = [], onOpenReviewModal }) => {
  const [selectedTutor, setSelectedTutor] = useState(assignedTutors[0] || null);
  const [messages, setMessages] = useState([
    {
      sender: 'tutor',
      text: "Hello! I am your child's assigned educator. Let me know if you have any questions regarding class progress or homework.",
      time: '10:00 AM',
    },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      sender: 'parent',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
  };

  return (
    <div className="dash-card">
      <div className="dash-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>
          <i className="fa-solid fa-comments" style={{ color: '#7e22ce' }}></i> Tutor Communication & Guardian Chat
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '16px', marginTop: '14px', minHeight: '400px' }}>
        {/* ASSIGNED TUTORS LIST */}
        <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: '12px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: '10px' }}>
            Assigned Educators ({assignedTutors.length})
          </h4>

          {assignedTutors.length === 0 ? (
            <div style={{ padding: '14px', background: '#faf5ff', borderRadius: '10px', fontSize: '13px', color: '#64748b', textAlign: 'center' }}>
              <i className="fa-solid fa-chalkboard-user" style={{ fontSize: '24px', color: '#d8b4fe', marginBottom: '6px' }}></i>
              <p style={{ margin: 0 }}>No assigned tutors yet. Book a session or link your child profile to connect with tutors.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {assignedTutors.map((t) => {
                const isSelected = selectedTutor && selectedTutor._id === t._id;
                return (
                  <div
                    key={t._id}
                    onClick={() => setSelectedTutor(t)}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      background: isSelected ? '#f3e8ff' : '#f8fafc',
                      border: isSelected ? '1px solid #c084fc' : '1px solid #e2e8f0',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f2a4a' }}>{t.name}</div>
                    <div style={{ fontSize: '12px', color: '#7e22ce', fontWeight: 700 }}>{t.subject}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Student: {t.childName}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CHAT MESSAGES WINDOW */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {selectedTutor || assignedTutors.length > 0 ? (
            <>
              <div style={{ paddingBottom: '12px', borderBottom: '1px solid #e2e8f0', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f2a4a' }}>
                    Chatting with {selectedTutor ? selectedTutor.name : 'Educator'}
                  </h4>
                  <span style={{ fontSize: '12px', color: '#7e22ce', fontWeight: 700 }}>
                    {selectedTutor ? selectedTutor.subject : 'Academic Educator'}
                  </span>
                </div>
                {onOpenReviewModal && (
                  <button
                    type="button"
                    onClick={() => onOpenReviewModal(selectedTutor ? selectedTutor._id : 'tutor-1')}
                    className="dash-btn dash-btn-outline"
                    style={{ fontSize: '12px', padding: '5px 12px' }}
                  >
                    <i className="fa-solid fa-star" style={{ color: '#f59e0b' }}></i> Review Tutor
                  </button>
                )}
              </div>

              {/* MESSAGES AREA */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '6px', maxHeight: '320px' }}>
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      alignSelf: m.sender === 'parent' ? 'flex-end' : 'flex-start',
                      maxWidth: '75%',
                      background: m.sender === 'parent' ? '#7e22ce' : '#f1f5f9',
                      color: m.sender === 'parent' ? '#ffffff' : '#0f172a',
                      padding: '10px 14px',
                      borderRadius: m.sender === 'parent' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      fontSize: '13px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    }}
                  >
                    <div>{m.text}</div>
                    <div
                      style={{
                        fontSize: '10px',
                        textAlign: 'right',
                        marginTop: '4px',
                        opacity: 0.8,
                        color: m.sender === 'parent' ? '#e9d5ff' : '#64748b',
                      }}
                    >
                      {m.time}
                    </div>
                  </div>
                ))}
              </div>

              {/* MESSAGE INPUT FORM */}
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message or question for educator..."
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }}
                />
                <button type="submit" className="dash-btn dash-btn-primary" style={{ background: '#7e22ce', padding: '10px 18px', fontSize: '13px' }}>
                  Send <i className="fa-solid fa-paper-plane"></i>
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
              <i className="fa-solid fa-comments" style={{ fontSize: '36px', color: '#cbd5e1', marginBottom: '10px' }}></i>
              <h4 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '16px' }}>Select an Educator to Start Chat</h4>
              <p style={{ margin: 0, fontSize: '13px' }}>Once your children are enrolled in sessions, assigned tutors will appear here for direct communication.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
