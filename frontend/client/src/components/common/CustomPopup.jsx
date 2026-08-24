import React, { useState, useEffect, useCallback } from 'react';

export const CustomPopup = () => {
  const [popupState, setPopupState] = useState({
    isOpen: false,
    isConfirm: false,
    isPrompt: false,
    title: 'Notification',
    message: '',
    type: 'info',
    inputValue: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    resolve: null,
    callback: null,
  });

  const handleClose = useCallback((resultValue = false) => {
    setPopupState((prev) => {
      if ((prev.isConfirm || prev.isPrompt) && typeof prev.resolve === 'function') {
        prev.resolve(resultValue);
      } else if (typeof prev.callback === 'function') {
        try {
          prev.callback();
        } catch (e) {
          console.error(e);
        }
      }
      return {
        ...prev,
        isOpen: false,
        isConfirm: false,
        isPrompt: false,
        resolve: null,
        callback: null,
      };
    });
  }, []);

  const openPopup = useCallback((message, customTitle, customType, callback) => {
    const msgString = String(message ?? '');

    let type = customType || 'info';
    let title = customTitle || 'Notification';

    if (
      msgString.includes('🤖') ||
      msgString.includes('📊') ||
      msgString.includes('🗓️') ||
      msgString.includes('📑')
    ) {
      type = 'ai';
      title = customTitle || 'AI Smart Assistant';
    } else if (
      msgString.includes('✅') ||
      msgString.includes('🎉') ||
      msgString.toLowerCase().includes('success') ||
      msgString.toLowerCase().includes('copied')
    ) {
      type = 'success';
      title = customTitle || 'Success';
    } else if (
      msgString.includes('❌') ||
      msgString.toLowerCase().includes('error') ||
      msgString.toLowerCase().includes('failed') ||
      msgString.toLowerCase().includes('invalid')
    ) {
      type = 'error';
      title = customTitle || 'Error';
    } else if (
      msgString.includes('⚠️') ||
      msgString.includes('📍') ||
      msgString.toLowerCase().includes('warning') ||
      msgString.toLowerCase().includes('please')
    ) {
      type = 'warning';
      title = customTitle || 'Attention Needed';
    }

    const cleanMessage = msgString
      .replace(/^[✅❌⚠️🎉📍🤖📊🗓️📑]\s*/, '')
      .trim();

    setPopupState({
      isOpen: true,
      isConfirm: false,
      isPrompt: false,
      title,
      message: cleanMessage,
      type,
      resolve: null,
      callback: callback || null,
    });
  }, []);

  const openConfirm = useCallback((message, customTitle, confirmText = 'Confirm', cancelText = 'Cancel') => {
    return new Promise((resolve) => {
      const msgString = String(message ?? '');
      const cleanMessage = msgString
        .replace(/^[✅❌⚠️🎉📍🤖📊🗓️📑]\s*/, '')
        .trim();

      setPopupState({
        isOpen: true,
        isConfirm: true,
        isPrompt: false,
        title: customTitle || 'Confirm Action',
        message: cleanMessage,
        type: 'confirm',
        confirmText,
        cancelText,
        resolve,
        callback: null,
      });
    });
  }, []);

  const openPrompt = useCallback((message, defaultValue = '', customTitle, confirmText = 'OK', cancelText = 'Cancel') => {
    return new Promise((resolve) => {
      const msgString = String(message ?? '');
      const cleanMessage = msgString
        .replace(/^[✅❌⚠️🎉📍🤖📊🗓️📑]\s*/, '')
        .trim();

      setPopupState({
        isOpen: true,
        isConfirm: false,
        isPrompt: true,
        title: customTitle || 'Input Required',
        message: cleanMessage,
        type: 'prompt',
        inputValue: defaultValue,
        confirmText,
        cancelText,
        resolve,
        callback: null,
      });
    });
  }, []);

  useEffect(() => {
    const originalAlert = window.alert;

    window.showCustomAlert = (message, title, type, callback) => {
      openPopup(message, title, type, callback);
    };

    window.showCustomConfirm = (message, title, confirmText, cancelText) => {
      return openConfirm(message, title, confirmText, cancelText);
    };

    window.showCustomPrompt = (message, defaultValue, title, confirmText, cancelText) => {
      return openPrompt(message, defaultValue, title, confirmText, cancelText);
    };

    window.alert = (message) => {
      openPopup(message);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose(popupState.isPrompt ? null : false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.alert = originalAlert;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openPopup, openConfirm, openPrompt, handleClose, popupState.isPrompt]);

  if (!popupState.isOpen) return null;

  const renderIcon = () => {
    if (popupState.isPrompt) {
      return <i className="fa-solid fa-pen-to-square"></i>;
    }
    if (popupState.isConfirm) {
      return <i className="fa-solid fa-triangle-exclamation"></i>;
    }
    switch (popupState.type) {
      case 'success':
        return <i className="fa-solid fa-circle-check"></i>;
      case 'error':
        return <i className="fa-solid fa-circle-xmark"></i>;
      case 'warning':
        return <i className="fa-solid fa-triangle-exclamation"></i>;
      case 'ai':
        return <i className="fa-solid fa-robot"></i>;
      default:
        return <i className="fa-solid fa-circle-info"></i>;
    }
  };

  return (
    <div
      className={`custom-popup-overlay ${popupState.isOpen ? 'active' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose(popupState.isPrompt ? null : false);
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className={`custom-popup-card type-${popupState.type}`}>
        <div className="custom-popup-header">
          <div className="custom-popup-icon-wrapper">{renderIcon()}</div>
          <div className="custom-popup-title-group">
            <h3 className="custom-popup-title">{popupState.title}</h3>
            <p className="custom-popup-subtitle">Smart HomeTutor System</p>
          </div>
          <button
            className="custom-popup-close-btn"
            onClick={() => handleClose(popupState.isPrompt ? null : false)}
            aria-label="Close modal"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="custom-popup-body">
          {popupState.message.includes('\n') ? (
            <div className="custom-popup-body-formatted">
              {popupState.message.split('\n').map((line, idx) => (
                <React.Fragment key={idx}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </div>
          ) : (
            popupState.message
          )}

          {popupState.isPrompt && (
            <input
              type="text"
              className="custom-popup-input"
              value={popupState.inputValue}
              onChange={(e) =>
                setPopupState((prev) => ({ ...prev, inputValue: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleClose(popupState.inputValue);
                }
              }}
              autoFocus
            />
          )}
        </div>
        <div className="custom-popup-footer">
          {popupState.isPrompt ? (
            <>
              <button
                className="custom-popup-btn custom-popup-btn-secondary"
                onClick={() => handleClose(null)}
              >
                <span>{popupState.cancelText || 'Cancel'}</span>
              </button>
              <button
                className="custom-popup-btn custom-popup-btn-primary"
                onClick={() => handleClose(popupState.inputValue)}
              >
                <span>{popupState.confirmText || 'OK'}</span>
              </button>
            </>
          ) : popupState.isConfirm ? (
            <>
              <button
                className="custom-popup-btn custom-popup-btn-secondary"
                onClick={() => handleClose(false)}
              >
                <span>{popupState.cancelText || 'Cancel'}</span>
              </button>
              <button
                className="custom-popup-btn custom-popup-btn-danger"
                onClick={() => handleClose(true)}
                autoFocus
              >
                <span>{popupState.confirmText || 'Confirm'}</span>
              </button>
            </>
          ) : (
            <button
              className="custom-popup-btn custom-popup-btn-primary"
              onClick={() => handleClose(true)}
              autoFocus
            >
              <span>OK</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
