import React from 'react';

export const VideoControls = ({
  isAudioMuted,
  isVideoOff,
  isScreenSharing,
  onToggleAudio,
  onToggleVideo,
  onToggleScreen,
  onEndCall,
}) => {
  return (
    <footer className="call-controls">
      <button
        type="button"
        className={`control-btn ${isAudioMuted ? 'off' : ''}`}
        title="Mute / Unmute Microphone"
        onClick={onToggleAudio}
      >
        <i className={`fa-solid ${isAudioMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
      </button>

      <button
        type="button"
        className={`control-btn ${isVideoOff ? 'off' : ''}`}
        title="Camera On / Off"
        onClick={onToggleVideo}
      >
        <i className={`fa-solid ${isVideoOff ? 'fa-video-slash' : 'fa-video'}`}></i>
      </button>

      <button
        type="button"
        className={`control-btn ${isScreenSharing ? 'off' : ''}`}
        style={isScreenSharing ? { background: '#0284c7' } : undefined}
        title="Share Screen"
        onClick={onToggleScreen}
      >
        <i className="fa-solid fa-desktop"></i>
      </button>

      <button
        type="button"
        className="control-btn end-call"
        onClick={onEndCall}
      >
        <i className="fa-solid fa-phone-slash"></i> End Call
      </button>
    </footer>
  );
};
