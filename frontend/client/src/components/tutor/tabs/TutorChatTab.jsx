import React, { useState, useEffect, useRef } from 'react';

export const TutorChatTab = ({ currentUserId, currentUserName }) => {
  const [conversations, setConversations] = useState([]);
  const [activeStudentId, setActiveStudentId] = useState(null);
  const [activeStudentName, setActiveStudentName] = useState('');
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize Socket.IO
  useEffect(() => {
    if (typeof window !== 'undefined' && window.io) {
      socketRef.current = window.io();

      socketRef.current.on('receiveMessage', (msg) => {
        const senderObj = typeof msg.sender === 'object' ? msg.sender : { _id: msg.sender, name: 'Student' };
        const senderId = senderObj._id;

        if (activeStudentId && senderId === activeStudentId) {
          setMessages((prev) => [...prev, msg]);
          fetch(`/api/chat/seen/${senderId}`, { method: 'PATCH' }).catch(() => {});
        } else {
          loadConversations();
        }
      });

      socketRef.current.on('userTyping', ({ senderId }) => {
        if (activeStudentId && senderId === activeStudentId) {
          setIsTyping(true);
        }
      });

      socketRef.current.on('userStopTyping', ({ senderId }) => {
        if (activeStudentId && senderId === activeStudentId) {
          setIsTyping(false);
        }
      });
    }

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [activeStudentId]);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    setLoadingConversations(true);
    try {
      const res = await fetch('/api/chat/conversations');
      const data = await res.json();
      let list = data.success && data.conversations ? data.conversations : [];

      try {
        const reqRes = await fetch('/api/tutor/booking-requests');
        const reqData = await reqRes.json();
        if (reqData.success && reqData.requests) {
          reqData.requests.forEach((r) => {
            if (r.student && r.student._id) {
              const exists = list.some((c) => c.user && c.user._id === r.student._id);
              if (!exists) {
                list.push({
                  user: r.student,
                  lastMessage: r.message || 'Demo Class Request',
                  lastMessageTime: r.createdAt,
                  unreadCount: 0
                });
              }
            }
          });
        }
      } catch (e) {
        console.error(e);
      }

      setConversations(list);
    } catch (err) {
      console.error('Load Conversations Error:', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  const handleSelectStudent = async (studentId, name) => {
    setActiveStudentId(studentId);
    setActiveStudentName(name);
    setLoadingMessages(true);

    try {
      await fetch(`/api/chat/seen/${studentId}`, { method: 'PATCH' });
      const res = await fetch(`/api/chat/messages/${studentId}`);
      const data = await res.json();
      if (data.success && data.messages) {
        setMessages(data.messages);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('Load messages error:', err);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && !pendingFile) || !activeStudentId) return;

    const contentToSend = messageInput.trim();
    const fileToSend = pendingFile || {};
    setMessageInput('');
    setPendingFile(null);

    if (socketRef.current) {
      socketRef.current.emit('stopTyping', { recipientId: activeStudentId, senderId: currentUserId });
    }

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: activeStudentId,
          content: contentToSend,
          fileUrl: fileToSend.fileUrl || '',
          fileType: fileToSend.fileType || 'none',
          fileName: fileToSend.fileName || '',
          fileSize: fileToSend.fileSize || ''
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setMessages((prev) => [...prev, data.data]);
        loadConversations();
      }
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert('File size must be 25MB or less.');
      e.target.value = '';
      return;
    }

    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/chat/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPendingFile({
          fileUrl: data.fileUrl,
          fileType: data.fileType,
          fileName: data.fileName,
          fileSize: data.fileSize || ''
        });
      } else {
        alert(data.message || 'File upload failed.');
      }
    } catch (err) {
      console.error('Upload Error:', err);
      alert('File upload failed.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleTyping = (e) => {
    setMessageInput(e.target.value);
    if (!activeStudentId || !socketRef.current) return;

    socketRef.current.emit('typing', {
      recipientId: activeStudentId,
      senderId: currentUserId,
      senderName: currentUserName || 'Tutor'
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('stopTyping', { recipientId: activeStudentId, senderId: currentUserId });
    }, 1500);
  };

  const triggerVideoCall = async () => {
    if (!activeStudentId) return;
    try {
      const res = await fetch('/api/tutor/booking-requests');
      const data = await res.json();
      if (data.success && data.requests) {
        const accepted = data.requests.find(
          (b) => b.status === 'Accepted' && (b.student?._id === activeStudentId || b.student === activeStudentId)
        );
        if (accepted) {
          if (window.socket) {
            window.socket.emit('initiate-video-call', {
              bookingId: accepted._id,
              callerId: currentUserId,
              callerName: currentUserName || 'Tutor',
              callerRole: 'Tutor',
            });
          } else {
            window.location.href = `/video-call/${accepted._id}`;
          }
          return;
        }
      }
      alert(`Video call requires an accepted booking request with ${activeStudentName || 'this student'}.`);
    } catch (err) {
      console.error('Video call error:', err);
    }
  };

  return (
    <div className="dash-tab-content" style={{ display: 'block' }}>
      <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="chat-layout">
          {/* CONVERSATIONS SIDEBAR */}
          <div className="chat-sidebar">
            <div className="chat-sidebar-header">
              <h3>Student Messages</h3>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {loadingConversations ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                  <i className="fa-solid fa-spinner fa-spin"></i> Loading conversations...
                </div>
              ) : conversations.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                  No active student messages yet.
                </div>
              ) : (
                conversations.map((c) => {
                  const student = c.user;
                  if (!student) return null;
                  const name = student.name || student.email || 'Student';
                  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
                  const isActive = activeStudentId === student._id;

                  return (
                    <div
                      key={student._id}
                      className={`conversation ${isActive ? 'active' : ''}`}
                      onClick={() => handleSelectStudent(student._id, name)}
                    >
                      <div className="conversation-avatar">{initials}</div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '14px', color: '#0f2a4a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {name}
                          </strong>
                          {c.unreadCount > 0 && (
                            <span style={{ background: '#dc2626', color: '#ffffff', fontSize: '10.5px', fontWeight: '800', padding: '2px 7px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <i className="fa-solid fa-circle" style={{ fontSize: '6px' }}></i> {c.unreadCount}
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.lastMessage || 'Tap to chat...'}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* MAIN CHAT WINDOW */}
          <div className="chat-main">
            <div className="chat-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0f2a4a' }}>
                  {activeStudentName || 'Select a Student'}
                </h3>
                <small style={{ color: '#64748b', fontSize: '12px' }}>
                  {activeStudentId ? 'Active Student' : 'Click any student on the left to start messaging'}
                </small>
                {isTyping && (
                  <small style={{ color: '#0284c7', fontWeight: '600', fontSize: '12px', marginLeft: '8px' }}>
                    <i className="fa-solid fa-pen-nib fa-bounce"></i> Student is typing...
                  </small>
                )}
              </div>
              {activeStudentId && (
                <button className="dash-btn dash-btn-primary" onClick={triggerVideoCall}>
                  <i className="fa-solid fa-video"></i> Video Call
                </button>
              )}
            </div>

            <div className="chat-messages">
              {!activeStudentId ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '100px', fontSize: '14px' }}>
                  <i className="fa-solid fa-comments" style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.5 }}></i>
                  <p>Select a student from the conversation list on the left to view messages.</p>
                </div>
              ) : loadingMessages ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                  <i className="fa-solid fa-spinner fa-spin"></i> Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                  No messages yet. Send a message to start!
                </div>
              ) : (
                messages.map((m, idx) => {
                  const senderId = typeof m.sender === 'object' && m.sender ? m.sender._id : m.sender;
                  const isMe = senderId === currentUserId;

                  return (
                    <div
                      key={m._id || idx}
                      className={`chat-msg ${isMe ? 'user' : 'tutor'}`}
                      style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        background: isMe ? '#0f2a4a' : '#ffffff',
                        color: isMe ? '#ffffff' : '#0f2a4a',
                        border: isMe ? 'none' : '1px solid #e2e8f0',
                        maxWidth: '75%',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        marginBottom: '8px'
                      }}
                    >
                      {m.content && <div>{m.content}</div>}
                      {m.fileUrl && (
                        <div style={{ marginTop: '6px', fontSize: '12px' }}>
                          <a href={m.fileUrl} target="_blank" rel="noreferrer" style={{ color: isMe ? '#38bdf8' : '#0284c7', textDecoration: 'underline' }}>
                            📎 {m.fileName || 'Attachment'}
                          </a>
                        </div>
                      )}
                      <div style={{ fontSize: '10px', opacity: 0.75, textAlign: 'right', marginTop: '4px' }}>
                        {new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* PENDING FILE PREVIEW BANNER */}
            {pendingFile && (
              <div style={{ padding: '8px 16px', background: '#e0f2fe', borderTop: '1px solid #bae6fd', fontSize: '12px', display: 'flex', justifyContent: 'space-between', color: '#0369a1' }}>
                <span>📎 Ready to send: <strong>{pendingFile.fileName}</strong></span>
                <button onClick={() => setPendingFile(null)} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer' }}>✕ Cancel</button>
              </div>
            )}

            <div className="chat-footer">
              <label className="dash-btn dash-btn-outline" style={{ padding: '10px 14px', cursor: activeStudentId ? 'pointer' : 'not-allowed', opacity: activeStudentId ? 1 : 0.5 }}>
                <i className="fa-solid fa-paperclip"></i>
                <input type="file" accept="image/*,.pdf,.doc,.docx" style={{ display: 'none' }} disabled={!activeStudentId || uploadingFile} onChange={handleFileUpload} />
              </label>
              <input
                type="text"
                placeholder="Type message..."
                value={messageInput}
                disabled={!activeStudentId}
                onChange={handleTyping}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button className="dash-btn dash-btn-primary" disabled={!activeStudentId} onClick={handleSendMessage}>
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
