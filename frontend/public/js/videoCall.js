/**
 * ============================================================================
 * PRODUCTION WEBRTC VIDEO CALL ENGINE (Vanilla JS + Native WebRTC + Socket.IO)
 * ============================================================================
 * 
 * STEP 1: Socket.IO signaling setup & room join
 * STEP 2: Media device acquisition (getUserMedia - Audio/Video)
 * STEP 3: Single-side SDP Offer / Answer exchange via RTCPeerConnection
 * STEP 4: Trickle ICE Candidate exchange & queuing
 * STEP 5: Remote video track rendering & peer state synchronization
 * STEP 6: Call disconnection & resource cleanup
 * STEP 7: Robust error handling & device fallback UI
 * STEP 8: Interactive controls (Mute mic, Camera toggle, Screen share, Timer)
 */

document.addEventListener("DOMContentLoaded", async () => {
  // Read metadata attributes passed from EJS view
  const dataEl = document.getElementById("videoCallData");
  if (!dataEl) {
    console.error("Video call metadata container missing.");
    return;
  }

  const bookingId = dataEl.dataset.bookingId;
  const roomId = dataEl.dataset.roomId;
  const userId = dataEl.dataset.userId;
  const userName = dataEl.dataset.userName;
  const userRole = dataEl.dataset.userRole;
  const peerName = dataEl.dataset.peerName;
  const peerRole = dataEl.dataset.peerRole;

  // DOM Elements
  const localVideo = document.getElementById("localVideo");
  const remoteVideo = document.getElementById("remoteVideo");
  const peerPlaceholder = document.getElementById("peerPlaceholder");
  const peerPlaceholderTitle = document.getElementById("peerPlaceholderTitle");
  const peerPlaceholderSub = document.getElementById("peerPlaceholderSub");
  const peerMutedBadge = document.getElementById("peerMutedBadge");
  const localPlaceholder = document.getElementById("localPlaceholder");
  const connectionBadge = document.getElementById("connectionBadge");
  const callTimerEl = document.getElementById("callTimer");
  const toggleAudioBtn = document.getElementById("toggleAudioBtn");
  const toggleVideoBtn = document.getElementById("toggleVideoBtn");
  const toggleScreenBtn = document.getElementById("toggleScreenBtn");
  const endCallBtn = document.getElementById("endCallBtn");
  const localMicIcon = document.getElementById("localMicIcon");
  const errorOverlay = document.getElementById("errorOverlay");
  const errorTitle = document.getElementById("errorTitle");
  const errorMessage = document.getElementById("errorMessage");

  // State Variables
  let socket = null;
  let peerConnection = null;
  let localStream = null;
  let remoteStream = null;
  let screenStream = null;
  let isAudioMuted = false;
  let isVideoOff = false;
  let isScreenSharing = false;
  let isPeerVideoOff = false;
  let callTimerInterval = null;
  let callSeconds = 0;
  let iceCandidateQueue = [];
  let isCleaningUp = false;

  // WebRTC Configuration using standard STUN servers
  const rtcConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      ...(window.TURN_CONFIG ? [window.TURN_CONFIG] : [])
    ],
  };

  /**
   * STEP 2: MEDIA PERMISSIONS & ACQUISITION
   */
  async function initLocalMedia() {
    try {
      console.log("🎥 [WebRTC] Requesting local media devices (Camera + Microphone)...");
      localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      localVideo.srcObject = localStream;
      console.log("✅ [WebRTC] Local media stream initialized successfully.");
      return true;
    } catch (err) {
      console.error("❌ [WebRTC] Media Device Error:", err);
      let msg = "Could not access your camera or microphone. Please check browser permissions and allow device access.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        msg = "Microphone and Camera permission was denied. Please allow device permissions in browser settings.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        msg = "No compatible camera or microphone hardware found on your device.";
      }
      showError("Media Access Denied", msg);
      return false;
    }
  }

  /**
   * STEP 1: SOCKET.IO SIGNALING CONNECTION
   */
  function initSocketSignaling() {
    console.log("⚡ [Signaling] Connecting to Socket.IO signaling server...");
    socket = io();

    socket.on("connect", () => {
      console.log(`✅ [Signaling] Socket connected with ID: ${socket.id}`);
      updateStatus("connecting", "Joining call room...");

      socket.emit("join-video-room", {
        bookingId,
        userId,
        userName,
        userRole,
      });
    });

    // Room Joined Confirmation
    socket.on("room-joined", ({ peerCount }) => {
      console.log(`🏠 [Signaling] Room joined. Total peers in room: ${peerCount}`);
      
      createPeerConnection();

      if (peerCount === 1) {
        updateStatus("connecting", `Waiting for ${peerName || "participant"} to join...`);
      } else {
        updateStatus("connecting", "Peer detected. Establishing WebRTC connection...");
      }
    });

    // New Peer Joined Room Event (Triggers Offer creation from existing peer)
    socket.on("peer-joined", async ({ userName: newPeerName }) => {
      console.log(`👤 [Signaling] Peer joined room: ${newPeerName}`);
      updateStatus("connecting", "Peer connected. Initializing handshake...");
      
      createPeerConnection();
      
      // Peer already in room initiates WebRTC SDP Offer
      await initiateOffer();
    });

    // STEP 3: Receive WebRTC Offer SDP
    socket.on("webrtc-offer", async ({ offer, senderId }) => {
      console.log("📥 [Signaling] Received WebRTC SDP OFFER from peer:", senderId);
      await handleOffer(offer);
    });

    // STEP 3: Receive WebRTC Answer SDP
    socket.on("webrtc-answer", async ({ answer }) => {
      console.log("📥 [Signaling] Received WebRTC SDP ANSWER from peer.");
      await handleAnswer(answer);
    });

    // STEP 4: Receive ICE Candidate
    socket.on("webrtc-ice-candidate", async ({ candidate }) => {
      console.log("🧊 [Signaling] Received ICE Candidate from peer.");
      await handleIceCandidate(candidate);
    });

    // Receive Peer Media Toggle Notification
    socket.on("peer-media-state-changed", ({ type, enabled }) => {
      console.log(`🔊 [Signaling] Peer changed ${type} state to: ${enabled}`);
      if (type === "video") {
        isPeerVideoOff = !enabled;
        showPeerCameraOff(isPeerVideoOff);
      } else if (type === "audio") {
        if (peerMutedBadge) {
          peerMutedBadge.style.display = enabled ? "none" : "flex";
        }
      }
    });

    // STEP 6: Receive Synchronized Call Ended Event (Broadcast to room)
    socket.on("call-ended", ({ reason }) => {
      console.log("🛑 [Signaling] Received call-ended event from server:", reason);
      performTeardownAndRedirect(reason || "Call session ended.");
    });

    // STEP 6: Receive Peer Disconnect Event
    socket.on("peer-disconnected", ({ reason }) => {
      console.warn("⚠️ [Signaling] Peer disconnected:", reason);
      handlePeerDisconnect();
    });

    // Receive Call Declined Event
    socket.on("call-declined", () => {
      console.warn("❌ [Signaling] Call was declined by peer.");
      showError("Call Declined", `${peerName || "Participant"} declined the video call request.`);
      setTimeout(() => {
        performTeardownAndRedirect("Call declined by peer.");
      }, 2500);
    });

    // Receive Call Cancelled Event
    socket.on("call-cancelled", () => {
      console.warn("🚫 [Signaling] Call was cancelled by caller.");
      showError("Call Cancelled", `The video call request was cancelled.`);
      setTimeout(() => {
        performTeardownAndRedirect("Call cancelled.");
      }, 2000);
    });

    // Handle Signaling Server Errors
    socket.on("video-error", ({ message }) => {
      showError("Video Session Notice", message);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket Connection Error:", err);
      updateStatus("disconnected", "Signaling Server Offline");
    });
  }

  /**
   * STEP 3: PEER CONNECTION CREATION & TRACK MANAGEMENT
   */
  function createPeerConnection() {
    if (peerConnection) return;

    console.log("⚙️ [WebRTC] Creating RTCPeerConnection instance...");
    peerConnection = new RTCPeerConnection(rtcConfig);
    remoteStream = new MediaStream();

    // Attach local tracks to RTCPeerConnection
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });
    }

    // ICE Candidate Handler
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc-ice-candidate", {
          bookingId,
          candidate: event.candidate,
          senderId: userId,
        });
      }
    };

    // Remote Track Handler
    peerConnection.ontrack = (event) => {
      console.log("📺 [WebRTC] Received remote track:", event.track.kind);
      
      if (event.track) {
        remoteStream.addTrack(event.track);
      }
      
      remoteVideo.srcObject = remoteStream;

      // Force remote video playback handling browser autoplay policies
      remoteVideo.play().catch((err) => {
        console.warn("Remote video play catch:", err);
      });

      // Handle track mute/unmute events
      event.track.onmute = () => {
        if (event.track.kind === "video") {
          showPeerCameraOff(true);
        }
      };

      event.track.onunmute = () => {
        if (event.track.kind === "video" && !isPeerVideoOff) {
          showPeerCameraOff(false);
        }
      };

      if (!isPeerVideoOff) {
        showPeerCameraOff(false);
      }
    };

    // Connection State Change Monitoring
    peerConnection.onconnectionstatechange = () => {
      console.log("🔄 [WebRTC] Connection state changed to:", peerConnection.connectionState);
      switch (peerConnection.connectionState) {
        case "connected":
          updateStatus("connected", "Connected - HD Video Class");
          startCallTimer();
          if (!isPeerVideoOff) {
            showPeerCameraOff(false);
          }
          break;
        case "connecting":
          updateStatus("connecting", "Connecting WebRTC media...");
          break;
        case "disconnected":
          updateStatus("disconnected", "Reconnecting call...");
          break;
        case "failed":
          updateStatus("disconnected", "Connection Failed");
          break;
        case "closed":
          updateStatus("disconnected", "Call Ended");
          break;
      }
    };

    // ICE Connection State Monitoring
    peerConnection.oniceconnectionstatechange = () => {
      console.log("🌐 [WebRTC] ICE Connection state:", peerConnection.iceConnectionState);
      if (peerConnection.iceConnectionState === "disconnected") {
        updateStatus("disconnected", "Re-establishing Connection...");
      }
    };
  }

  /**
   * SDP OFFER INITIATION (Offerer)
   */
  async function initiateOffer() {
    try {
      if (!peerConnection) return;
      console.log("🛫 [WebRTC] Creating SDP Offer...");
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await peerConnection.setLocalDescription(offer);

      socket.emit("webrtc-offer", {
        bookingId,
        offer: peerConnection.localDescription,
        senderId: userId,
      });
    } catch (err) {
      console.error("Error creating offer:", err);
    }
  }

  /**
   * SDP OFFER HANDLING (Answerer)
   */
  async function handleOffer(offer) {
    try {
      if (!peerConnection) {
        createPeerConnection();
      }

      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      console.log("✅ [WebRTC] Remote description (OFFER) set successfully.");

      await processIceCandidateQueue();

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      console.log("🛫 [WebRTC] Sending SDP ANSWER to peer...");
      socket.emit("webrtc-answer", {
        bookingId,
        answer: peerConnection.localDescription,
        senderId: userId,
      });
    } catch (err) {
      console.error("Error handling offer:", err);
    }
  }

  /**
   * SDP ANSWER HANDLING (Offerer)
   */
  async function handleAnswer(answer) {
    try {
      if (peerConnection && peerConnection.signalingState !== "stable") {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        console.log("✅ [WebRTC] Remote description (ANSWER) set successfully.");
        await processIceCandidateQueue();
      }
    } catch (err) {
      console.error("Error handling answer:", err);
    }
  }

  /**
   * ICE CANDIDATE PROCESSING
   */
  async function handleIceCandidate(candidate) {
    try {
      const rtcCandidate = new RTCIceCandidate(candidate);
      if (peerConnection && peerConnection.remoteDescription && peerConnection.remoteDescription.type) {
        await peerConnection.addIceCandidate(rtcCandidate);
      } else {
        iceCandidateQueue.push(rtcCandidate);
      }
    } catch (err) {
      console.error("Error adding ICE candidate:", err);
    }
  }

  async function processIceCandidateQueue() {
    while (iceCandidateQueue.length > 0) {
      const candidate = iceCandidateQueue.shift();
      try {
        await peerConnection.addIceCandidate(candidate);
      } catch (err) {
        console.error("Error adding queued ICE candidate:", err);
      }
    }
  }

  /**
   * PEER CAMERA OFF UI TOGGLE
   */
  function showPeerCameraOff(isOff) {
    if (isOff) {
      if (peerPlaceholderTitle) peerPlaceholderTitle.textContent = `${peerName || "Participant"}'s camera is off`;
      if (peerPlaceholderSub) peerPlaceholderSub.innerHTML = '<i class="fa-solid fa-video-slash"></i> Video stream paused by participant';
      peerPlaceholder.style.display = "flex";
      peerPlaceholder.style.opacity = "1";
    } else {
      if (peerConnection && peerConnection.connectionState === "connected") {
        peerPlaceholder.style.opacity = "0";
        setTimeout(() => {
          if (peerPlaceholder.style.opacity === "0") {
            peerPlaceholder.style.display = "none";
          }
        }, 300);
      } else {
        if (peerPlaceholderTitle) peerPlaceholderTitle.textContent = `Waiting for ${peerName || "participant"} (${peerRole || "Peer"})`;
        if (peerPlaceholderSub) peerPlaceholderSub.innerHTML = '<i class="fa-solid fa-signal"></i> Establishing secure peer-to-peer WebRTC connection...';
        peerPlaceholder.style.display = "flex";
        peerPlaceholder.style.opacity = "1";
      }
    }
  }

  /**
   * INTERACTIVE CONTROLS
   */

  // Toggle Microphone Mute / Unmute
  toggleAudioBtn.addEventListener("click", () => {
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      isAudioMuted = !isAudioMuted;
      audioTrack.enabled = !isAudioMuted;

      toggleAudioBtn.classList.toggle("off", isAudioMuted);
      toggleAudioBtn.innerHTML = isAudioMuted
        ? '<i class="fa-solid fa-microphone-slash"></i>'
        : '<i class="fa-solid fa-microphone"></i>';

      localMicIcon.innerHTML = isAudioMuted
        ? '<i class="fa-solid fa-microphone-slash" style="color: #ef4444;"></i>'
        : '<i class="fa-solid fa-microphone"></i>';

      if (socket) {
        socket.emit("media-state-toggle", {
          bookingId,
          type: "audio",
          enabled: !isAudioMuted,
          senderId: userId,
        });
      }
    }
  });

  // Toggle Camera On / Off
  toggleVideoBtn.addEventListener("click", () => {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      isVideoOff = !isVideoOff;
      videoTrack.enabled = !isVideoOff;

      toggleVideoBtn.classList.toggle("off", isVideoOff);
      toggleVideoBtn.innerHTML = isVideoOff
        ? '<i class="fa-solid fa-video-slash"></i>'
        : '<i class="fa-solid fa-video"></i>';

      if (localPlaceholder) {
        localPlaceholder.style.display = isVideoOff ? "flex" : "none";
      }
      localVideo.style.display = isVideoOff ? "none" : "block";

      if (socket) {
        socket.emit("media-state-toggle", {
          bookingId,
          type: "video",
          enabled: !isVideoOff,
          senderId: userId,
        });
      }
    }
  });

  // Toggle Screen Sharing
  toggleScreenBtn.addEventListener("click", async () => {
    try {
      if (!isScreenSharing) {
        console.log("🖥️ [WebRTC] Requesting Screen Share stream...");
        screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        const screenTrack = screenStream.getVideoTracks()[0];

        if (peerConnection) {
          const sender = peerConnection
            .getSenders()
            .find((s) => s.track && s.track.kind === "video");

          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        }

        localVideo.srcObject = screenStream;
        isScreenSharing = true;
        toggleScreenBtn.classList.add("off");
        toggleScreenBtn.style.background = "#0284c7";

        screenTrack.onended = () => {
          stopScreenSharing();
        };
      } else {
        stopScreenSharing();
      }
    } catch (err) {
      console.warn("Screen Sharing Error / Cancelled:", err);
    }
  });

  function stopScreenSharing() {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
    }
    const cameraTrack = localStream.getVideoTracks()[0];
    if (peerConnection && cameraTrack) {
      const sender = peerConnection
        .getSenders()
        .find((s) => s.track && s.track.kind === "video");
      if (sender) {
        sender.replaceTrack(cameraTrack);
      }
    }
    localVideo.srcObject = localStream;
    isScreenSharing = false;
    toggleScreenBtn.classList.remove("off");
    toggleScreenBtn.style.background = "";
  }

  // End Call Button Handler (PERSISTENT FOR BOTH TUTOR AND STUDENT)
  endCallBtn.addEventListener("click", () => {
    if (socket) {
      socket.emit("leave-video-room", { bookingId, userId });
    }
    performTeardownAndRedirect("Call ended");
  });

  /**
   * CALL DISCONNECT & TEARDOWN
   */
  function performTeardownAndRedirect(reason = "Call Ended") {
    if (isCleaningUp) return;
    isCleaningUp = true;

    console.log("🛑 [WebRTC] Executing full call teardown...", reason);

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
    }

    if (peerConnection) {
      peerConnection.close();
      peerConnection = null;
    }

    if (socket) {
      socket.disconnect();
      socket = null;
    }

    stopCallTimer();

    const normalizedRole = userRole ? userRole.toLowerCase() : "student";
    window.location.href = `/dashboard/${normalizedRole}?message=${encodeURIComponent(reason)}`;
  }

  function handlePeerDisconnect() {
    updateStatus("disconnected", `${peerName || "Participant"} disconnected.`);
    if (peerPlaceholderTitle) peerPlaceholderTitle.textContent = `${peerName || "Participant"} left the call`;
    if (peerPlaceholderSub) peerPlaceholderSub.textContent = "The class session has ended or network connection was dropped.";
    peerPlaceholder.style.display = "flex";
    peerPlaceholder.style.opacity = "1";
    remoteVideo.srcObject = null;
    stopCallTimer();

    setTimeout(() => {
      performTeardownAndRedirect(`${peerName || "Participant"} disconnected.`);
    }, 3000);
  }

  function updateStatus(stateClass, labelText) {
    connectionBadge.className = `status-badge ${stateClass}`;
    let iconHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    if (stateClass === "connected") {
      iconHTML = '<i class="fa-solid fa-circle" style="font-size: 9px; color: #34d399;"></i>';
    } else if (stateClass === "disconnected") {
      iconHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
    }
    connectionBadge.innerHTML = `${iconHTML} ${labelText}`;
  }

  function startCallTimer() {
    if (callTimerInterval) return;
    callSeconds = 0;
    callTimerInterval = setInterval(() => {
      callSeconds++;
      const mins = String(Math.floor(callSeconds / 60)).padStart(2, "0");
      const secs = String(callSeconds % 60).padStart(2, "0");
      callTimerEl.textContent = `${mins}:${secs}`;
    }, 1000);
  }

  function stopCallTimer() {
    if (callTimerInterval) {
      clearInterval(callTimerInterval);
      callTimerInterval = null;
    }
  }

  function showError(title, message) {
    errorTitle.textContent = title;
    errorMessage.textContent = message;
    errorOverlay.style.display = "flex";
  }

  window.addEventListener("beforeunload", () => {
    if (socket && !isCleaningUp) {
      socket.emit("leave-video-room", { bookingId, userId });
    }
  });

  // INITIALIZATION WORKFLOW
  const mediaReady = await initLocalMedia();
  if (mediaReady) {
    initSocketSignaling();
  }
});
