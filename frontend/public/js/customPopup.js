/**
 * Custom UI Modal Pop-up System
 * Replaces standard native browser window.alert with a modern, animated modal overlay.
 */
(function () {
  if (window.__customPopupInitialized) return;
  window.__customPopupInitialized = true;

  // Create Popup DOM structure on document load or immediate
  function getOrCreatePopupDOM() {
    let overlay = document.getElementById('customPopupOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'customPopupOverlay';
      overlay.className = 'custom-popup-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.innerHTML = `
        <div class="custom-popup-card" id="customPopupCard">
          <div class="custom-popup-header">
            <div class="custom-popup-icon-wrapper" id="customPopupIcon">
              <i class="fa-solid fa-circle-info"></i>
            </div>
            <div class="custom-popup-title-group">
              <h3 class="custom-popup-title" id="customPopupTitle">Notification</h3>
              <p class="custom-popup-subtitle" id="customPopupSubtitle">Smart HomeTutor System</p>
            </div>
            <button class="custom-popup-close-btn" id="customPopupCloseBtn" aria-label="Close">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="custom-popup-body" id="customPopupBody"></div>
          <div class="custom-popup-footer">
            <button class="custom-popup-btn custom-popup-btn-primary" id="customPopupOkBtn">
              <span>OK</span>
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      // Event Listeners for close
      const closeBtn = document.getElementById('customPopupCloseBtn');
      const okBtn = document.getElementById('customPopupOkBtn');

      closeBtn.addEventListener('click', closePopup);
      okBtn.addEventListener('click', closePopup);

      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
          closePopup();
        }
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
          closePopup();
        }
      });
    }
    return overlay;
  }

  let popupCallback = null;

  function closePopup() {
    const overlay = document.getElementById('customPopupOverlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
    if (typeof popupCallback === 'function') {
      const cb = popupCallback;
      popupCallback = null;
      cb();
    }
  }

  function showCustomAlert(message, customTitle, customType, callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        showCustomAlert(message, customTitle, customType, callback);
      });
      return;
    }

    const overlay = getOrCreatePopupDOM();
    const card = document.getElementById('customPopupCard');
    const iconEl = document.getElementById('customPopupIcon');
    const titleEl = document.getElementById('customPopupTitle');
    const subtitleEl = document.getElementById('customPopupSubtitle');
    const bodyEl = document.getElementById('customPopupBody');
    const okBtn = document.getElementById('customPopupOkBtn');

    popupCallback = callback || null;

    const msgString = String(message ?? '');

    // Detect message type & title based on content if not explicitly provided
    let type = customType || 'info';
    let title = customTitle || 'Notification';
    let iconHTML = '<i class="fa-solid fa-circle-info"></i>';

    if (msgString.includes('🤖') || msgString.includes('📊') || msgString.includes('🗓️') || msgString.includes('📑')) {
      type = 'ai';
      title = customTitle || 'AI Smart Assistant';
      iconHTML = '<i class="fa-solid fa-robot"></i>';
    } else if (msgString.includes('✅') || msgString.includes('🎉') || msgString.toLowerCase().includes('success') || msgString.toLowerCase().includes('copied')) {
      type = 'success';
      title = customTitle || 'Success';
      iconHTML = '<i class="fa-solid fa-circle-check"></i>';
    } else if (msgString.includes('❌') || msgString.toLowerCase().includes('error') || msgString.toLowerCase().includes('failed') || msgString.toLowerCase().includes('invalid')) {
      type = 'error';
      title = customTitle || 'Error';
      iconHTML = '<i class="fa-solid fa-circle-xmark"></i>';
    } else if (msgString.includes('⚠️') || msgString.includes('📍') || msgString.toLowerCase().includes('warning') || msgString.toLowerCase().includes('please')) {
      type = 'warning';
      title = customTitle || 'Attention Needed';
      iconHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
    }

    // Clean leading emoji icons from display text if present
    let cleanMessage = msgString
      .replace(/^[✅❌⚠️🎉📍🤖📊🗓️📑]\s*/, '')
      .trim();

    // Remove CSS class variants
    card.className = 'custom-popup-card type-' + type;
    iconEl.innerHTML = iconHTML;
    titleEl.textContent = title;
    subtitleEl.textContent = 'Smart HomeTutor System';

    // Multi-line formatting check
    if (cleanMessage.includes('\n')) {
      bodyEl.innerHTML = `<div class="custom-popup-body-formatted">${cleanMessage.replace(/\n/g, '<br/>')}</div>`;
    } else {
      bodyEl.textContent = cleanMessage;
    }

    // Activate modal
    overlay.classList.add('active');
    setTimeout(() => {
      okBtn.focus();
    }, 50);
  }

  // Override standard window.alert
  window.showCustomAlert = showCustomAlert;
  window.closeCustomAlert = closePopup;
  
  // Intercept native browser alert
  window.alert = function (message) {
    showCustomAlert(message);
  };
})();
