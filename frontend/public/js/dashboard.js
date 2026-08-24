

window.resetFilters = function() {
    document.querySelectorAll('.filter-item select, .filter-item input').forEach(function(el) {
        if (el.tagName === 'SELECT') {
            el.value = 'all';
        } else {
            el.value = '';
        }
    });
    if (typeof filterTutors === 'function') filterTutors();
};

window.TUTORS_DATA = [
    {
        id: "tutor-1",
        name: "Dr. Varun Sharma",
        title: "PhD in Mathematics, Senior IIT/SAT Prep Coach",
        subject: "Mathematics",
        grade: "Grade 9-10",
        location: "Online",
        experience: "10+ yrs",
        fee: 45,
        rating: 4.9,
        language: "English",
        initials: "SJ",
        bio: "Specializing in High School Calculus, Algebra, and Competitive Math. Over 10 years of experience helping students score top grades.",
        reviewsCount: 64,
        availableSlots: ["Today 4:00 PM", "Tomorrow 6:00 PM", "Aug 04 5:00 PM"]
    },
    {
        id: "tutor-2",
        name: "Prof. Santosh Joshi",
        title: "M.Sc Physics, Ex-University Lecturer",
        subject: "Physics",
        grade: "Grade 11-12",
        location: "New Delhi",
        experience: "5-10 yrs",
        fee: 55,
        rating: 4.8,
        language: "English",
        initials: "RL",
        bio: "Passionate physics educator breaking down complex quantum mechanics and electromagnetism concepts into simple visual insights.",
        reviewsCount: 42,
        availableSlots: ["Today 5:30 PM", "Aug 03 3:00 PM"]
    },
    {
        id: "tutor-3",
        name: "Ms. Ritu Sahani",
        title: "Certified Language Specialist & Translator",
        subject: "Languages",
        grade: "Grade 6-8",
        location: "Mumbai",
        experience: "3-5 yrs",
        fee: 35,
        rating: 4.9,
        language: "Spanish",
        initials: "ER",
        bio: "Native Spanish speaker offering fun, conversational language classes for middle school & high school students.",
        reviewsCount: 38,
        availableSlots: ["Aug 02 4:00 PM", "Aug 05 6:00 PM"]
    },
    {
        id: "tutor-4",
        name: "Prof. Michael Vance",
        title: "Organic Chemistry Specialist",
        subject: "Chemistry",
        grade: "Grade 11-12",
        location: "Online",
        experience: "10+ yrs",
        fee: 50,
        rating: 4.7,
        language: "English",
        initials: "MV",
        bio: "Chemistry tutor specializing in organic reaction mechanisms, stoichiometry, and AP Chemistry test prep.",
        reviewsCount: 51,
        availableSlots: ["Aug 03 5:00 PM", "Aug 04 7:00 PM"]
    },
    {
        id: "tutor-5",
        name: "Anita Roy",
        title: "Primary & Middle School English Teacher",
        subject: "English",
        grade: "Grade 1-5",
        location: "Bangalore",
        experience: "3-5 yrs",
        fee: 30,
        rating: 4.8,
        language: "Hindi",
        initials: "AR",
        bio: "Friendly grammar and creative writing coach for elementary & junior students. Interactive reading sessions.",
        reviewsCount: 29,
        availableSlots: ["Tomorrow 3:00 PM", "Aug 03 4:00 PM"]
    },
    {
        id: "tutor-6",
        name: "Vikram Rao",
        title: "Senior Full Stack Software Engineer & Coding Coach",
        subject: "Coding",
        grade: "College",
        location: "Online",
        experience: "5-10 yrs",
        fee: 65,
        rating: 5.0,
        language: "English",
        initials: "VR",
        bio: "Teaching Python, JavaScript, Data Structures, Algorithms, and Web Application Development.",
        reviewsCount: 87,
        availableSlots: ["Today 8:00 PM", "Aug 02 7:00 PM"]
    }
];

window.FAVORITE_TUTORS = JSON.parse(localStorage.getItem('smt_favorites') || '["tutor-1", "tutor-3"]');

document.addEventListener('DOMContentLoaded', () => {
    // Role selector handling in sidebar
    const roleSelect = document.getElementById('sidebarRoleSelect');
    if (roleSelect) {
        roleSelect.addEventListener('change', (e) => {
            const role = e.target.value;
            if (role) {
                window.location.href = `/dashboard/${role}`;
            }
        });
    }

   
    const tabButtons = document.querySelectorAll('.dash-tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetGroup = btn.getAttribute('data-tab-group');
            const targetTab = btn.getAttribute('data-tab');

            document.querySelectorAll(`.dash-tab-btn[data-tab-group="${targetGroup}"]`).forEach(b => b.classList.remove('active'));
            document.querySelectorAll(`.dash-tab-content[data-tab-group="${targetGroup}"]`).forEach(c => c.style.display = 'none');

            btn.classList.add('active');
            const chosenContent = document.querySelector(`.dash-tab-content[data-tab-group="${targetGroup}"][data-tab="${targetTab}"]`);
            if (chosenContent) {
                chosenContent.style.display = 'block';
            }

            if (targetTab === 'search-tutors' || targetTab === 'tutor-search') {
                renderTutorGrid();
            } else if (targetTab === 'favorite-tutors') {
                renderFavoritesGrid();
            } else if (targetTab === 'blogs') {
                window.loadAdminBlogs();
            }
        });
    });

    // Parent Dashboard child switcher logic
    const childButtons = document.querySelectorAll('.child-btn');
    childButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            childButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const childName = btn.getAttribute('data-child');
            showToast(`Switched view to child: ${childName}`);
        });
    });

    renderTutorGrid();
    renderFavoritesGrid();
});

// TUTOR FEATURE 1: EDIT PROFESSIONAL PROFILE
window.openEditTutorProfileModal = function() {
    const modalHTML = `
        <div class="dash-modal-backdrop open" id="editProfileModal">
            <div class="dash-modal-content">
                <div class="dash-modal-header">
                    <h3>Edit Professional Tutor Profile</h3>
                    <button class="dash-modal-close" onclick="closeModal('editProfileModal')">&times;</button>
                </div>
                <div class="dash-modal-body">
                    <form onsubmit="saveTutorProfile(event)">
                        <div class="filter-item" style="margin-bottom: 14px;">
                            <label>Professional Title</label>
                            <input type="text" value="PhD in Mathematics, Senior IIT/SAT Prep Coach" required>
                        </div>
                        <div class="filter-item" style="margin-bottom: 14px;">
                            <label>Teaching Bio & Philosophy</label>
                            <textarea style="height: 100px;" required>Specializing in High School Calculus, Algebra, and Competitive Math. Over 10 years of experience helping students score top grades.</textarea>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
                            <div class="filter-item">
                                <label>Experience (Years)</label>
                                <input type="text" value="10+ yrs" required>
                            </div>
                            <div class="filter-item">
                                <label>Intro Video URL (YouTube/Vimeo)</label>
                                <input type="url" value="https://youtube.com/watch?v=demo" required>
                            </div>
                        </div>
                        <div class="dash-modal-footer" style="padding: 0; background: transparent; border: none; margin-top: 20px;">
                            <button type="button" class="dash-btn dash-btn-outline" onclick="closeModal('editProfileModal')">Cancel</button>
                            <button type="submit" class="dash-btn dash-btn-primary"><i class="fa-solid fa-floppy-disk"></i> Save Profile Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    removeModal('editProfileModal');
    document.body.insertAdjacentHTML('beforeend', modalHTML);
};

window.saveTutorProfile = function(e) {
    e.preventDefault();
    closeModal('editProfileModal');
    showToast('Professional Tutor Profile updated successfully!');
};

// TUTOR FEATURE 2: UPLOAD QUALIFICATIONS & CERTIFICATES
window.openUploadQualificationModal = function() {
    const modalHTML = `
        <div class="dash-modal-backdrop open" id="qualModal">
            <div class="dash-modal-content">
                <div class="dash-modal-header">
                    <h3>Upload Degree & Teaching Certificates</h3>
                    <button class="dash-modal-close" onclick="closeModal('qualModal')">&times;</button>
                </div>
                <div class="dash-modal-body">
                    <form onsubmit="submitQualificationDoc(event)">
                        <div class="filter-item" style="margin-bottom: 14px;">
                            <label>Document Title</label>
                            <input type="text" placeholder="e.g. Master's Degree in Mathematics" required>
                        </div>
                        <div class="filter-item" style="margin-bottom: 14px;">
                            <label>Issuing Institution / University</label>
                            <input type="text" placeholder="e.g. Delhi University / Stanford University" required>
                        </div>
                        <div class="filter-item" style="margin-bottom: 14px;">
                            <label>Upload Document File (PDF / JPG)</label>
                            <input type="file" required style="padding: 8px;">
                        </div>
                        <div class="dash-modal-footer" style="padding: 0; background: transparent; border: none; margin-top: 20px;">
                            <button type="button" class="dash-btn dash-btn-outline" onclick="closeModal('qualModal')">Cancel</button>
                            <button type="submit" class="dash-btn dash-btn-primary"><i class="fa-solid fa-upload"></i> Upload Certificate</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    removeModal('qualModal');
    document.body.insertAdjacentHTML('beforeend', modalHTML);
};

window.submitQualificationDoc = function(e) {
    e.preventDefault();
    closeModal('qualModal');
    showToast('Qualification document uploaded for admin review!');
};

// TUTOR FEATURE 3: VERIFICATION / KYC
window.openKYCModal = function() {
    const modalHTML = `
        <div class="dash-modal-backdrop open" id="kycModal">
            <div class="dash-modal-content">
                <div class="dash-modal-header">
                    <h3><i class="fa-solid fa-shield-halved" style="color: #16a34a;"></i> Identity Verification & KYC</h3>
                    <button class="dash-modal-close" onclick="closeModal('kycModal')">&times;</button>
                </div>
                <div class="dash-modal-body">
                    <div style="background: #dcfce7; color: #15803d; padding: 14px; border-radius: 12px; margin-bottom: 16px; font-weight: 700; font-size: 13px;">
                        <i class="fa-solid fa-circle-check"></i> Current Status: Verified Educator (100% Complete)
                    </div>
                    <form onsubmit="submitKYC(event)">
                        <div class="filter-item" style="margin-bottom: 14px;">
                            <label>Government Identification Type</label>
                            <select required>
                                <option>Passport / Aadhaar / National ID</option>
                                <option>Driver's License</option>
                            </select>
                        </div>
                        <div class="filter-item" style="margin-bottom: 14px;">
                            <label>ID Number</label>
                            <input type="text" value="XXXX-XXXX-9912" required>
                        </div>
                        <div class="filter-item" style="margin-bottom: 14px;">
                            <label>Upload ID Front & Back (PDF/JPG)</label>
                            <input type="file" style="padding: 8px;">
                        </div>
                        <div class="dash-modal-footer" style="padding: 0; background: transparent; border: none; margin-top: 20px;">
                            <button type="button" class="dash-btn dash-btn-outline" onclick="closeModal('kycModal')">Cancel</button>
                            <button type="submit" class="dash-btn dash-btn-primary" style="background: #16a34a;">Re-Submit Verification</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    removeModal('kycModal');
    document.body.insertAdjacentHTML('beforeend', modalHTML);
};

window.submitKYC = function(e) {
    e.preventDefault();
    closeModal('kycModal');
    showToast('KYC Identity documents submitted successfully!');
};

// TUTOR FEATURE 4 & 5: ADD SUBJECTS, EXPERTISE & FEES
window.openSubjectRatesModal = function() {
    const modalHTML = `
        <div class="dash-modal-backdrop open" id="subjectRatesModal">
            <div class="dash-modal-content">
                <div class="dash-modal-header">
                    <h3>Manage Subjects, Expertise & Fees</h3>
                    <button class="dash-modal-close" onclick="closeModal('subjectRatesModal')">&times;</button>
                </div>
                <div class="dash-modal-body">
                    <form onsubmit="saveSubjectRates(event)">
                        <div class="filter-item" style="margin-bottom: 14px;">
                            <label>Primary Subject</label>
                            <select required>
                                <option selected>Mathematics (Calculus, Algebra, Geometry)</option>
                                <option>Physics (Mechanics, Waves, Electromagnetism)</option>
                                <option>Chemistry (Organic & Physical)</option>
                            </select>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
                            <div class="filter-item">
                                <label>Hourly Rate (₹/hr)</label>
                                <input type="number" value="450" required>
                            </div>
                            <div class="filter-item">
                                <label>Monthly Package Rate (₹)</label>
                                <input type="number" value="3600" required>
                            </div>
                        </div>

                        <div class="filter-item" style="margin-bottom: 14px;">
                            <label>Expertise Level</label>
                            <select required>
                                <option selected>Advanced (Grade 11-12 & College)</option>
                                <option>Intermediate (Grade 6-10)</option>
                                <option>Beginner (Primary Grade 1-5)</option>
                            </select>
                        </div>

                        <div class="dash-modal-footer" style="padding: 0; background: transparent; border: none; margin-top: 20px;">
                            <button type="button" class="dash-btn dash-btn-outline" onclick="closeModal('subjectRatesModal')">Cancel</button>
                            <button type="submit" class="dash-btn dash-btn-primary"><i class="fa-solid fa-floppy-disk"></i> Update Rates</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    removeModal('subjectRatesModal');
    document.body.insertAdjacentHTML('beforeend', modalHTML);
};

window.saveSubjectRates = function(e) {
    e.preventDefault();
    closeModal('subjectRatesModal');
    showToast('Subjects, expertise, and hourly/monthly rates updated!');
};

// TUTOR FEATURE 6: MANAGE AVAILABILITY
window.toggleAvailabilitySlot = function(slotElement) {
    slotElement.classList.toggle('active');
    const isActive = slotElement.classList.contains('active');
    showToast(isActive ? 'Slot set to Available' : 'Slot set to Unavailable');
};

// TUTOR FEATURE 7: ACCEPT OR REJECT TUTORING REQUESTS (CONNECTED TO MONGODB)
window.acceptBookingRequest = async function(reqId, studentName) {
    try {
        const response = await fetch(`/api/tutor/booking-request/${reqId}/accept`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" }
        });
        const data = await response.json();
        if (data.success) {
            const row = document.getElementById(reqId);
            if (row) {
                row.innerHTML = `<td colspan="5" style="color: #16a34a; font-weight: 700; background: #dcfce7;"><i class="fa-solid fa-circle-check"></i> Booking request from ${studentName} ACCEPTED and added to calendar.</td>`;
                setTimeout(() => row.remove(), 2500);
            }
            showToast(`✅ ${data.message}`);
            if (typeof loadTutorDashboardData === 'function') loadTutorDashboardData();
        } else {
            showToast(`❌ ${data.message || "Failed to accept booking"}`);
        }
    } catch (err) {
        console.error("Accept Booking Error:", err);
        showToast("❌ Error accepting booking request.");
    }
};

window.declineBookingRequest = async function(reqId, studentName) {
    try {
        const response = await fetch(`/api/tutor/booking-request/${reqId}/reject`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" }
        });
        const data = await response.json();
        if (data.success) {
            const row = document.getElementById(reqId);
            if (row) {
                row.innerHTML = `<td colspan="5" style="color: #b91c1c; font-weight: 700; background: #fee2e2;"><i class="fa-solid fa-circle-xmark"></i> Booking request from ${studentName} DECLINED.</td>`;
                setTimeout(() => row.remove(), 2500);
            }
            showToast(`✅ ${data.message}`);
            if (typeof loadTutorDashboardData === 'function') loadTutorDashboardData();
        } else {
            showToast(`❌ ${data.message || "Failed to decline booking"}`);
        }
    } catch (err) {
        console.error("Decline Booking Error:", err);
        showToast("❌ Error declining booking request.");
    }
};

// TUTOR FEATURE 8: CONDUCT ONLINE OR HOME SESSIONS
window.launchSession = function(sessionName, mode) {
    if (mode === 'online') {
        const modalHTML = `
            <div class="dash-modal-backdrop open" id="sessionModal">
                <div class="dash-modal-content">
                    <div class="dash-modal-header" style="background: var(--primary); color: #fff;">
                        <h3 style="color: #fff;"><i class="fa-solid fa-video" style="color: var(--accent);"></i> Online Video Classroom Active</h3>
                        <button class="dash-modal-close" style="color: #fff;" onclick="closeModal('sessionModal')">&times;</button>
                    </div>
                    <div class="dash-modal-body" style="text-align: center; padding: 40px 20px;">
                        <div style="width: 80px; height: 80px; border-radius: 50%; background: #e0f2fe; color: #0284c7; font-size: 36px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto;">
                            <i class="fa-solid fa-headset"></i>
                        </div>
                        <h3 style="font-size: 22px; font-weight: 800; color: var(--text-dark);">${sessionName}</h3>
                        <p style="color: var(--text-muted); font-size: 14px; margin-top: 6px;">Encrypted HD Video & Digital Whiteboard Connected</p>
                        <div style="display: flex; gap: 12px; justify-content: center; margin-top: 24px;">
                            <button class="dash-btn dash-btn-accent" onclick="showToast('Screen sharing started...')"><i class="fa-solid fa-desktop"></i> Share Screen</button>
                            <button class="dash-btn dash-btn-primary" onclick="showToast('Recording session...')"><i class="fa-solid fa-record-vin"></i> Record</button>
                            <button class="dash-btn dash-btn-outline" style="color: #dc2626;" onclick="closeModal('sessionModal'); showToast('Class session ended.');">End Session</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        removeModal('sessionModal');
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    } else {
        showToast(`Home Session Details: Student Address & Contact details dispatched for ${sessionName}`);
    }
};

// WEBRTC VIDEO CALL LAUNCHER & BOOKING INTEGRATION
window.joinVideoCall = function(bookingId) {
    if (bookingId) {
        window.location.href = `/video-call/${bookingId}`;
    } else {
        if (typeof showToast === 'function') showToast("Invalid booking session ID.");
    }
};

window.openVideoCallModal = async function(peerName, bookingId) {
    if (bookingId) {
        window.location.href = `/video-call/${bookingId}`;
        return;
    }
    
    try {
        const isTutor = window.location.pathname.includes("tutor");
        const endpoint = isTutor ? "/api/tutor/booking-requests" : "/api/student/bookings";
        const res = await fetch(endpoint);
        const data = await res.json();
        
        const bookings = isTutor ? data.requests : data.bookings;
        const acceptedBooking = bookings ? bookings.find(b => b.status === "Accepted") : null;
        
        if (acceptedBooking) {
            window.location.href = `/video-call/${acceptedBooking._id}`;
        } else {
            const msg = "Video Call Notice: Video calling requires an ACCEPTED booking request. Please request or accept a tuition booking first.";
            if (typeof showToast === 'function') {
                showToast(msg);
            } else {
                alert(msg);
            }
        }
    } catch (err) {
        console.error("Video Call Check Error:", err);
        alert("Please navigate to an accepted booking request to join the video call.");
    }
};

// TUTOR FEATURE 9: UPLOAD ASSIGNMENTS & STUDY MATERIALS
window.openUploadAssignmentModal = function() {
    const modalHTML = `
        <div class="dash-modal-backdrop open" id="assignModal">
            <div class="dash-modal-content">
                <div class="dash-modal-header">
                    <h3>Upload Assignment or Study Material</h3>
                    <button class="dash-modal-close" onclick="closeModal('assignModal')">&times;</button>
                </div>
                <div class="dash-modal-body">
                    <form onsubmit="submitAssignment(event)">
                        <div class="filter-item" style="margin-bottom: 14px;">
                            <label>Assignment / Material Title</label>
                            <input type="text" placeholder="e.g. Calculus Integration Practice Worksheet #4" required>
                        </div>
                        <div class="filter-item" style="margin-bottom: 14px;">
                            <label>Target Student / Class</label>
                            <select required>
                                <option>Aarav Sharma (Grade 10 Calculus)</option>
                                <option>Ananya Patel (Grade 8 Geometry)</option>
                                <option>All Students</option>
                            </select>
                        </div>
                        <div class="filter-item" style="margin-bottom: 14px;">
                            <label>Due Date</label>
                            <input type="date" value="2026-08-08" required>
                        </div>
                        <div class="filter-item" style="margin-bottom: 14px;">
                            <label>Upload File (PDF / DOCX)</label>
                            <input type="file" required style="padding: 8px;">
                        </div>
                        <div class="dash-modal-footer" style="padding: 0; background: transparent; border: none; margin-top: 20px;">
                            <button type="button" class="dash-btn dash-btn-outline" onclick="closeModal('assignModal')">Cancel</button>
                            <button type="submit" class="dash-btn dash-btn-primary"><i class="fa-solid fa-upload"></i> Distribute Assignment</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    removeModal('assignModal');
    document.body.insertAdjacentHTML('beforeend', modalHTML);
};

window.submitAssignment = function(e) {
    e.preventDefault();
    closeModal('assignModal');
    showToast('Assignment uploaded & distributed to student dashboard!');
};

// TUTOR FEATURE 10: TRACK STUDENT ATTENDANCE
window.logAttendance = function(studentName, status) {
    showToast(`Logged attendance for ${studentName}: ${status}`);
};

// TUTOR FEATURE: REAL DYNAMIC PAYOUT REQUEST SYSTEM
window.openPayoutModal = async function() {
    try {
        const res = await fetch("/api/tutor/dashboard-stats");
        const data = await res.json();
        
        let availableBalance = 0;
        let pendingRequest = null;

        if (data.success && data.stats) {
            availableBalance = data.stats.availableBalance !== undefined ? data.stats.availableBalance : 0;
            pendingRequest = data.pendingPayoutRequest || null;
        }

        const pendingNotice = pendingRequest ? `
            <div style="background: #fff7ed; border: 1px solid #ffedd5; border-left: 4px solid #f97316; padding: 12px 14px; border-radius: 8px; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; gap: 8px; color: #c2410c; font-weight: 700; font-size: 13px;">
                    <i class="fa-solid fa-triangle-exclamation"></i> Active Pending Payout Request
                </div>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #9a3412;">
                    You submitted a payout request of <strong>₹${pendingRequest.amount.toLocaleString('en-IN')}</strong> on ${new Date(pendingRequest.requestedAt).toLocaleDateString('en-IN')}. Please await administrator verification before submitting another request.
                </p>
            </div>
        ` : '';

        const modalHTML = `
            <div class="dash-modal-backdrop open" id="payoutModal" style="z-index: 1300;">
                <div class="dash-modal-content" style="max-width: 480px; width: 95%;">
                    <div class="dash-modal-header" style="background: #0f2a4a; color: #ffffff;">
                        <h3 style="margin: 0; color: #ffffff; font-size: 17px;"><i class="fa-solid fa-building-columns" style="color: #38bdf8; margin-right: 8px;"></i> Request Educator Earnings Payout</h3>
                        <button class="dash-modal-close" onclick="closeModal('payoutModal')" style="color: #94a3b8; font-size: 24px;">&times;</button>
                    </div>
                    <div class="dash-modal-body" style="padding: 20px;">
                        ${pendingNotice}

                        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 12px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <span style="font-size: 12px; color: #166534; font-weight: 700; text-transform: uppercase;">Available Earnings Balance</span>
                                <div style="font-size: 22px; font-weight: 800; color: #15803d; margin-top: 2px;">₹${availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                            </div>
                            <div style="width: 42px; height: 42px; border-radius: 50%; background: #dcfce7; color: #15803d; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                                <i class="fa-solid fa-wallet"></i>
                            </div>
                        </div>

                        <form onsubmit="submitPayoutRequest(event, ${availableBalance})">
                            <div class="filter-item" style="margin-bottom: 14px;">
                                <label style="font-size: 13px; font-weight: 700; color: #0f2a4a; display: block; margin-bottom: 6px;">Requested Payout Amount (₹)</label>
                                <input type="number" id="payoutAmountInput" min="100" max="${availableBalance}" value="${availableBalance > 0 ? Math.min(availableBalance, 5000) : 0}" required style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 14px; font-weight: 700;">
                                <small style="font-size: 11px; color: #64748b; margin-top: 4px; display: block;">Min: ₹100.00 &bull; Max: ₹${availableBalance.toLocaleString('en-IN')}</small>
                            </div>

                            <div class="filter-item" style="margin-bottom: 14px;">
                                <label style="font-size: 13px; font-weight: 700; color: #0f2a4a; display: block; margin-bottom: 6px;">Bank Account / UPI ID (Optional Details)</label>
                                <input type="text" id="payoutUpiInput" placeholder="e.g. tutor@upi or HDFC Bank Account" style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px;">
                            </div>

                            <div id="payoutModalErrorMsg" style="display: none; color: #dc2626; font-size: 12px; font-weight: 700; margin-bottom: 12px;"></div>

                            <div class="dash-modal-footer" style="padding: 0; background: transparent; border: none; margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
                                <button type="button" class="dash-btn dash-btn-outline" onclick="closeModal('payoutModal')">Cancel</button>
                                <button type="submit" class="dash-btn dash-btn-primary" style="background: #15803d; border-color: #15803d;" ${pendingRequest || availableBalance < 100 ? 'disabled style="opacity: 0.5; cursor: not-allowed; background: #94a3b8; border-color: #94a3b8;"' : ''}>
                                    <i class="fa-solid fa-paper-plane"></i> Submit Payout Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        removeModal('payoutModal');
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    } catch (err) {
        console.error("Open Payout Modal Error:", err);
        showToast("❌ Failed to load payout information.");
    }
};

window.openRequestPayoutModal = window.openPayoutModal;

window.submitPayoutRequest = async function(e, availableBalance) {
    e.preventDefault();
    const amountInput = document.getElementById("payoutAmountInput");
    const upiInput = document.getElementById("payoutUpiInput");
    const errorEl = document.getElementById("payoutModalErrorMsg");
    if (errorEl) errorEl.style.display = "none";

    const amount = Number(amountInput ? amountInput.value : 0);
    const upiDetails = upiInput ? upiInput.value.trim() : "";

    if (!amount || amount < 100) {
        if (errorEl) {
            errorEl.innerText = "❌ Minimum payout request amount is ₹100.00";
            errorEl.style.display = "block";
        }
        return;
    }

    if (amount > availableBalance) {
        if (errorEl) {
            errorEl.innerText = `❌ Requested amount exceeds available balance of ₹${availableBalance.toLocaleString('en-IN')}`;
            errorEl.style.display = "block";
        }
        return;
    }

    try {
        const res = await fetch("/api/tutor/payout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                amount: amount,
                paymentDetails: { upiId: upiDetails, accountNumber: upiDetails }
            })
        });
        const data = await res.json();

        if (data.success) {
            closeModal('payoutModal');
            showToast(`✅ ${data.message || "Payout request submitted successfully!"}`);
            if (typeof loadTutorDashboardData === 'function') {
                loadTutorDashboardData();
            }
        } else {
            if (errorEl) {
                errorEl.innerText = `❌ ${data.message || "Failed to submit payout request."}`;
                errorEl.style.display = "block";
            } else {
                showToast(`❌ ${data.message || "Failed to submit payout request."}`);
            }
        }
    } catch (err) {
        console.error("Submit Payout Request Error:", err);
        showToast("❌ Network error submitting payout request.");
    }
};

// SEARCH FILTER & FAVORITES ENGINE
let studentUserGeoLocation = null;

window.acquireStudentGPSLocation = function() {
    if (!navigator.geolocation) {
        showToast("⚠️ Geolocation is not supported by your browser.");
        return;
    }

    const radiusSelect = document.getElementById("filterDistanceRadius");
    if (radiusSelect && radiusSelect.value === "all") {
        radiusSelect.value = "10km";
    }

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            studentUserGeoLocation = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
            };
            showToast(`📍 GPS Location Acquired! Searching nearby tutors...`);
            window.filterStudentDashboardTutors();
        },
        (err) => {
            console.error("Student GPS Error:", err);
            showToast("⚠️ GPS permission denied. Falling back to city location search.");
            studentUserGeoLocation = null;
            window.filterStudentDashboardTutors();
        }
    );
};

window.filterStudentDashboardTutors = async function() {
    const container = document.getElementById("tutorGridContainer");
    if (!container) return;

    const searchText = document.getElementById("filterSearchText")?.value.trim() || "";
    const locationText = document.getElementById("filterLocationText")?.value.trim() || "";
    const subject = document.getElementById("filterSubject")?.value || "all";
    const board = document.getElementById("filterBoard")?.value || "all";
    const grade = document.getElementById("filterGrade")?.value || "all";
    const distanceRadius = document.getElementById("filterDistanceRadius")?.value || "all";
    const maxFee = document.getElementById("filterFeeMax")?.value || "";

    const query = new URLSearchParams();
    if (searchText) query.append("search", searchText);
    if (locationText) query.append("location", locationText);
    if (subject !== "all") query.append("subject", subject);
    if (board !== "all") query.append("board", board);
    if (grade !== "all") query.append("grade", grade);
    if (maxFee) query.append("maxFee", maxFee);
    if (distanceRadius !== "all") query.append("distanceRadius", distanceRadius);

    if (studentUserGeoLocation) {
        query.append("lat", studentUserGeoLocation.lat);
        query.append("lng", studentUserGeoLocation.lng);
    }

    try {
        const res = await fetch(`/api/tutor/all?${query.toString()}`);
        const data = await res.json();
        if (!data.success || !data.tutors) return;

        if (data.tutors.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <i class="fa-solid fa-user-slash" style="font-size: 36px; color: #94a3b8; margin-bottom: 10px;"></i>
                    <h4 style="font-size: 16px; color: #1e293b; margin: 0 0 6px 0;">No tutors found matching your criteria</h4>
                    <p style="color: #64748b; font-size: 13px; margin: 0;">Try adjusting your distance radius or city filters.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = data.tutors.map(t => {
            const tutorName = t.user ? t.user.name : "Tutor Account";
            const subStr = t.subjects ? t.subjects.join(", ") : "Tuition Subjects";
            const distanceBadge = (t.distanceKm !== undefined) 
                ? `<span style="background: #e0f2fe; color: #0369a1; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;"><i class="fa-solid fa-location-arrow"></i> ${t.distanceKm} km away</span>`
                : `<span style="font-size: 11px; color: #64748b;"><i class="fa-solid fa-location-dot"></i> ${t.location || 'Online'}</span>`;

            return `
                <div class="tutor-card" style="display: flex; flex-direction: column; justify-content: space-between; padding: 18px; border: 1px solid var(--border-color); border-radius: 12px; background: #ffffff;">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                            <div>
                                <h4 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 800; color: #0f2a4a;">${tutorName}</h4>
                                <span style="font-size: 12px; color: var(--text-muted);">${t.qualification || 'Degree'} &bull; ${t.experience || 0} Yrs Exp</span>
                            </div>
                            <span class="role-badge badge-tutor">₹${t.fee}/hr</span>
                        </div>
                        <p style="font-size: 13px; color: #334155; margin-bottom: 12px; font-weight: 600;">
                            <i class="fa-solid fa-book" style="color: var(--primary);"></i> ${subStr}
                        </p>
                        <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 14px;">
                            ${distanceBadge}
                            <span style="font-size: 11px; color: #b45309; font-weight: 600;"><i class="fa-solid fa-star" style="color: var(--accent-gold);"></i> ${t.rating || 5.0} (${t.totalReviews || 0})</span>
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px; margin-top: 10px;">
                        <button class="dash-btn dash-btn-outline" style="flex: 1; font-size: 12px; padding: 6px 10px; justify-content: center;" onclick="openDemoModal('${t._id}', '${tutorName.replace(/'/g, "\\'")}')">
                            <i class="fa-solid fa-calendar-plus"></i> Book Demo
                        </button>
                        <button class="dash-btn dash-btn-primary" style="flex: 1; font-size: 12px; padding: 6px 10px; justify-content: center;" onclick="openRequestTutorModal()">
                            <i class="fa-solid fa-paper-plane"></i> Hire Tutor
                        </button>
                    </div>
                </div>
            `;
        }).join("");
    } catch (err) {
        console.error("Filter Student Dashboard Tutors Error:", err);
    }
};

window.filterTutors = window.filterStudentDashboardTutors;
window.renderTutorGrid = window.filterStudentDashboardTutors;

window.renderFavoritesGrid = function() {
    const container = document.getElementById('favoritesGridContainer');
    if (!container) return;
    const favTutors = window.TUTORS_DATA.filter(t => window.FAVORITE_TUTORS.includes(t.id));
    if (favTutors.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: #fff; border-radius: 16px; border: 1px solid var(--border-color);">
                <i class="fa-regular fa-heart" style="font-size: 36px; color: var(--text-muted); margin-bottom: 12px;"></i>
                <h4 style="font-size: 18px; font-weight: 700; color: var(--text-dark);">No Favorite Tutors Saved Yet</h4>
            </div>
        `;
        return;
    }
    container.innerHTML = favTutors.map(t => createTutorCardHTML(t)).join('');
};

function createTutorCardHTML(t) {
    return `
        <div class="tutor-card">
            <div>
                <div class="tutor-header">
                    <div class="tutor-img">${t.initials}</div>
                    <div class="tutor-meta">
                        <h3>${t.name}</h3>
                        <p>${t.title}</p>
                        <div style="color: var(--accent-gold); font-size: 12px; font-weight: 700; margin-top: 4px;">
                            <i class="fa-solid fa-star"></i> ${t.rating} <span style="color: var(--text-muted);">(${t.reviewsCount} reviews)</span>
                        </div>
                    </div>
                </div>
                <p style="font-size: 13px; color: var(--text-dark); margin-bottom: 12px; line-height: 1.4;">${t.bio.substring(0, 95)}...</p>
                <div class="tutor-badges">
                    <span class="tutor-badge"><i class="fa-solid fa-book"></i> ${t.subject}</span>
                    <span class="tutor-badge"><i class="fa-solid fa-graduation-cap"></i> ${t.grade}</span>
                    <span class="tutor-badge"><i class="fa-solid fa-location-dot"></i> ${t.location}</span>
                </div>
                <div class="tutor-fee">₹${t.fee} <span style="font-size: 13px; color: var(--text-muted);">/ hour</span></div>
            </div>
            <div class="tutor-actions">
                <button class="dash-btn dash-btn-outline" style="flex: 1; padding: 8px 12px; font-size: 12px;" onclick="openProfileModal('${t.id}')">Profile</button>
                <button class="dash-btn dash-btn-accent" style="flex: 1; padding: 8px 12px; font-size: 12px;" onclick="openDemoModal('${t.id}')">Book Demo</button>
                <button class="dash-btn dash-btn-primary" style="flex: 1; padding: 8px 12px; font-size: 12px;" onclick="openScheduleModal('${t.id}')">Schedule</button>
                <button class="dash-btn dash-btn-outline" style="padding: 8px 10px; font-size: 12px;" onclick="openChatDrawer('${t.name}')"><i class="fa-solid fa-comments"></i></button>
            </div>
        </div>
    `;
}

window.toggleFavorite = function(tutorId) {
    if (window.FAVORITE_TUTORS.includes(tutorId)) {
        window.FAVORITE_TUTORS = window.FAVORITE_TUTORS.filter(id => id !== tutorId);
        showToast('Removed tutor from Favorites');
    } else {
        window.FAVORITE_TUTORS.push(tutorId);
        showToast('Added tutor to Favorites!');
    }
    localStorage.setItem('smt_favorites', JSON.stringify(window.FAVORITE_TUTORS));
    renderTutorGrid();
    renderFavoritesGrid();
};

window.openProfileModal = function(tutorId) {
    const t = window.TUTORS_DATA.find(x => x.id === tutorId);
    if (!t) return;

    const modalHTML = `
        <div class="dash-modal-backdrop open" id="profileModal">
            <div class="dash-modal-content">
                <div class="dash-modal-header">
                    <h3>Tutor Profile Overview</h3>
                    <button class="dash-modal-close" onclick="closeModal('profileModal')">&times;</button>
                </div>
                <div class="dash-modal-body">
                    <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 20px;">
                        <div class="tutor-img" style="width: 70px; height: 70px; font-size: 24px;">${t.initials}</div>
                        <div>
                            <h3 style="font-size: 20px; font-weight: 800; color: var(--primary); margin: 0;">${t.name}</h3>
                            <p style="color: var(--text-muted); font-size: 13px;">${t.title}</p>
                        </div>
                    </div>
                    <p style="font-size: 13px; color: var(--text-dark); line-height: 1.5;">${t.bio}</p>
                </div>
                <div class="dash-modal-footer">
                    <button class="dash-btn dash-btn-outline" onclick="closeModal('profileModal')">Close</button>
                    <button class="dash-btn dash-btn-accent" onclick="closeModal('profileModal'); openDemoModal('${t.id}')">Book Demo</button>
                </div>
            </div>
        </div>
    `;
    removeModal('profileModal');
    document.body.insertAdjacentHTML('beforeend', modalHTML);
};

window.openDemoModal = function(tutorId) {
    const t = (window.TUTORS_DATA && window.TUTORS_DATA.find(x => x.id === tutorId)) || { name: 'Selected Tutor', id: tutorId };

    const modalHTML = `
        <div class="dash-modal-backdrop open" id="demoModal">
            <div class="dash-modal-content">
                <div class="dash-modal-header">
                    <h3>Book Free Demo Session</h3>
                    <button class="dash-modal-close" onclick="closeModal('demoModal')">&times;</button>
                </div>
                <div class="dash-modal-body">
                    <form onsubmit="submitDemoClass(event, '${tutorId}', '${t.name}')">
                        <div class="filter-item" style="margin-bottom: 14px;">
                            <label>Tutor Name</label>
                            <input type="text" value="${t.name}" disabled style="background: var(--bg-light); cursor: not-allowed;">
                        </div>
                        <div class="filter-item" style="margin-bottom: 14px;">
                            <label>Preferred Demo Date & Time / Notes</label>
                            <textarea id="demoClassNotes" placeholder="e.g. Tomorrow at 5 PM. I need help preparing for CBSE Board Exams." style="width: 100%; height: 80px; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1;" required></textarea>
                        </div>
                        <div class="dash-modal-footer" style="padding: 0; background: transparent; border: none;">
                            <button type="button" class="dash-btn dash-btn-outline" onclick="closeModal('demoModal')">Cancel</button>
                            <button type="submit" class="dash-btn dash-btn-accent">Confirm Booking</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    removeModal('demoModal');
    document.body.insertAdjacentHTML('beforeend', modalHTML);
};

window.submitDemoClass = async function(e, tutorProfileId, tutorName) {
    e.preventDefault();
    const notes = document.getElementById('demoClassNotes')?.value.trim() || 'Demo Class Booking';
    closeModal('demoModal');

    try {
        const response = await fetch("/api/student/book", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tutorProfileId, message: notes }),
        });
        const data = await response.json();
        if (data.success) {
            showToast(`🎉 ${data.message}`);
        } else {
            showToast(`⚠️ ${data.message || "Failed to book demo. Please try logging in as a student."}`);
        }
    } catch (err) {
        console.error(err);
        showToast("❌ Error sending demo booking request.");
    }
};

window.openScheduleModal = function(tutorId) {
    const t = (window.TUTORS_DATA && window.TUTORS_DATA.find(x => x.id === tutorId)) || { name: 'Tutor', fee: 50 };
    openPaymentModal(tutorId, (t.fee || 50) * 12, `Regular Monthly Classes with ${t.name}`);
};

window.openRequestTutorModal = function() {
    const modalHTML = `
        <div class="dash-modal-backdrop open" id="requestTutorModal">
            <div class="dash-modal-content">
                <div class="dash-modal-header">
                    <h3>Submit Custom Tutor Request</h3>
                    <button class="dash-modal-close" onclick="closeModal('requestTutorModal')">&times;</button>
                </div>
                <div class="dash-modal-body">
                    <form onsubmit="submitCustomTutorRequest(event)">
                        <div class="filter-item" style="margin-bottom: 14px;">
                            <label>Subject Required</label>
                            <input type="text" id="customReqSubject" placeholder="e.g. Advanced Calculus / Physics" required>
                        </div>
                        <div class="filter-item" style="margin-bottom: 14px;">
                            <label>Class / Grade</label>
                            <select id="customReqGrade" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1;">
                                <option value="Grade 1-5">Grade 1-5</option>
                                <option value="Grade 6-8">Grade 6-8</option>
                                <option value="Grade 9-10" selected>Grade 9-10</option>
                                <option value="Grade 11-12">Grade 11-12</option>
                                <option value="College">College</option>
                            </select>
                        </div>
                        <div class="filter-item" style="margin-bottom: 14px;">
                            <label>Detailed Requirements / Preferred Timings</label>
                            <textarea id="customReqMessage" placeholder="Provide details about your learning goals and schedule preference..." style="width: 100%; height: 80px; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1;"></textarea>
                        </div>
                        <div class="dash-modal-footer" style="padding: 0; background: transparent; border: none;">
                            <button type="button" class="dash-btn dash-btn-outline" onclick="closeModal('requestTutorModal')">Cancel</button>
                            <button type="submit" class="dash-btn dash-btn-primary">Submit Request</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    removeModal('requestTutorModal');
    document.body.insertAdjacentHTML('beforeend', modalHTML);
};

window.submitCustomTutorRequest = function(e) {
    e.preventDefault();
    closeModal('requestTutorModal');
    showToast('🎉 Custom Tutor Request submitted! Tutors matching your criteria will be notified.');
};

window.openPaymentModal = function(tutorId, amount, itemTitle) {
    const modalHTML = `
        <div class="dash-modal-backdrop open" id="paymentModal">
            <div class="dash-modal-content">
                <div class="dash-modal-header">
                    <h3><i class="fa-solid fa-lock" style="color: #16a34a;"></i> Secure Payment Checkout</h3>
                    <button class="dash-modal-close" onclick="closeModal('paymentModal')">&times;</button>
                </div>
                <div class="dash-modal-body">
                    <div style="background: var(--bg-light); padding: 16px; border-radius: 12px; margin-bottom: 20px; display: flex; justify-content: space-between;">
                        <span>${itemTitle}</span>
                        <strong>₹${amount}.00</strong>
                    </div>
                    <form onsubmit="processPayment(event, '${itemTitle}', ${amount})">
                        <div class="filter-item" style="margin-bottom: 14px;">
                            <label>Card Number</label>
                            <input type="text" value="4532 8921 4410 8892" required>
                        </div>
                        <div class="dash-modal-footer" style="padding: 0; background: transparent; border: none;">
                            <button type="button" class="dash-btn dash-btn-outline" onclick="closeModal('paymentModal')">Cancel</button>
                            <button type="submit" class="dash-btn dash-btn-primary" style="background: #16a34a;">Pay ₹${amount}.00</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    removeModal('paymentModal');
    document.body.insertAdjacentHTML('beforeend', modalHTML);
};

window.processPayment = function(e, title, amount) {
    e.preventDefault();
    closeModal('paymentModal');
    showToast(`Payment of ₹${amount}.00 processed!`);
};

window.openReviewModal = async function(tutorProfileId) {
    let selectedTutorId = (tutorProfileId && tutorProfileId !== 'tutor-1') ? tutorProfileId : null;
    let acceptedTutors = [];

    try {
        const bookingsRes = await fetch("/api/student/bookings");
        const bookingsData = await bookingsRes.json();
        
        if (bookingsData.success && bookingsData.bookings) {
            const eligibleBookings = bookingsData.bookings.filter(b => b.status === "Accepted" && b.tutorProfile);
            
            const tutorMap = new Map();
            eligibleBookings.forEach(b => {
                const tProfile = b.tutorProfile;
                const tId = tProfile._id || tProfile;
                const tName = (tProfile.user && tProfile.user.name) ? tProfile.user.name : (b.tutor ? b.tutor.name : "Educator");
                if (tId && !tutorMap.has(tId)) {
                    tutorMap.set(tId, { id: tId, name: tName });
                }
            });
            acceptedTutors = Array.from(tutorMap.values());
        }
    } catch (err) {
        console.error("Error loading eligible tutors for review:", err);
    }

    if (!selectedTutorId && acceptedTutors.length === 0) {
        showToast("⚠️ You can only review tutors with whom you have an accepted booking or completed class.");
        return;
    }

    if (!selectedTutorId && acceptedTutors.length > 0) {
        selectedTutorId = acceptedTutors[0].id;
    }

    // Fetch existing review if student already reviewed this tutor
    let existingRating = 5;
    let existingComment = "";
    let isEditMode = false;

    if (selectedTutorId) {
        try {
            const revRes = await fetch(`/api/student/review/${selectedTutorId}`);
            const revData = await revRes.json();
            if (revData.success && revData.review) {
                existingRating = revData.review.rating || 5;
                existingComment = revData.review.comment || "";
                isEditMode = true;
            }
        } catch (err) {
            console.error("Error fetching existing review:", err);
        }
    }

    const tutorOptionsHTML = acceptedTutors.map(t => 
        `<option value="${t.id}" ${t.id === selectedTutorId ? 'selected' : ''}>${t.name}</option>`
    ).join("");

    const modalHTML = `
        <div class="dash-modal-backdrop open" id="reviewModal" style="z-index: 1150;">
            <div class="dash-modal-content" style="max-width: 520px; width: 92%;">
                <div class="dash-modal-header">
                    <h3><i class="fa-solid fa-star" style="color: #f59e0b;"></i> ${isEditMode ? 'Edit Your Tutor Review' : 'Submit Tutor Rating & Review'}</h3>
                    <button class="dash-modal-close" onclick="closeModal('reviewModal')">&times;</button>
                </div>
                <div class="dash-modal-body">
                    ${isEditMode ? `<div style="background: #e0f2fe; color: #0369a1; padding: 10px 14px; border-radius: 8px; font-size: 12px; margin-bottom: 14px; font-weight: 700;"><i class="fa-solid fa-pen-to-square"></i> You previously reviewed this tutor. Updating will modify your rating and feedback.</div>` : ''}
                    
                    <form onsubmit="submitStudentReviewFromModal(event)">
                        ${acceptedTutors.length > 1 ? `
                            <div class="filter-item" style="margin-bottom: 14px;">
                                <label style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">Select Tutor to Review</label>
                                <select id="reviewTutorSelect" onchange="onReviewTutorSelected(this.value)" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px; background: #ffffff;">
                                    ${tutorOptionsHTML}
                                </select>
                            </div>
                        ` : `
                            <input type="hidden" id="reviewTutorSelect" value="${selectedTutorId}">
                        `}

                        <div class="filter-item" style="margin-bottom: 16px; text-align: center;">
                            <label style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; display: block; margin-bottom: 8px;">Tap Stars to Select Rating (1-5)</label>
                            <div class="star-rating-picker" id="starPicker" style="font-size: 28px; color: #cbd5e1; cursor: pointer; display: inline-flex; gap: 8px;">
                                <i class="fa-solid fa-star ${existingRating >= 1 ? 'active' : ''}" style="${existingRating >= 1 ? 'color: #f59e0b;' : ''}" onclick="setRating(1)"></i>
                                <i class="fa-solid fa-star ${existingRating >= 2 ? 'active' : ''}" style="${existingRating >= 2 ? 'color: #f59e0b;' : ''}" onclick="setRating(2)"></i>
                                <i class="fa-solid fa-star ${existingRating >= 3 ? 'active' : ''}" style="${existingRating >= 3 ? 'color: #f59e0b;' : ''}" onclick="setRating(3)"></i>
                                <i class="fa-solid fa-star ${existingRating >= 4 ? 'active' : ''}" style="${existingRating >= 4 ? 'color: #f59e0b;' : ''}" onclick="setRating(4)"></i>
                                <i class="fa-solid fa-star ${existingRating >= 5 ? 'active' : ''}" style="${existingRating >= 5 ? 'color: #f59e0b;' : ''}" onclick="setRating(5)"></i>
                            </div>
                            <input type="hidden" id="selectedStarRating" value="${existingRating}">
                        </div>

                        <div class="filter-item" style="margin-bottom: 18px;">
                            <label style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">Written Review & Feedback</label>
                            <textarea id="reviewCommentInput" placeholder="Share details of your learning experience, tutor teaching style, and progress..." style="width: 100%; height: 90px; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px;" required>${existingComment}</textarea>
                        </div>

                        <div id="reviewModalAlert"></div>

                        <div class="dash-modal-footer" style="padding: 0; background: transparent; border: none; margin-top: 10px;">
                            <button type="button" class="dash-btn dash-btn-outline" onclick="closeModal('reviewModal')">Cancel</button>
                            <button type="submit" id="submitReviewBtn" class="dash-btn dash-btn-primary"><i class="fa-solid fa-paper-plane"></i> ${isEditMode ? 'Update Review' : 'Submit Review'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    removeModal('reviewModal');
    document.body.insertAdjacentHTML('beforeend', modalHTML);
};

window.onReviewTutorSelected = async function(tutorProfileId) {
    if (!tutorProfileId) return;
    try {
        const revRes = await fetch(`/api/student/review/${tutorProfileId}`);
        const revData = await revRes.json();
        const inputRating = document.getElementById("selectedStarRating");
        const inputComment = document.getElementById("reviewCommentInput");
        const submitBtn = document.getElementById("submitReviewBtn");

        if (revData.success && revData.review) {
            setRating(revData.review.rating || 5);
            if (inputComment) inputComment.value = revData.review.comment || "";
            if (submitBtn) submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Update Review`;
        } else {
            setRating(5);
            if (inputComment) inputComment.value = "";
            if (submitBtn) submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Submit Review`;
        }
    } catch (err) {
        console.error("Error switching tutor review:", err);
    }
};

window.setRating = function(stars) {
    const picker = document.getElementById('starPicker');
    const input = document.getElementById('selectedStarRating');
    if (input) input.value = stars;
    if (!picker) return;

    picker.querySelectorAll('i').forEach((icon, idx) => {
        if (idx < stars) {
            icon.classList.add('active');
            icon.style.color = '#f59e0b';
        } else {
            icon.classList.remove('active');
            icon.style.color = '#cbd5e1';
        }
    });
};

window.submitStudentReviewFromModal = async function(e) {
    e.preventDefault();
    const tutorProfileId = document.getElementById("reviewTutorSelect")?.value;
    const rating = Number(document.getElementById("selectedStarRating")?.value || 5);
    const comment = document.getElementById("reviewCommentInput")?.value.trim();
    const submitBtn = document.getElementById("submitReviewBtn");
    const alertDiv = document.getElementById("reviewModalAlert");

    if (!tutorProfileId || !comment) {
        if (alertDiv) alertDiv.innerHTML = `<div class="login-alert login-alert-error" style="margin-bottom: 12px;"><i class="fa-solid fa-triangle-exclamation"></i> <span>Please provide a valid review comment.</span></div>`;
        return;
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Submitting...`;
    }

    try {
        const response = await fetch("/api/student/review", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tutorProfileId, rating, comment }),
        });
        const data = await response.json();

        if (data.success) {
            closeModal('reviewModal');
            showToast(`✅ ${data.message}`);
            if (typeof loadStudentDashboardData === 'function') loadStudentDashboardData();
            if (typeof loadTutorDashboardData === 'function') loadTutorDashboardData();
            if (typeof renderTutorGrid === 'function') renderTutorGrid();
        } else {
            if (alertDiv) {
                alertDiv.innerHTML = `<div class="login-alert login-alert-error" style="margin-bottom: 12px;"><i class="fa-solid fa-triangle-exclamation"></i> <span>${data.message}</span></div>`;
            } else {
                showToast(`❌ ${data.message}`);
            }
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Submit Review`;
            }
        }
    } catch (err) {
        console.error("Submit Review Error:", err);
        showToast("❌ Network error submitting review.");
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Submit Review`;
        }
    }
};

window.submitTutorReview = function(e, tutorName) {
    submitStudentReviewFromModal(e);
};

window.ACTIVE_PARENT_CHAT_RECIPIENT_ID = null;

window.openChatDrawer = async function(tutorUserId, tutorName) {
    if (!tutorUserId) {
        if (typeof showToast === 'function') showToast("❌ Invalid tutor selected.");
        return;
    }
    
    window.ACTIVE_PARENT_CHAT_RECIPIENT_ID = tutorUserId;

    let drawer = document.getElementById('chatDrawer');
    const initials = (tutorName || 'Tutor').substring(0, 2).toUpperCase();

    if (!drawer) {
        const drawerHTML = `
            <div class="chat-drawer open" id="chatDrawer">
                <div class="chat-header">
                    <div class="chat-user-details">
                        <div class="chat-user-avatar" id="chatTutorAvatar">${initials}</div>
                        <div>
                            <strong id="chatTutorName">${tutorName || 'Assigned Educator'}</strong>
                            <div class="chat-user-status"><i class="fa-solid fa-circle" style="color: #22c55e;"></i> Online &bull; Active Educator</div>
                        </div>
                    </div>
                    <button onclick="closeChatDrawer()" class="chat-close-btn">&times;</button>
                </div>
                <div class="chat-messages" id="chatMessages">
                    <div style="text-align: center; padding: 20px; color: #94a3b8;"><i class="fa-solid fa-spinner fa-spin"></i> Loading conversation history...</div>
                </div>
                <div class="chat-input-area">
                    <input type="text" id="chatInput" placeholder="Type a message..." onkeypress="handleChatEnter(event)">
                    <button class="chat-send-btn" id="chatSendBtn" onclick="sendChatMessage()"><i class="fa-solid fa-paper-plane"></i></button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', drawerHTML);
    } else {
        const nameEl = document.getElementById('chatTutorName');
        const avatarEl = document.getElementById('chatTutorAvatar');
        if (nameEl) nameEl.innerText = tutorName || 'Assigned Educator';
        if (avatarEl) avatarEl.innerText = initials;
        drawer.classList.add('open');
    }

    // Load persisted message history from MongoDB
    await loadParentChatMessageHistory(tutorUserId);
};

window.loadParentChatMessageHistory = async function(tutorUserId) {
    const msgContainer = document.getElementById('chatMessages');
    if (!msgContainer) return;

    msgContainer.innerHTML = `<div style="text-align: center; padding: 20px; color: #94a3b8;"><i class="fa-solid fa-spinner fa-spin"></i> Loading conversation history...</div>`;

    try {
        const res = await fetch(`/api/chat/messages/${tutorUserId}`);
        const data = await res.json();

        if (res.ok && data.success && Array.from(data.messages || []).length > 0) {
            msgContainer.innerHTML = data.messages.map(m => {
                const isMe = (m.sender._id || m.sender) === (window.CURRENT_USER_ID || (window.user ? window.user.id : null)) || (typeof m.sender === 'object' && m.sender.role === 'parent');
                const timeStr = m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                return `
                    <div class="chat-msg ${isMe ? 'user' : 'tutor'}" style="align-self: ${isMe ? 'flex-end' : 'flex-start'};">
                        ${m.content || (m.fileName ? `📎 ${m.fileName}` : '')}
                        ${timeStr ? `<span style="display: block; font-size: 9px; opacity: 0.75; margin-top: 2px; text-align: right;">${timeStr}</span>` : ''}
                    </div>
                `;
            }).join('');
        } else {
            msgContainer.innerHTML = `<div style="text-align: center; padding: 30px; color: #94a3b8; font-size: 13px;"><i class="fa-solid fa-comments" style="font-size: 24px; margin-bottom: 6px; display: block;"></i> No prior messages. Start the conversation!</div>`;
        }

        msgContainer.scrollTop = msgContainer.scrollHeight;

        // Mark messages as read
        fetch(`/api/chat/seen/${tutorUserId}`, { method: 'PATCH' }).catch(() => {});
    } catch (err) {
        console.error("Load Chat Messages Error:", err);
        msgContainer.innerHTML = `<div style="text-align: center; padding: 20px; color: #ef4444; font-size: 13px;">Error loading messages. Please try again.</div>`;
    }
};

window.closeChatDrawer = function() {
    const drawer = document.getElementById('chatDrawer');
    if (drawer) drawer.classList.remove('open');
    window.ACTIVE_PARENT_CHAT_RECIPIENT_ID = null;
};

window.handleChatEnter = function(e) { if (e.key === 'Enter') sendChatMessage(); };

window.sendChatMessage = async function() {
    const input = document.getElementById('chatInput');
    const msgContainer = document.getElementById('chatMessages');
    const recipientId = window.ACTIVE_PARENT_CHAT_RECIPIENT_ID;

    if (!input || !input.value.trim() || !msgContainer || !recipientId) return;

    const content = input.value.trim();
    input.value = '';

    // Append locally immediately for instant feedback
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    msgContainer.insertAdjacentHTML('beforeend', `
        <div class="chat-msg user" style="align-self: flex-end;">
            ${content}
            <span style="display: block; font-size: 9px; opacity: 0.75; margin-top: 2px; text-align: right;">${timeStr}</span>
        </div>
    `);
    msgContainer.scrollTop = msgContainer.scrollHeight;

    try {
        const res = await fetch("/api/chat/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ recipientId, content })
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
            if (typeof showToast === 'function') showToast(`❌ ${data.message || "Failed to send message."}`);
        } else {
            // Emit real-time Socket.IO event if socket connected
            if (typeof socket !== 'undefined' && socket) {
                socket.emit("sendMessage", data.data);
            }
        }
    } catch (err) {
        console.error("Send Chat Message Error:", err);
        if (typeof showToast === 'function') showToast("❌ Network error sending message.");
    }
};

// Global real-time socket message listener
if (typeof socket !== 'undefined' && socket) {
    socket.on("receiveMessage", (message) => {
        if (window.ACTIVE_PARENT_CHAT_RECIPIENT_ID && message && (message.sender._id || message.sender) === window.ACTIVE_PARENT_CHAT_RECIPIENT_ID) {
            const msgContainer = document.getElementById('chatMessages');
            if (msgContainer) {
                const timeStr = message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                msgContainer.insertAdjacentHTML('beforeend', `
                    <div class="chat-msg tutor" style="align-self: flex-start;">
                        ${message.content || (message.fileName ? `📎 ${message.fileName}` : '')}
                        ${timeStr ? `<span style="display: block; font-size: 9px; opacity: 0.75; margin-top: 2px; text-align: right;">${timeStr}</span>` : ''}
                    </div>
                `);
                msgContainer.scrollTop = msgContainer.scrollHeight;
                fetch(`/api/chat/seen/${window.ACTIVE_PARENT_CHAT_RECIPIENT_ID}`, { method: 'PATCH' }).catch(() => {});
            }
        }
    });
}

window.openModal = function(modalId) {
    const m = document.getElementById(modalId);
    if (m) {
        m.classList.add('open');
        m.style.display = 'flex';
    }
};

window.closeModal = function(modalId) {
    const m = document.getElementById(modalId);
    if (m) {
        m.classList.remove('open');
        m.style.display = 'none';
    }
};

function removeModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.remove();
}

window.showToast = function(message) {
    let toast = document.getElementById('dash-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'dash-toast';
        toast.style.position = 'fixed';
        toast.style.bottom = '24px';
        toast.style.right = '24px';
        toast.style.padding = '14px 22px';
        toast.style.borderRadius = '10px';
        toast.style.background = 'var(--primary)';
        toast.style.color = '#ffffff';
        toast.style.fontWeight = '700';
        toast.style.fontSize = '14px';
        toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
        toast.style.zIndex = '9999';
        toast.style.transition = 'all 0.3s ease';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--accent); margin-right: 8px;"></i> ${message}`;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
    }, 3200);
};

/* =========================================================
   NEW INTERACTIVE FEATURE HANDLERS
   ========================================================= */

// Video Call Handler (Dispatches real-time Socket.IO call invitation & redirects to WebRTC room)
window.openVideoCallModal = async function(peerName, bookingId) {
    let targetBookingId = bookingId;
    const isTutor = window.location.pathname.includes("tutor");
    
    if (!targetBookingId) {
        try {
            const endpoint = isTutor ? "/api/tutor/booking-requests" : "/api/student/bookings";
            const res = await fetch(endpoint);
            const data = await res.json();
            
            const bookings = isTutor ? data.requests : data.bookings;
            let acceptedBooking = null;

            if (bookings && Array.isArray(bookings)) {
                if (peerName) {
                    acceptedBooking = bookings.find(b => 
                        b.status === "Accepted" && 
                        ((b.student && b.student.name && b.student.name.toLowerCase().includes(peerName.toLowerCase())) ||
                         (b.tutor && b.tutor.name && b.tutor.name.toLowerCase().includes(peerName.toLowerCase())) ||
                         (b.tutorProfile && b.tutorProfile.user && b.tutorProfile.user.name && b.tutorProfile.user.name.toLowerCase().includes(peerName.toLowerCase())))
                    );
                }
                if (!acceptedBooking) {
                    acceptedBooking = bookings.find(b => b.status === "Accepted");
                }
            }
            if (acceptedBooking && acceptedBooking._id) {
                targetBookingId = acceptedBooking._id;
            }
        } catch (err) {
            console.error("Video Call Check Error:", err);
        }
    }

    if (targetBookingId) {
        if (typeof socket !== 'undefined' && socket) {
            const callerId = (typeof CURRENT_USER_ID !== 'undefined' ? CURRENT_USER_ID : '');
            const callerName = (typeof CURRENT_STUDENT_NAME !== 'undefined' ? CURRENT_STUDENT_NAME : (typeof CURRENT_TUTOR_NAME !== 'undefined' ? CURRENT_TUTOR_NAME : 'User'));
            socket.emit("initiate-video-call", {
                bookingId: targetBookingId,
                callerId,
                callerName,
                callerRole: isTutor ? 'Tutor' : 'Student'
            });
        }
        window.location.href = `/video-call/${targetBookingId}`;
    } else {
        const msg = `Video Call Notice: WebRTC video calling requires an ACCEPTED booking request with ${peerName || 'your educator'}. Please request or accept a tuition booking first.`;
        if (typeof showToast === 'function') {
            showToast(msg);
        } else {
            alert(msg);
        }
    }
};

window.toggleMedia = function(btnId, activeIcon, inactiveIcon) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const icon = btn.querySelector('i');
    if (icon.classList.contains(activeIcon)) {
        icon.className = `fa-solid ${inactiveIcon}`;
        btn.style.background = '#ef4444';
        showToast('Muted media input');
    } else {
        icon.className = `fa-solid ${activeIcon}`;
        btn.style.background = '#334155';
        showToast('Unmuted media input');
    }
};

// Dynamic Certificate Download System Integration
window.openStudentCertificatesModal = async function() {
    let modal = document.getElementById("studentCertificatesModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "studentCertificatesModal";
        modal.className = "dash-modal open";
        modal.style.display = "flex";
        modal.innerHTML = `
            <div class="dash-modal-content" style="max-width: 600px; padding: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">
                    <h3 style="margin: 0; color: #0f2a4a; font-size: 18px; font-weight: 800; display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-award" style="color: #b45309;"></i> Earned Course Completion Certificates
                    </h3>
                    <button type="button" style="background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer;" onclick="document.getElementById('studentCertificatesModal').remove()">&times;</button>
                </div>
                <div id="studentCertificatesListContainer" style="max-height: 400px; overflow-y: auto;">
                    <div style="text-align: center; padding: 30px; color: #64748b;">
                        <i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; color: #0284c7; margin-bottom: 8px;"></i>
                        <p style="margin: 0;">Fetching your verified certificates from database...</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    } else {
        modal.classList.add("open");
        modal.style.display = "flex";
    }

    const container = document.getElementById("studentCertificatesListContainer");
    if (!container) return;

    try {
        const res = await fetch("/api/student/certificates");
        const data = await res.json();

        if (!data.success || !data.certificates || data.certificates.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;">
                    <i class="fa-solid fa-award" style="font-size: 44px; color: #94a3b8; margin-bottom: 12px; display: block;"></i>
                    <h4 style="font-size: 15px; font-weight: 700; color: #1e293b; margin: 0 0 6px 0;">No certificates available yet. Complete your course to earn certificates.</h4>
                    <p style="font-size: 12px; color: #64748b; margin: 0;">Once your assigned tutor completes your course and issues your certificate, it will appear here for PDF download.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = data.certificates.map(cert => {
            const tutorName = cert.tutor ? cert.tutor.name : "Verified Educator";
            const dateStr = cert.issueDate ? new Date(cert.issueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A";

            return `
                <div style="display: flex; flex-direction: column; justify-content: space-between; padding: 16px; border: 1px solid #e2e8f0; border-radius: 10px; background: #ffffff; margin-bottom: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                        <div>
                            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #b45309; letter-spacing: 0.5px; display: block;">Official Completion Certificate</span>
                            <h4 style="margin: 2px 0 4px 0; font-size: 16px; font-weight: 800; color: #0f2a4a;">${cert.courseName}</h4>
                            <p style="font-size: 12px; color: #475569; margin: 0;">Instructor: <b>${tutorName}</b> &bull; Date: <b>${dateStr}</b></p>
                        </div>
                        <span style="background: #e0f2fe; color: #0369a1; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 6px;">ID: ${cert.certificateId}</span>
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; border-top: 1px solid #f1f5f9; padding-top: 10px;">
                        <a href="/api/student/certificates/download/${cert._id}" target="_blank" class="dash-btn dash-btn-primary" style="font-size: 12px; padding: 6px 14px; text-decoration: none;">
                            <i class="fa-solid fa-file-pdf"></i> Download PDF
                        </a>
                    </div>
                </div>
            `;
        }).join("");
    } catch (err) {
        console.error("Fetch Certificates Error:", err);
        container.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #dc2626;">
                Failed to load certificates. Please try again.
            </div>
        `;
    }
};

// Parent Supervision Certificate Viewer
window.openParentCertificatesModal = async function() {
    let modal = document.getElementById("parentCertificatesModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "parentCertificatesModal";
        modal.className = "dash-modal open";
        modal.style.display = "flex";
        modal.innerHTML = `
            <div class="dash-modal-content" style="max-width: 650px; padding: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">
                    <h3 style="margin: 0; color: #0f2a4a; font-size: 18px; font-weight: 800; display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-award" style="color: #b45309;"></i> Linked Children's Earned Certificates
                    </h3>
                    <button type="button" style="background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer;" onclick="document.getElementById('parentCertificatesModal').remove()">&times;</button>
                </div>
                <div id="parentCertificatesListContainer" style="max-height: 420px; overflow-y: auto;">
                    <div style="text-align: center; padding: 30px; color: #64748b;">
                        <i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; color: #7e22ce; margin-bottom: 8px;"></i>
                        <p style="margin: 0;">Fetching certificates for linked children from database...</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    } else {
        modal.classList.add("open");
        modal.style.display = "flex";
    }

    const container = document.getElementById("parentCertificatesListContainer");
    if (!container) return;

    try {
        const res = await fetch("/api/parent/child-certificates");
        const data = await res.json();

        if (!data.success || !data.certificates || data.certificates.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;">
                    <i class="fa-solid fa-award" style="font-size: 44px; color: #94a3b8; margin-bottom: 12px; display: block;"></i>
                    <h4 style="font-size: 15px; font-weight: 700; color: #1e293b; margin: 0 0 6px 0;">No certificates found for linked children.</h4>
                    <p style="font-size: 12px; color: #64748b; margin: 0;">When your child completes a course and their assigned tutor or admin issues a certificate, it will appear here for download.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = data.certificates.map(cert => {
            const studentName = cert.student ? cert.student.name : "Student";
            const tutorName = cert.tutor ? cert.tutor.name : "Verified Educator";
            const dateStr = cert.issueDate ? new Date(cert.issueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A";

            return `
                <div style="display: flex; flex-direction: column; justify-content: space-between; padding: 16px; border: 1px solid #e2e8f0; border-radius: 10px; background: #ffffff; margin-bottom: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                        <div>
                            <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #7e22ce; letter-spacing: 0.5px; display: block; margin-bottom: 2px;">
                                <i class="fa-solid fa-child"></i> Student: ${studentName}
                            </span>
                            <h4 style="margin: 2px 0 4px 0; font-size: 16px; font-weight: 800; color: #0f2a4a;">${cert.courseName}</h4>
                            <p style="font-size: 12px; color: #475569; margin: 0;">Instructor: <b>${tutorName}</b> &bull; Date: <b>${dateStr}</b></p>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                            <span style="background: #e0f2fe; color: #0369a1; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 6px;">ID: ${cert.certificateId}</span>
                            <span style="background: #dcfce7; color: #15803d; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;"><i class="fa-solid fa-circle-check"></i> Approved</span>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; border-top: 1px solid #f1f5f9; padding-top: 10px;">
                        <a href="/api/student/certificates/download/${cert._id}" target="_blank" class="dash-btn dash-btn-primary" style="font-size: 12px; padding: 6px 14px; text-decoration: none; background: #7e22ce;">
                            <i class="fa-solid fa-file-pdf"></i> Download PDF
                        </a>
                    </div>
                </div>
            `;
        }).join("");
    } catch (err) {
        console.error("Fetch Parent Certificates Error:", err);
        container.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #dc2626;">
                Failed to load certificates. Please try again.
            </div>
        `;
    }
};

window.openCertificateModal = function() {
    if (document.querySelector(".badge-parent")) {
        return window.openParentCertificatesModal();
    }
    return window.openStudentCertificatesModal();
};

// Promo Code Validator & Coupon Engine Integration
window.submitPromoCouponCode = async function() {
    const codeInput = document.getElementById('promoCodeInput');
    const code = codeInput ? codeInput.value.trim() : '';

    if (!code) {
        showToast("⚠️ Please enter a coupon code.");
        return;
    }

    try {
        const res = await fetch("/api/coupon/apply", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: code, originalAmount: 1000 })
        });
        const data = await res.json();
        if (data.success) {
            showToast(`🎉 ${data.message}`);
            if (typeof loadStudentDashboardData === "function") loadStudentDashboardData();
        } else {
            showToast(`❌ ${data.message || "Invalid or expired coupon code."}`);
        }
    } catch (err) {
        console.error("Apply Coupon Error:", err);
        showToast("❌ Coupon verification error. Please try again.");
    }
};

// Admin User Directory Filter Handler
window.filterUserDirectory = function() {
    const input = document.getElementById('userSearchInput');
    if (!input) return;
    const query = input.value.toLowerCase().trim();
    const rows = document.querySelectorAll('#usersTable tbody tr');
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
    });
};

// Admin Bulk Announcement Handler
window.openAnnouncementModal = function() {
    let modal = document.getElementById('announceModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'announceModal';
        modal.className = 'dash-modal open';
        modal.innerHTML = `
            <div class="dash-modal-content" style="max-width: 550px;">
                <h3 style="margin-top: 0; color: #0f2a4a;"><i class="fa-solid fa-bullhorn" style="color: #b45309;"></i> Send Platform Announcement</h3>
                <p style="font-size: 13px; color: #64748b;">Dispatch instant push notifications and email alerts to platform user groups.</p>
                <div style="margin-bottom: 14px;">
                    <label style="display: block; font-size: 12px; font-weight: 700; color: #0f2a4a; margin-bottom: 4px;">Target Role Audience</label>
                    <select id="annAudience" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1;">
                        <option value="all">All Users (Students, Tutors & Parents)</option>
                        <option value="tutors">Tutors Only</option>
                        <option value="students">Students Only</option>
                        <option value="parents">Parents Only</option>
                    </select>
                </div>
                <div style="margin-bottom: 14px;">
                    <label style="display: block; font-size: 12px; font-weight: 700; color: #0f2a4a; margin-bottom: 4px;">Subject</label>
                    <input type="text" id="annSubject" placeholder="e.g. Scheduled Platform Maintenance & New AI Features" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1;">
                </div>
                <div style="margin-bottom: 18px;">
                    <label style="display: block; font-size: 12px; font-weight: 700; color: #0f2a4a; margin-bottom: 4px;">Announcement Body</label>
                    <textarea id="annBody" rows="4" placeholder="Enter announcement content..." style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1;"></textarea>
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 10px;">
                    <button class="dash-btn dash-btn-outline" onclick="closeModal('announceModal')">Cancel</button>
                    <button class="dash-btn dash-btn-primary" style="background: #b45309;" onclick="showToast('Broadcast Announcement sent to target audience!'); closeModal('announceModal');"><i class="fa-solid fa-paper-plane"></i> Broadcast Now</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    } else {
        modal.classList.add('open');
        modal.style.display = 'flex';
    }
};

// DOM CONTENT LOADED INITIALIZER
document.addEventListener("DOMContentLoaded", async function () {
    try {
        const response = await fetch("/api/tutor/all");
        const resData = await response.json();
        if (resData.success && resData.tutors && resData.tutors.length > 0) {
            const mongoTutors = resData.tutors.map(t => {
                const name = t.user ? t.user.name : "Registered Tutor";
                const initials = name.split(" ").map(n => n[0]).join("").toUpperCase();
                return {
                    id: t._id,
                    name: name,
                    title: `${t.qualification} • ${t.experience || 1}+ Yrs Exp`,
                    subject: t.subjects ? t.subjects.join(", ") : "General",
                    grade: t.classes ? t.classes.join(", ") : "All Grades",
                    location: t.location || "Online",
                    experience: `${t.experience || 1}+ yrs`,
                    fee: t.fee || 500,
                    rating: t.rating || 5.0,
                    language: "English",
                    initials: initials,
                    bio: t.about || `Experienced tutor specializing in ${t.subjects ? t.subjects.join(", ") : "academics"}.`,
                    reviewsCount: t.totalReviews || 0,
                    availableSlots: ["Today 4:00 PM", "Tomorrow 6:00 PM"]
                };
            });
            window.TUTORS_DATA = [...mongoTutors, ...window.TUTORS_DATA];
        }
    } catch (e) {
        console.log("Could not fetch tutors from database:", e);
    }

    if (typeof renderTutorGrid === 'function') {
        renderTutorGrid();
    }
    if (typeof renderFavoritesGrid === 'function') {
        renderFavoritesGrid();
    }

    // Connect Tutor Profile Edit Form to MongoDB
    const tutorProfileForm = document.getElementById("tutorProfileForm");
    if (tutorProfileForm) {
        tutorProfileForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(tutorProfileForm);
            const payload = {};
            formData.forEach((val, key) => payload[key] = val);

            try {
                const response = await fetch("/api/tutor/profile", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                const data = await response.json();
                if (data.success) {
                    showToast("✅ " + data.message);
                } else {
                    showToast("❌ " + (data.message || "Failed to update profile"));
                }
            } catch (err) {
                console.error(err);
                showToast("❌ Error updating profile in database.");
            }
        });
    }

    // Auto-load parent supervision dashboard data
    if (document.querySelector(".badge-parent") || document.getElementById("parentActiveChildDisplay")) {
        window.loadParentDashboardData();
    }
});

// Override Wallet Topup to write to MongoDB
window.addWalletBalance = async function(amount) {
    try {
        const response = await fetch("/api/student/wallet/topup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount }),
        });
        const data = await response.json();
        if (data.success) {
            const walletEl = document.getElementById('walletBalanceDisplay');
            if (walletEl) {
                walletEl.innerText = `₹${data.walletBalance.toFixed(2)}`;
            }
            showToast(`✅ ${data.message}`);
        } else {
            showToast(`❌ ${data.message || "Wallet topup failed."}`);
        }
    } catch (err) {
        console.error(err);
        showToast("❌ Wallet topup error. Please try again.");
    }
};

// Admin Approve / Delete Tutor Handlers connected to MongoDB
window.adminVerifyTutor = async function(tutorProfileId) {
    try {
        const response = await fetch(`/api/admin/tutor/${tutorProfileId}/verify`, {
            method: "PATCH",
        });
        const data = await response.json();
        if (data.success) {
            showToast(`✅ ${data.message}`);
            setTimeout(() => window.location.reload(), 1000);
        } else {
            showToast(`❌ ${data.message}`);
        }
    } catch (err) {
        console.error(err);
        showToast("❌ Verification request failed.");
    }
};

window.adminDeleteTutor = async function(tutorProfileId) {
    const confirmed = window.showCustomConfirm
        ? await window.showCustomConfirm("Are you sure you want to delete/reject this tutor profile?", "Delete Tutor", "Delete", "Cancel")
        : confirm("Are you sure you want to delete/reject this tutor profile?");
    if (!confirmed) return;
    try {
        const response = await fetch(`/api/admin/tutor/${tutorProfileId}`, {
            method: "DELETE",
        });
        const data = await response.json();
        if (data.success) {
            showToast(`✅ ${data.message}`);
            setTimeout(() => window.location.reload(), 1000);
        } else {
            showToast(`❌ ${data.message}`);
        }
    } catch (err) {
        console.error(err);
        showToast("❌ Delete request failed.");
    }
};

// Parent Add Child Profile connected to MongoDB
window.parentAddChild = async function(name, grade, school, subjectsNeeded) {
    try {
        const response = await fetch("/api/parent/child", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, grade, school, subjectsNeeded }),
        });
        const data = await response.json();
        if (data.success) {
            showToast(`✅ ${data.message}`);
            setTimeout(() => window.location.reload(), 1000);
        } else {
            showToast(`❌ ${data.message}`);
        }
    } catch (err) {
        console.error(err);
        showToast("❌ Failed to add child profile.");
    }
};

// Student Submit Review connected to MongoDB
window.submitStudentReview = async function(tutorProfileId, rating, comment) {
    try {
        const response = await fetch("/api/student/review", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tutorProfileId, rating, comment }),
        });
        const data = await response.json();
        if (data.success) {
            showToast(`✅ ${data.message}`);
        } else {
            showToast(`❌ ${data.message}`);
        }
    } catch (err) {
        console.error(err);
        showToast("❌ Failed to submit review.");
    }
};

// DYNAMIC DASHBOARD DATA LOADERS CONNECTED TO MONGODB
window.loadTutorDashboardData = async function() {
    try {
        const statsRes = await fetch("/api/tutor/dashboard-stats");
        const statsData = await statsRes.json();

        if (statsData.success && statsData.stats) {
            const s = statsData.stats;
            const availableBal = s.availableBalance !== undefined ? s.availableBalance : s.totalEarnings;

            const earningsEl = document.getElementById("tutorNetEarnings");
            if (earningsEl) earningsEl.innerText = `₹${availableBal.toLocaleString('en-IN')}.00`;

            const cardBalEl = document.getElementById("tutorAvailableBalanceCard");
            if (cardBalEl) cardBalEl.innerText = `₹${availableBal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

            const studentsEl = document.getElementById("tutorActiveStudentsCount");
            if (studentsEl) studentsEl.innerText = `${s.activeStudentCount} Students`;

            const requestsEl = document.getElementById("tutorPendingRequestsCount");
            if (requestsEl) requestsEl.innerText = `${s.pendingRequestsCount} Requests`;

            const ratingEl = document.getElementById("tutorRatingDisplay");
            if (ratingEl) ratingEl.innerText = `${s.rating} (${s.totalReviews || 0} reviews)`;

            // Render Payout Requests History Container
            const historyContainer = document.getElementById("tutorPayoutHistoryContainer");
            if (historyContainer) {
                const history = statsData.payoutHistory || [];
                if (history.length === 0) {
                    historyContainer.innerHTML = `<div style="text-align: center; color: #94a3b8; padding: 16px; font-size: 13px;">No payout requests submitted yet.</div>`;
                } else {
                    historyContainer.innerHTML = history.map(p => {
                        const dateStr = new Date(p.requestedAt || p.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
                        let statusPill = `<span style="background: #fef3c7; color: #b45309; font-size: 11px; font-weight: bold; padding: 2px 8px; border-radius: 12px;"><i class="fa-solid fa-clock"></i> Pending</span>`;
                        if (p.status === "Approved") {
                            statusPill = `<span style="background: #dcfce7; color: #15803d; font-size: 11px; font-weight: bold; padding: 2px 8px; border-radius: 12px;"><i class="fa-solid fa-check"></i> Approved</span>`;
                        } else if (p.status === "Rejected") {
                            statusPill = `<span style="background: #fee2e2; color: #dc2626; font-size: 11px; font-weight: bold; padding: 2px 8px; border-radius: 12px;"><i class="fa-solid fa-xmark"></i> Rejected</span>`;
                        }

                        return `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 8px;">
                                <div>
                                    <strong style="font-size: 14px; color: #0f172a;">₹${p.amount.toLocaleString('en-IN')}</strong>
                                    <span style="font-size: 11px; color: #64748b; display: block; margin-top: 2px;">Requested on ${dateStr}</span>
                                </div>
                                <div>${statusPill}</div>
                            </div>
                        `;
                    }).join("");
                }
            }

            const reviewsContainer = document.getElementById("tutorDashboardReviewsContainer");
            if (reviewsContainer && statsData.reviews) {
                if (statsData.reviews.length === 0) {
                    reviewsContainer.innerHTML = `<div style="text-align: center; color: #94a3b8; padding: 20px; font-size: 13px;">No student reviews submitted yet.</div>`;
                } else {
                    reviewsContainer.innerHTML = statsData.reviews.map(r => {
                        const studentName = r.student ? (r.student.name || r.student.email) : "Student";
                        const stars = '★'.repeat(r.rating || 5);
                        const dateStr = new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
                        return `
                            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; margin-bottom: 10px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                    <strong style="font-size: 13px; color: #0f172a;">${studentName}</strong>
                                    <span style="color: #f59e0b; font-weight: bold; font-size: 12px;">${stars} ${r.rating}.0</span>
                                </div>
                                <p style="font-size: 12px; color: #475569; margin: 0; line-height: 1.4;">${r.comment}</p>
                                <span style="font-size: 10px; color: #94a3b8; display: block; margin-top: 4px;">${dateStr}</span>
                            </div>
                        `;
                    }).join("");
                }
            }
        }

        const reqRes = await fetch("/api/tutor/booking-requests");
        const reqData = await reqRes.json();

        if (reqData.success && reqData.requests) {
            const pendingList = reqData.requests.filter(r => r.status === "Pending");
            const acceptedList = reqData.requests.filter(r => r.status === "Accepted");

            // Render Pending Booking Requests
            const container = document.getElementById("tutorPendingRequestsTableBody");
            if (container) {
                if (pendingList.length === 0) {
                    container.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 20px;">No pending booking requests.</td></tr>`;
                } else {
                    container.innerHTML = pendingList.map(r => {
                        const sName = r.student ? (r.student.name || r.student.email) : "Student";
                        const sub = r.tutorProfile && r.tutorProfile.subjects ? r.tutorProfile.subjects.join(", ") : "Tuition Class";
                        const dateStr = new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
                        return `
                            <tr id="${r._id}">
                                <td><strong>${sName}</strong></td>
                                <td>${sub}</td>
                                <td>${dateStr} &bull; Demo Request</td>
                                <td><span class="status-pill status-pending" style="background: #fef3c7; color: #b45309; padding: 4px 10px; border-radius: 20px; font-weight: bold; font-size: 12px;">Pending</span></td>
                                <td>
                                    <button class="dash-btn dash-btn-primary" style="padding: 4px 10px; font-size: 12px; background: #16a34a;" onclick="acceptBookingRequest('${r._id}', '${sName.replace(/'/g, "\\'")}')">Accept</button>
                                    <button class="dash-btn dash-btn-outline" style="padding: 4px 10px; font-size: 12px; color: #dc2626; border-color: #fca5a5;" onclick="declineBookingRequest('${r._id}', '${sName.replace(/'/g, "\\'")}')">Decline</button>
                                </td>
                            </tr>
                        `;
                    }).join("");
                }
            }

            // Render Today's Live Teaching Schedule (Overview Tab)
            const scheduleContainer = document.getElementById("tutorTodayScheduleContainer");
            if (scheduleContainer) {
                if (acceptedList.length === 0) {
                    scheduleContainer.innerHTML = `
                        <div style="padding: 20px; text-align: center; color: #64748b; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;">
                            <i class="fa-solid fa-calendar-xmark" style="font-size: 24px; color: #94a3b8; margin-bottom: 8px;"></i>
                            <p style="margin: 0; font-size: 13px;">No live classes scheduled for today. Accept student booking requests below to start WebRTC video calls.</p>
                        </div>
                    `;
                } else {
                    scheduleContainer.innerHTML = acceptedList.map(r => {
                        const sName = r.student ? (r.student.name || r.student.email) : "Student";
                        const sub = r.tutorProfile && r.tutorProfile.subjects ? r.tutorProfile.subjects.join(", ") : "Tuition Class";
                        const dateObj = new Date(r.createdAt || Date.now());
                        const day = dateObj.getDate().toString().padStart(2, '0');
                        const month = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                        return `
                            <div class="class-item" style="margin-bottom: 12px;">
                                <div class="class-info">
                                    <div class="class-date-badge">
                                        <span class="day">${day}</span>
                                        <span class="month">${month}</span>
                                    </div>
                                    <div class="class-details">
                                        <h4>${sub}</h4>
                                        <p><i class="fa-solid fa-user"></i> Student: ${sName} &bull; <i class="fa-solid fa-circle" style="color: #10b981; font-size: 8px;"></i> Active Enrolment</p>
                                    </div>
                                </div>
                                <div style="display: flex; gap: 8px;">
                                    <button class="dash-btn dash-btn-primary" style="background: #10b981; border-color: #059669;" onclick="openVideoCallModal('${sName.replace(/'/g, "\\'")}', '${r._id}')">
                                        <i class="fa-solid fa-video"></i> Join HD Video
                                    </button>
                                    <button class="dash-btn dash-btn-outline" onclick="openChatDrawer('${sName.replace(/'/g, "\\'")}')">
                                        <i class="fa-solid fa-comments"></i> Chat
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join("");
                }
            }

            // Render Teaching Sessions Table (Sessions Tab)
            const sessionsContainer = document.getElementById("tutorSessionsTableBody");
            if (sessionsContainer) {
                if (acceptedList.length === 0) {
                    sessionsContainer.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 20px;">No accepted student sessions found.</td></tr>`;
                } else {
                    sessionsContainer.innerHTML = acceptedList.map(r => {
                        const sName = r.student ? (r.student.name || r.student.email) : "Student";
                        const sub = r.tutorProfile && r.tutorProfile.subjects ? r.tutorProfile.subjects.join(", ") : "Tuition Class";
                        const dateStr = new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
                        return `
                            <tr>
                                <td><strong>${sName}</strong></td>
                                <td>${sub}</td>
                                <td>${dateStr} &bull; Live Session</td>
                                <td><span class="status-pill status-active" style="background: #dcfce7; color: #15803d; font-weight: bold; font-size: 12px;">Active Class</span></td>
                                <td>
                                    <button class="dash-btn dash-btn-primary" style="padding: 4px 10px; font-size: 12px; background: #10b981;" onclick="openVideoCallModal('${sName.replace(/'/g, "\\'")}', '${r._id}')">
                                        <i class="fa-solid fa-video"></i> Join HD Video
                                    </button>
                                    <button class="dash-btn dash-btn-outline" style="padding: 4px 10px; font-size: 12px;" onclick="openChatDrawer('${sName.replace(/'/g, "\\'")}')">
                                        Message
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join("");
                }
            }
        }
    } catch (err) {
        console.error("Load Tutor Dashboard Error:", err);
    }
};

window.loadStudentDashboardData = async function() {
    try {
        const statsRes = await fetch("/api/student/dashboard-stats");
        const statsData = await statsRes.json();

        if (statsData.success && statsData.stats) {
            const s = statsData.stats;
            const upcomingEl = document.getElementById("studentUpcomingCount");
            if (upcomingEl) upcomingEl.innerText = s.upcomingClassesCount;

            const tutorsEl = document.getElementById("studentActiveTutorsCount");
            if (tutorsEl) tutorsEl.innerText = `${s.activeTutorsCount} Tutors`;

            const walletEl = document.getElementById("studentWalletDisplay");
            if (walletEl) walletEl.innerText = `₹${s.walletBalance.toLocaleString('en-IN')}.00`;
        }

        // Load Referral Program Data & History
        try {
            const refRes = await fetch("/api/student/referrals");
            const refData = await refRes.json();
            if (refData.success) {
                const codeEl = document.getElementById("studentReferralCodeDisplay");
                if (codeEl) codeEl.innerText = refData.referralCode || "";

                const earnEl = document.getElementById("studentReferralEarningsDisplay");
                if (earnEl) earnEl.innerText = `₹${(refData.referralEarnings || 0).toLocaleString('en-IN')}.00`;

                const countEl = document.getElementById("studentReferralCountDisplay");
                if (countEl) countEl.innerText = `${refData.totalReferred || 0} Friends`;

                const listEl = document.getElementById("studentReferralHistoryList");
                if (listEl) {
                    if (!refData.referredUsers || refData.referredUsers.length === 0) {
                        listEl.innerHTML = `<div style="text-align: center; padding: 10px; color: #94a3b8; background: #f8fafc; border-radius: 8px;">No friends referred yet. Share your code to earn ₹100!</div>`;
                    } else {
                        listEl.innerHTML = refData.referredUsers.map(u => {
                            const dateStr = new Date(u.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
                            return `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: #f8fafc; border-radius: 8px; margin-bottom: 6px; border: 1px solid #e2e8f0;">
                                    <div>
                                        <strong style="color: #0f172a; font-size: 13px;">${u.name || u.email}</strong>
                                        <span style="font-size: 11px; color: #64748b; display: block;">Joined on ${dateStr}</span>
                                    </div>
                                    <span style="font-weight: 700; color: #16a34a; font-size: 12px;">+₹100 Earned</span>
                                </div>
                            `;
                        }).join("");
                    }
                }
            }
        } catch (rErr) {
            console.error("Error loading referral stats:", rErr);
        }

        const matRes = await fetch("/api/student/study-materials");
        const matData = await matRes.json();

        if (matData.success && matData.materials) {
            const container = document.getElementById("studentHomeworkContainer");
            if (container) {
                if (matData.materials.length === 0) {
                    container.innerHTML = `<div style="padding: 20px; text-align: center; color: #94a3b8;">No homework or study materials shared yet.</div>`;
                } else {
                    container.innerHTML = matData.materials.map(m => `
                        <div class="quiz-widget-card" style="margin-bottom: 12px;">
                            <h4 style="margin: 0 0 6px 0; color: #0f2a4a;"><i class="fa-solid fa-file-pdf" style="color: #ef4444;"></i> ${m.title}</h4>
                            <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px;">Subject: ${m.subject} &bull; Tutor: ${m.tutor ? m.tutor.name : "Tutor"}</p>
                            <a href="${m.fileUrl || '#'}" target="_blank" download class="dash-btn dash-btn-primary" style="font-size: 12px; padding: 6px 12px;"><i class="fa-solid fa-download"></i> Download Notes / PDF</a>
                        </div>
                    `).join("");
                }
            }
        }

        // Load Scheduled Live Classes
        const schedRes = await fetch("/api/schedule/student");
        const schedData = await schedRes.json();
        const schedContainer = document.getElementById("studentUpcomingClassesContainer");
        if (schedContainer && schedData.success) {
            if (!schedData.schedules || schedData.schedules.length === 0) {
                schedContainer.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-muted);">No upcoming classes scheduled yet. <button onclick="window.location.href='/find'" class="dash-btn dash-btn-primary" style="font-size: 12px; margin-left: 8px;">Book a Tutor</button></div>`;
            } else {
                schedContainer.innerHTML = schedData.schedules.map(s => {
                    const tutorName = s.tutor ? (s.tutor.name || "Tutor") : "Tutor";
                    const dateObj = new Date(s.startTime || s.createdAt || Date.now());
                    const day = dateObj.getDate().toString().padStart(2, '0');
                    const month = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return `
                        <div class="class-item">
                            <div class="class-info">
                                <div class="class-date-badge">
                                    <span class="day">${day}</span>
                                    <span class="month">${month}</span>
                                </div>
                                <div class="class-details">
                                    <h4>${s.subject || 'Tuition Class'}</h4>
                                    <p><i class="fa-solid fa-user"></i> ${tutorName} &bull; <i class="fa-solid fa-clock"></i> ${timeStr}</p>
                                </div>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button class="dash-btn dash-btn-primary" onclick="openVideoCallModal('${tutorName.replace(/'/g, "\\'")}')">
                                    <i class="fa-solid fa-video"></i> Join HD Class
                                </button>
                                <button class="dash-btn dash-btn-outline" onclick="openChatDrawer('${tutorName.replace(/'/g, "\\'")}')">
                                    Chat
                                </button>
                            </div>
                        </div>
                    `;
                }).join("");
            }
        }

        // Load Study Notes Library
        await loadStudentStudyNotes();
    } catch (err) {
        console.error("Load Student Dashboard Error:", err);
    }
};

window.loadStudentStudyNotes = async function() {
    const container = document.getElementById("studentStudyNotesGrid");
    if (!container) return;

    try {
        const res = await fetch("/api/student/study-notes");
        const data = await res.json();

        const notes = (data && data.success && (data.notes || data.materials)) ? (data.notes || data.materials) : [];

        if (notes.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; padding: 24px; text-align: center; color: var(--text-muted, #94a3b8); font-size: 14px; font-weight: 600; background: var(--bg-light, #f8fafc); border-radius: 12px; border: 1px dashed var(--border-color, #cbd5e1);">
                    No study notes available yet.
                </div>
            `;
            return;
        }

        container.innerHTML = notes.map(n => {
            const title = n.title || "Study Notes";
            const subject = n.subject || "General";
            const tutorName = n.tutor ? (n.tutor.name || n.tutor.email) : "Assigned Tutor";
            const uploadDate = n.createdAt ? new Date(n.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Recent";
            const fileUrl = n.fileUrl || "/uploads/materials/default-notes.pdf";
            const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '_');

            return `
                <div class="quiz-widget-card" style="display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; background: #e0f2fe; color: #0284c7; padding: 3px 8px; border-radius: 12px;">
                                ${subject}
                            </span>
                            <span style="font-size: 11px; color: var(--text-muted, #94a3b8);">
                                <i class="fa-solid fa-calendar-day"></i> ${uploadDate}
                            </span>
                        </div>
                        <h4 style="margin: 0 0 6px 0; color: #0f2a4a; font-size: 15px; font-weight: 700; line-height: 1.3;">
                            <i class="fa-solid fa-file-pdf" style="color: #ef4444; margin-right: 6px;"></i> ${title}
                        </h4>
                        <p style="font-size: 12.5px; color: var(--text-muted, #64748b); margin: 4px 0 14px 0;">
                            <i class="fa-solid fa-user-tie"></i> Tutor: <strong>${tutorName}</strong>
                        </p>
                    </div>
                    <div style="display: flex; gap: 8px; margin-top: 10px;">
                        <a href="${fileUrl}" target="_blank" rel="noopener noreferrer" class="dash-btn dash-btn-outline" style="flex: 1; justify-content: center; font-size: 12px; padding: 7px 10px;">
                            <i class="fa-solid fa-eye"></i> View PDF
                        </a>
                        <a href="${fileUrl}" download="${safeTitle}.pdf" class="dash-btn dash-btn-primary" style="flex: 1; justify-content: center; font-size: 12px; padding: 7px 10px;">
                            <i class="fa-solid fa-download"></i> Download
                        </a>
                    </div>
                </div>
            `;
        }).join("");
    } catch (err) {
        console.error("Load Student Study Notes Error:", err);
        container.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 24px; text-align: center; color: var(--text-muted, #94a3b8); font-size: 14px; font-weight: 600; background: var(--bg-light, #f8fafc); border-radius: 12px; border: 1px dashed var(--border-color, #cbd5e1);">
                No study notes available yet.
            </div>
        `;
    }
};

// RAZORPAY INTEGRATION HANDLERS
window.triggerRazorpayWalletTopup = async function(amount = 500) {
    try {
        if (typeof showToast === 'function') showToast("Initiating secure Razorpay checkout...");

        const orderRes = await fetch("/api/payment/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: amount, paymentType: "Wallet Topup" })
        });
        const orderData = await orderRes.json();

        if (!orderData.success) {
            showToast(`❌ ${orderData.message || "Failed to initiate payment"}`);
            return;
        }

        const options = {
            key: orderData.key_id,
            amount: orderData.amount,
            currency: orderData.currency || "INR",
            name: "Smart HomeTutor",
            description: "Wallet Credits Recharge",
            order_id: orderData.orderId,
            handler: async function(response) {
                try {
                    const verifyRes = await fetch("/api/payment/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id || orderData.orderId,
                            razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
                            razorpay_signature: response.razorpay_signature || "test_sig",
                            paymentType: "Wallet Topup",
                            amount: amount
                        })
                    });
                    const verifyData = await verifyRes.json();

                    if (verifyData.success) {
                        showToast(`✅ ${verifyData.message}`);
                        const walletDisplay = document.getElementById("studentWalletDisplay");
                        if (walletDisplay) {
                            walletDisplay.innerText = `₹${verifyData.walletBalance.toLocaleString('en-IN')}.00`;
                        }
                        if (typeof loadStudentDashboardData === 'function') {
                            loadStudentDashboardData();
                        }
                    } else {
                        showToast(`❌ ${verifyData.message}`);
                    }
                } catch (vErr) {
                    console.error("Verification Error:", vErr);
                    showToast("❌ Payment verification failed.");
                }
            },
            prefill: {
                name: "Student User",
                email: "student@hometutor.com",
            },
            theme: {
                color: "#0284c7"
            }
        };

        if (typeof Razorpay !== 'undefined') {
            const rzp = new Razorpay(options);
            rzp.open();
        } else {
            // Simulated fallback execution if script blocked
            options.handler({
                razorpay_order_id: orderData.orderId,
                razorpay_payment_id: `pay_sim_${Date.now()}`,
                razorpay_signature: "simulated_signature"
            });
        }
    } catch (err) {
        console.error("Wallet Topup Error:", err);
        showToast("❌ Payment error. Please try again.");
    }
};

window.triggerRazorpayInvoicePayment = async function(amount = 3600, invoiceId = 'INV-8821', description = 'Monthly Tuition Fee') {
    try {
        if (typeof showToast === 'function') showToast("Initiating Razorpay invoice payment...");

        const orderRes = await fetch("/api/payment/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: amount, paymentType: "Tuition Invoice Payment", invoiceId: invoiceId })
        });
        const orderData = await orderRes.json();

        if (!orderData.success) {
            showToast(`❌ ${orderData.message || "Failed to create invoice order"}`);
            return;
        }

        const options = {
            key: orderData.key_id,
            amount: orderData.amount,
            currency: orderData.currency || "INR",
            name: "Smart HomeTutor Parent Portal",
            description: description,
            order_id: orderData.orderId,
            handler: async function(response) {
                try {
                    const verifyRes = await fetch("/api/payment/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id || orderData.orderId,
                            razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
                            razorpay_signature: response.razorpay_signature || "test_sig",
                            paymentType: "Tuition Invoice Payment",
                            invoiceId: invoiceId,
                            amount: amount
                        })
                    });
                    const verifyData = await verifyRes.json();

                    if (verifyData.success) {
                        showToast(`✅ Invoice #${invoiceId} paid successfully via Razorpay!`);
                        if (typeof window.loadParentDashboardData === "function") {
                            window.loadParentDashboardData();
                        }
                    } else {
                        showToast(`❌ ${verifyData.message}`);
                    }
                } catch (vErr) {
                    console.error("Invoice Verification Error:", vErr);
                    showToast("❌ Payment verification error.");
                }
            },
            prefill: {
                name: "Parent Guardian",
                email: "parent@hometutor.com",
            },
            theme: {
                color: "#7e22ce"
            }
        };

        if (typeof Razorpay !== 'undefined') {
            const rzp = new Razorpay(options);
            rzp.open();
        } else {
            options.handler({
                razorpay_order_id: orderData.orderId,
                razorpay_payment_id: `pay_sim_${Date.now()}`,
                razorpay_signature: "simulated_signature"
            });
        }
    } catch (err) {
        console.error("Invoice Payment Error:", err);
        showToast("❌ Payment error. Please try again.");
    }
};

window.triggerTutorPayoutRequest = async function(amount = 5000) {
    try {
        const response = await fetch("/api/tutor/payout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: amount })
        });
        const data = await response.json();
        if (data.success) {
            showToast(`✅ Payout request of ₹${amount} created (Status: Pending Approval)`);
            if (typeof loadTutorDashboardData === 'function') loadTutorDashboardData();
        } else {
            showToast(`❌ ${data.message || "Failed to create payout request"}`);
        }
    } catch (err) {
        console.error("Payout Error:", err);
        showToast("❌ Failed to submit payout request.");
    }
};

// PART 1 FEATURE HANDLERS

window.applyCouponCode = async function(code = "WELCOME10", amount = 1000) {
    try {
        const response = await fetch("/api/coupon/apply", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, amount })
        });
        const data = await response.json();
        if (data.success) {
            showToast(`✅ ${data.message}`);
        } else {
            showToast(`❌ ${data.message || "Invalid coupon code."}`);
        }
    } catch (err) {
        console.error("Coupon Error:", err);
        showToast("❌ Coupon verification failed.");
    }
};

window.scheduleClassSession = async function(studentId, subject, date, startTime) {
    try {
        const response = await fetch("/api/schedule/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentId, subject, date, startTime })
        });
        const data = await response.json();
        if (data.success) {
            showToast(`✅ ${data.message}`);
        } else {
            showToast(`❌ ${data.message}`);
        }
    } catch (err) {
        console.error("Schedule Error:", err);
        showToast("❌ Failed to schedule class.");
    }
};

window.markStudentAttendance = async function(scheduleId, status = "Present") {
    try {
        const response = await fetch(`/api/schedule/${scheduleId}/attendance`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ attendance: status })
        });
        const data = await response.json();
        if (data.success) {
            showToast(`✅ ${data.message}`);
        } else {
            showToast(`❌ ${data.message}`);
        }
    } catch (err) {
        console.error("Attendance Error:", err);
        showToast("❌ Failed to update attendance.");
    }
};

// PART 2 FEATURE HANDLERS
window.fetchUserNotifications = async function() {
    try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        if (data.success && data.notifications) {
            const count = data.unreadCount || 0;
            const badge = document.getElementById("navNotificationBadge");
            if (badge) badge.innerText = count;
        }
    } catch (err) {
        console.error("Notifications Error:", err);
    }
};

window.markAllNotificationsRead = async function() {
    try {
        const res = await fetch("/api/notifications/read-all", { method: "PATCH" });
        const data = await res.json();
        if (data.success) {
            showToast("✅ All notifications marked as read.");
            fetchUserNotifications();
        }
    } catch (err) {
        console.error("Mark Read Error:", err);
    }
};

window.submitHelpTicket = async function(subject, description) {
    try {
        const res = await fetch("/api/complaints/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subject, description })
        });
        const data = await res.json();
        if (data.success) {
            showToast(`✅ ${data.message}`);
        } else {
            showToast(`❌ ${data.message}`);
        }
    } catch (err) {
        console.error("Ticket Error:", err);
        showToast("❌ Failed to submit help ticket.");
    }
};

window.askAIDoubt = async function(question, subject = "Mathematics") {
    try {
        showToast("🤖 AI Doubt Solver evaluating your query...");
        const res = await fetch("/api/ai/solve-doubt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question, subject })
        });
        const data = await res.json();
        if (data.success) {
            alert(`🤖 AI Doubt Solution (${data.solution.subject}):\n\n${data.solution.stepByStepSolution.join("\n")}\n\n${data.solution.summary}`);
        } else {
            showToast("❌ AI Service busy. Please try again.");
        }
    } catch (err) {
        console.error("AI Doubt Error:", err);
        showToast("❌ AI Doubt Service error.");
    }
};

window.CURRENT_AI_RECOMMENDATIONS = [];

/**
 * Open AI Smart Tutor Recommendations Modal
 */
window.openAIRecommendationsModal = function(subjectFilter = "all", gradeFilter = "all", maxBudgetFilter = "") {
    const modalHTML = `
        <div class="dash-modal-backdrop open" id="aiRecommendationsModal" style="z-index: 1100;">
            <div class="dash-modal-content" style="max-width: 780px; width: 95%;">
                <div class="dash-modal-header" style="background: linear-gradient(135deg, #0f172a, #1e293b); color: #ffffff; padding: 18px 24px; border-bottom: none;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(2, 132, 199, 0.2); color: #38bdf8; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                            <i class="fa-solid fa-robot"></i>
                        </div>
                        <div>
                            <h3 style="font-size: 18px; font-weight: 800; margin: 0; color: #ffffff;">AI Smart Tutor Recommendations</h3>
                            <p style="font-size: 12px; color: #94a3b8; margin: 2px 0 0 0;">Matched verified tutors based on academic rating & subject goals.</p>
                        </div>
                    </div>
                    <button class="dash-modal-close" onclick="closeModal('aiRecommendationsModal')" style="color: #94a3b8; font-size: 24px;">&times;</button>
                </div>

                <div class="dash-modal-body" style="padding: 20px; max-height: calc(85vh - 100px); overflow-y: auto;">
                    
                    <!-- FILTER BAR INSIDE MODAL -->
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 20px;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; align-items: end;">
                            <div class="filter-item">
                                <label style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">Subject Goal</label>
                                <select id="aiFilterSubject" style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px; background: #ffffff;">
                                    <option value="all" ${subjectFilter === 'all' ? 'selected' : ''}>All Subjects</option>
                                    <option value="Mathematics" ${subjectFilter === 'Mathematics' ? 'selected' : ''}>Mathematics</option>
                                    <option value="Physics" ${subjectFilter === 'Physics' ? 'selected' : ''}>Physics</option>
                                    <option value="Chemistry" ${subjectFilter === 'Chemistry' ? 'selected' : ''}>Chemistry</option>
                                    <option value="English" ${subjectFilter === 'English' ? 'selected' : ''}>English</option>
                                    <option value="Coding" ${subjectFilter === 'Coding' ? 'selected' : ''}>Coding</option>
                                </select>
                            </div>

                            <div class="filter-item">
                                <label style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">Class / Grade</label>
                                <select id="aiFilterGrade" style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px; background: #ffffff;">
                                    <option value="all" ${gradeFilter === 'all' ? 'selected' : ''}>All Grades</option>
                                    <option value="Grade 1-5" ${gradeFilter === 'Grade 1-5' ? 'selected' : ''}>Grade 1-5</option>
                                    <option value="Grade 6-8" ${gradeFilter === 'Grade 6-8' ? 'selected' : ''}>Grade 6-8</option>
                                    <option value="Grade 9-10" ${gradeFilter === 'Grade 9-10' ? 'selected' : ''}>Grade 9-10</option>
                                    <option value="Grade 11-12" ${gradeFilter === 'Grade 11-12' ? 'selected' : ''}>Grade 11-12</option>
                                </select>
                            </div>

                            <div class="filter-item">
                                <label style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">Max Fee (₹/hr)</label>
                                <input type="number" id="aiFilterMaxFee" value="${maxBudgetFilter}" placeholder="e.g. 600" style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px; background: #ffffff;">
                            </div>

                            <div>
                                <button type="button" class="dash-btn dash-btn-primary" style="width: 100%; padding: 9px 12px; font-size: 13px; justify-content: center;" onclick="triggerAIFilterReload()">
                                    <i class="fa-solid fa-sliders"></i> Filter Matches
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- DYNAMIC RESULTS CONTAINER -->
                    <div id="aiModalResultsContainer">
                        <!-- Loading spinner injected here initially -->
                    </div>

                </div>
            </div>
        </div>
    `;

    removeModal('aiRecommendationsModal');
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    fetchAIRecommendationsFromAPI(subjectFilter, gradeFilter, maxBudgetFilter);
};

window.triggerAIFilterReload = function() {
    const subj = document.getElementById("aiFilterSubject")?.value || "all";
    const gr = document.getElementById("aiFilterGrade")?.value || "all";
    const fee = document.getElementById("aiFilterMaxFee")?.value || "";
    fetchAIRecommendationsFromAPI(subj, gr, fee);
};

/**
 * Fetch Recommendations dynamically from MongoDB via /api/ai/recommend-tutors
 */
window.fetchAIRecommendationsFromAPI = async function(subject = "all", grade = "all", maxBudget = "") {
    const container = document.getElementById("aiModalResultsContainer");
    if (!container) return;

    // 1. SHOW LOADING STATE
    container.innerHTML = `
        <div style="text-align: center; padding: 50px 20px; background: #ffffff; border-radius: 14px;">
            <i class="fa-solid fa-robot fa-spin" style="font-size: 40px; color: #0284c7; margin-bottom: 16px;"></i>
            <h4 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0;">Scanning Available Tutors...</h4>
            <p style="font-size: 13px; color: #64748b; margin: 0;">Evaluating tutor ratings, subject relevance, and calculating compatibility scores...</p>
        </div>
    `;

    try {
        const queryParams = new URLSearchParams();
        if (subject && subject !== "all") queryParams.append("subject", subject);
        if (grade && grade !== "all") queryParams.append("grade", grade);
        if (maxBudget && Number(maxBudget) > 0) queryParams.append("maxBudget", maxBudget);

        const res = await fetch(`/api/ai/recommend-tutors?${queryParams.toString()}`);
        const data = await res.json();

        if (!data.success) {
            // 2. SHOW ERROR STATE
            container.innerHTML = `
                <div class="login-alert login-alert-error" style="margin: 10px 0; text-align: center; display: block; padding: 20px;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 28px; margin-bottom: 8px;"></i>
                    <p style="margin: 0; font-weight: 800; font-size: 14px;">${data.message || "Failed to load tutor recommendations."}</p>
                    <p style="margin-top: 4px; font-size: 12px; opacity: 0.9;">Please verify server availability and try again.</p>
                </div>
            `;
            return;
        }

        const recommendations = data.recommendations || [];
        window.CURRENT_AI_RECOMMENDATIONS = recommendations;

        // 3. SHOW EMPTY STATE IF NO MATCHES
        if (recommendations.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 45px 20px; background: #f8fafc; border-radius: 16px; border: 2px dashed #cbd5e1; margin: 10px 0;">
                    <div style="width: 60px; height: 60px; border-radius: 50%; background: #e0f2fe; color: #0284c7; display: inline-flex; align-items: center; justify-content: center; font-size: 26px; margin-bottom: 14px;">
                        <i class="fa-solid fa-user-slash"></i>
                    </div>
                    <h4 style="font-size: 17px; font-weight: 800; color: #1e293b; margin: 0 0 6px 0;">No Verified Tutors Found</h4>
                    <p style="font-size: 13px; color: #64748b; max-width: 420px; margin: 0 auto 20px auto; line-height: 1.5;">
                        We couldn't find any active tutors matching your exact subject or budget criteria. Submit a custom request to notify available tutors!
                    </p>
                    <button type="button" class="dash-btn dash-btn-primary" style="display: inline-flex; align-items: center; gap: 8px;" onclick="closeModal('aiRecommendationsModal'); openRequestTutorModal();">
                        <i class="fa-solid fa-paper-plane"></i> Submit Custom Tutor Request
                    </button>
                </div>
            `;
            return;
        }

        // 4. RENDER TUTOR CARDS
        let cardsHTML = `<div style="display: flex; flex-direction: column; gap: 16px;">`;

        recommendations.forEach((item) => {
            const t = item.tutor || {};
            const tutorId = t._id || t.id || "";
            const rawName = (t.user && t.user.name) ? t.user.name : (t.name || "Verified Tutor");
            const escapedName = rawName.replace(/'/g, "\\'");
            const qualification = t.qualification || "Certified Home Tutor";
            const experience = t.experience || 0;
            const rating = t.rating || 5.0;
            const totalReviews = t.totalReviews || 0;
            const fee = t.fee || 500;
            const location = t.location || "Online";
            const mode = t.mode || "Both";
            const subjectsStr = Array.isArray(t.subjects) ? t.subjects.join(", ") : (t.subjects || "General Syllabus");
            const profileImage = t.profileImage || "";
            const matchScore = item.matchScore || 85;
            const reason = item.reason || `High academic rating matching ${subjectsStr}.`;

            const initials = rawName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) || "VT";

            const avatarHTML = profileImage
                ? `<img src="${profileImage}" alt="${rawName}" style="width: 54px; height: 54px; border-radius: 50%; object-fit: cover; border: 2px solid #0284c7;">`
                : `<div class="tutor-img" style="width: 54px; height: 54px; font-size: 20px;">${initials}</div>`;

            cardsHTML += `
                <div class="ai-tutor-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); transition: all 0.2s ease;">
                    
                    <!-- TOP HEADER ROW -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; flex-wrap: wrap; margin-bottom: 12px;">
                        <div style="display: flex; gap: 14px; align-items: center;">
                            ${avatarHTML}
                            <div>
                                <h4 style="font-size: 17px; font-weight: 800; color: var(--primary); margin: 0 0 4px 0; display: flex; align-items: center; gap: 6px;">
                                    ${rawName}
                                    <i class="fa-solid fa-circle-check" style="color: #0284c7; font-size: 14px;" title="Verified Educator"></i>
                                </h4>
                                <p style="font-size: 12px; color: #64748b; margin: 0; font-weight: 600;">
                                    <i class="fa-solid fa-graduation-cap" style="color: #0284c7;"></i> ${qualification}
                                </p>
                            </div>
                        </div>

                        <div style="background: linear-gradient(135deg, #059669, #10b981); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> ${matchScore}% Match
                        </div>
                    </div>

                    <!-- AI MATCH REASON BANNER -->
                    <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 10px 14px; font-size: 12px; color: #0369a1; margin-bottom: 14px; line-height: 1.5; display: flex; align-items: flex-start; gap: 8px;">
                        <i class="fa-solid fa-brain" style="font-size: 15px; margin-top: 2px; flex-shrink: 0; color: #0284c7;"></i>
                        <div>
                            <strong style="color: #0c4a6e;">AI Recommendation Reason:</strong> ${reason}
                        </div>
                    </div>

                    <!-- METRICS GRID -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; padding: 12px; background: #f8fafc; border-radius: 12px; margin-bottom: 16px; border: 1px solid #f1f5f9;">
                        <div style="font-size: 12px;">
                            <span style="display: block; font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Subjects</span>
                            <strong style="color: #0f172a;"><i class="fa-solid fa-book" style="color: #0284c7;"></i> ${subjectsStr}</strong>
                        </div>

                        <div style="font-size: 12px;">
                            <span style="display: block; font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Experience</span>
                            <strong style="color: #0f172a;"><i class="fa-solid fa-briefcase" style="color: #0284c7;"></i> ${experience} Yrs</strong>
                        </div>

                        <div style="font-size: 12px;">
                            <span style="display: block; font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Rating</span>
                            <strong style="color: #d97706;"><i class="fa-solid fa-star" style="color: #f59e0b;"></i> ${rating} (${totalReviews} rev)</strong>
                        </div>

                        <div style="font-size: 12px;">
                            <span style="display: block; font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Hourly Fee</span>
                            <strong style="color: #059669;"><i class="fa-solid fa-indian-rupee-sign"></i> ₹${fee}/hr</strong>
                        </div>
                    </div>

                    <!-- ACTION BUTTONS: VIEW PROFILE, BOOK DEMO, REQUEST TUTOR -->
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <button type="button" class="dash-btn dash-btn-outline" style="flex: 1; font-size: 12px; justify-content: center; padding: 9px 12px;" onclick="openAIRecommendedTutorProfileModal('${tutorId}')">
                            <i class="fa-solid fa-user"></i> View Profile
                        </button>

                        <button type="button" class="dash-btn dash-btn-accent" style="flex: 1; font-size: 12px; justify-content: center; padding: 9px 12px;" onclick="closeModal('aiRecommendationsModal'); openDemoModal('${tutorId}', '${escapedName}')">
                            <i class="fa-solid fa-calendar-check"></i> Book Demo
                        </button>

                        <button type="button" class="dash-btn dash-btn-primary" style="flex: 1; font-size: 12px; justify-content: center; padding: 9px 12px;" onclick="closeModal('aiRecommendationsModal'); openRequestTutorModal()">
                            <i class="fa-solid fa-paper-plane"></i> Request Tutor
                        </button>
                    </div>
                </div>
            `;
        });

        cardsHTML += `</div>`;
        container.innerHTML = cardsHTML;

    } catch (err) {
        console.error("Fetch AI Recommendations Error:", err);
        container.innerHTML = `
            <div class="login-alert login-alert-error" style="margin: 10px 0; text-align: center; display: block; padding: 20px;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 28px; margin-bottom: 8px;"></i>
                <p style="margin: 0; font-weight: 800; font-size: 14px;">Network Error Fetching Recommendations</p>
                <p style="margin-top: 4px; font-size: 12px; opacity: 0.9;">Please check your connection and try again.</p>
            </div>
        `;
    }
};

/**
 * Quick Profile Modal Overview for AI Recommended MongoDB Tutor
 */
window.openAIRecommendedTutorProfileModal = function(tutorId) {
    const matchItem = (window.CURRENT_AI_RECOMMENDATIONS || []).find(item => (item.tutor?._id === tutorId || item.tutor?.id === tutorId));
    
    if (!matchItem) {
        window.location.href = `/tutor/${tutorId}`;
        return;
    }

    const t = matchItem.tutor || {};
    const name = (t.user && t.user.name) ? t.user.name : (t.name || "Verified Educator");
    const escapedName = name.replace(/'/g, "\\'");
    const qualification = t.qualification || "Certified Tutor";
    const experience = t.experience || 0;
    const rating = t.rating || 5.0;
    const totalReviews = t.totalReviews || 0;
    const fee = t.fee || 500;
    const location = t.location || "Online";
    const mode = t.mode || "Both";
    const subjectsStr = Array.isArray(t.subjects) ? t.subjects.join(", ") : (t.subjects || "General");
    const classesStr = Array.isArray(t.classes) ? t.classes.join(", ") : (t.classes || "All Grades");
    const about = t.about || "Experienced educator dedicated to conceptual learning, active problem solving, and personalized student growth.";

    const modalHTML = `
        <div class="dash-modal-backdrop open" id="aiTutorProfileModal" style="z-index: 1200;">
            <div class="dash-modal-content" style="max-width: 600px; width: 92%;">
                <div class="dash-modal-header">
                    <h3>Tutor Profile Overview</h3>
                    <button class="dash-modal-close" onclick="closeModal('aiTutorProfileModal')">&times;</button>
                </div>
                <div class="dash-modal-body">
                    <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 20px;">
                        <div class="tutor-img" style="width: 64px; height: 64px; font-size: 22px;">${name.substring(0, 2).toUpperCase()}</div>
                        <div>
                            <h3 style="font-size: 19px; font-weight: 800; color: var(--primary); margin: 0;">
                                ${name}
                                <i class="fa-solid fa-circle-check" style="color: #0284c7; font-size: 15px;"></i>
                            </h3>
                            <p style="color: var(--text-muted); font-size: 13px; margin: 2px 0 0 0;">${qualification} • ${experience}+ Yrs Exp</p>
                        </div>
                    </div>

                    <div style="background: #f8fafc; padding: 14px; border-radius: 12px; margin-bottom: 16px; font-size: 13px; line-height: 1.6; color: #334155;">
                        <strong>Teaching Philosophy & Bio:</strong><br>
                        ${about}
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px; margin-bottom: 20px;">
                        <div style="background: #f1f5f9; padding: 10px; border-radius: 8px;">
                            <span style="color: #64748b; font-weight: 700;">Subjects Taught:</span><br>
                            <strong style="color: #0f172a;">${subjectsStr}</strong>
                        </div>
                        <div style="background: #f1f5f9; padding: 10px; border-radius: 8px;">
                            <span style="color: #64748b; font-weight: 700;">Classes / Grades:</span><br>
                            <strong style="color: #0f172a;">${classesStr}</strong>
                        </div>
                        <div style="background: #f1f5f9; padding: 10px; border-radius: 8px;">
                            <span style="color: #64748b; font-weight: 700;">Location & Mode:</span><br>
                            <strong style="color: #0f172a;">${location} (${mode})</strong>
                        </div>
                        <div style="background: #f1f5f9; padding: 10px; border-radius: 8px;">
                            <span style="color: #64748b; font-weight: 700;">Rating & Fee:</span><br>
                            <strong style="color: #059669;">★ ${rating} (${totalReviews} rev) • ₹${fee}/hr</strong>
                        </div>
                    </div>

                    <div class="dash-modal-footer" style="padding: 0; background: transparent; border: none; display: flex; gap: 8px;">
                        <button class="dash-btn dash-btn-outline" style="flex: 1;" onclick="window.location.href='/tutor/${t._id || tutorId}'">
                            <i class="fa-solid fa-up-right-from-square"></i> Full Profile Page
                        </button>
                        <button class="dash-btn dash-btn-accent" style="flex: 1;" onclick="closeModal('aiTutorProfileModal'); closeModal('aiRecommendationsModal'); openDemoModal('${t._id || tutorId}', '${escapedName}')">
                            <i class="fa-solid fa-calendar-check"></i> Book Free Demo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    removeModal('aiTutorProfileModal');
    document.body.insertAdjacentHTML('beforeend', modalHTML);
};

window.predictAIProgress = async function(subject = "Overall") {
    try {
        showToast("📈 Generating AI Learning Progress Prediction...");
        const res = await fetch("/api/ai/progress-prediction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subject })
        });
        const data = await res.json();
        if (data.success) {
            alert(`📊 AI Progress Prediction (${data.prediction.subject}):\n\nCurrent Attendance: ${data.prediction.currentAttendanceRate}\nPredicted Exam Score: ${data.prediction.predictedScore}\nExpected Boost: ${data.prediction.expectedGradeImprovement}\n\nAI Advice: ${data.prediction.aiAdvice}`);
        }
    } catch (err) {
        console.error("AI Progress Error:", err);
    }
};

window.generateAIStudyPlan = async function(subject = "Mathematics", targetGrade = "Grade 10") {
    try {
        showToast("🗓️ Generating Personalized AI Study Plan...");
        const res = await fetch("/api/ai/study-plan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subject, targetGrade })
        });
        const data = await res.json();
        if (data.success) {
            const schedStr = data.studyPlan.schedule.map(s => `• ${s.day}: ${s.focus} (${s.duration})`).join("\n");
            alert(`🗓️ AI Study Plan (${data.studyPlan.subject} - ${data.studyPlan.targetGrade}):\n\nWeekly Schedule:\n${schedStr}\n\nKey Milestones:\n${data.studyPlan.milestones.join("\n")}`);
        }
    } catch (err) {
        console.error("AI Study Plan Error:", err);
    }
};

window.getAIProgressReport = async function() {
    try {
        const res = await fetch("/api/ai/progress-report");
        const data = await res.json();
        if (data.success) {
            alert(`📑 AI Analytical Progress Report:\n\nHealth: ${data.report.overallHealth}\nAttendance: ${data.report.attendanceRating}\nCompleted Classes: ${data.report.completedSessionsCount}\n\nStrengths:\n${data.report.strengths.join("\n")}\n\nRecommendation: ${data.report.recommendations}`);
        }
    } catch (err) {
        console.error("AI Report Error:", err);
    }
};

window.updateHomeVisitStatus = async function(bookingId, status) {
    try {
        const res = await fetch(`/api/tutor/home-visit/${bookingId}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        });
        const data = await res.json();
        if (data.success) {
            showToast(`🚗 ${data.message}`);
        } else {
            showToast(`❌ ${data.message}`);
        }
    } catch (err) {
        console.error("Home Visit Status Error:", err);
    }
};

window.sendBulkNotification = async function(title, message, targetRole = "all") {
    try {
        const res = await fetch("/api/admin/bulk-notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, message, targetRole })
        });
        const data = await res.json();
        if (data.success) {
            showToast(`📢 ${data.message}`);
        } else {
            showToast(`❌ ${data.message}`);
        }
    } catch (err) {
        console.error("Bulk Notification Error:", err);
    }
};

window.issueStudentCertificate = async function(studentId, courseName) {
    try {
        const res = await fetch("/api/tutor/issue-certificate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentId, courseName })
        });
        const data = await res.json();
        if (data.success) {
            showToast(`🎓 ${data.message}`);
        } else {
            showToast(`❌ ${data.message}`);
        }
    } catch (err) {
        console.error("Issue Certificate Error:", err);
    }
};

window.copyReferralCode = function() {
    const codeEl = document.getElementById("studentReferralCodeDisplay");
    if (codeEl) {
        const code = codeEl.innerText.trim();
        if (!code || code === "Loading...") {
            if (typeof showToast === 'function') showToast("⚠️ Referral code loading, please wait...");
            return;
        }
        navigator.clipboard.writeText(code).then(() => {
            if (typeof showToast === 'function') {
                showToast(`✅ Referral Code '${code}' copied to clipboard!`);
            } else {
                alert(`Referral Code '${code}' copied!`);
            }
        }).catch(() => {
            alert(`Your Referral Code: ${code}`);
        });
    }
};

window.loadStudentReferrals = async function() {
    const codeEl = document.getElementById("studentReferralCodeDisplay");
    const earningsEl = document.getElementById("studentReferralEarningsDisplay");
    const countEl = document.getElementById("studentReferralCountDisplay");
    const historyList = document.getElementById("studentReferralHistoryList");

    if (!codeEl && !historyList) return;

    try {
        const res = await fetch("/api/student/referrals");
        const data = await res.json();
        if (!data.success) return;

        if (codeEl) codeEl.innerText = data.referralCode || "N/A";
        if (earningsEl) earningsEl.innerText = `₹${(data.referralEarnings || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
        if (countEl) countEl.innerText = `${data.totalReferred || 0} ${data.totalReferred === 1 ? 'Friend' : 'Friends'}`;

        if (historyList) {
            const users = data.referredUsers || [];
            if (users.length === 0) {
                historyList.innerHTML = `
                    <div style="text-align: center; padding: 16px; color: #64748b; background: #f8fafc; border-radius: 8px; border: 1px dashed #cbd5e1;">
                        <i class="fa-solid fa-user-plus" style="font-size: 20px; color: #94a3b8; margin-bottom: 6px; display: block;"></i>
                        <p style="margin: 0; font-weight: 600; color: #475569;">You haven't referred any friends yet.</p>
                        <span style="font-size: 11px; color: #94a3b8;">Share your code above to start earning ₹100 bonuses!</span>
                    </div>
                `;
            } else {
                historyList.innerHTML = users.map(u => {
                    const dateStr = u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recently";
                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 6px;">
                            <div>
                                <strong style="color: #0f2a4a; font-size: 13px; display: block;">${u.name || u.email}</strong>
                                <span style="font-size: 11px; color: #64748b;">${u.email} &bull; Joined ${dateStr}</span>
                            </div>
                            <span style="background: #dcfce7; color: #15803d; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 12px;">
                                +₹100 Earned
                            </span>
                        </div>
                    `;
                }).join("");
            }
        }
    } catch (err) {
        console.error("Load Student Referrals Error:", err);
    }
};

window.getStudentReferrals = window.loadStudentReferrals;

window.loadAdminDashboardData = async function() {
    try {
        const statsRes = await fetch("/api/admin/stats");
        const statsData = await statsRes.json();

        if (statsData.success && statsData.stats) {
            const s = statsData.stats;
            const usersEl = document.getElementById("adminTotalUsers");
            if (usersEl) usersEl.innerText = s.totalUsers ? s.totalUsers.toLocaleString('en-IN') : "0";

            const revEl = document.getElementById("adminGrossRevenue");
            if (revEl) revEl.innerText = `₹${(s.totalRevenue || 0).toLocaleString('en-IN')}.00`;

            const activeEl = document.getElementById("adminActiveSessions");
            if (activeEl) activeEl.innerText = `${s.totalBookings || 0} Sessions`;

            const pendingEl = document.getElementById("adminPendingVerificationsCount");
            if (pendingEl) pendingEl.innerText = `${s.pendingDocumentsCount || 0} Tutors`;
        }

        // Load Pending Verifications Queue
        const docRes = await fetch("/api/admin/pending-documents");
        const docData = await docRes.json();
        const docContainer = document.getElementById("adminPendingVerificationsContainer");
        const fullQueueContainer = document.getElementById("adminTutorVerificationsQueue");
        const tutorsList = (docData && docData.success) ? (docData.tutors || docData.pendingDocuments || []) : [];

        if (docContainer) {
            if (tutorsList.length === 0) {
                docContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px;">No pending tutor document verification applications.</div>`;
            } else {
                docContainer.innerHTML = tutorsList.map(t => {
                    const tutorName = t.user ? t.user.name : "Tutor";
                    const subStr = t.subjects ? t.subjects.join(", ") : "Tuition";
                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px; background: var(--bg-light); border-radius: 12px; border: 1px solid var(--border-color);">
                            <div>
                                <h4 style="font-size: 15px; font-weight: 700; margin: 0;">${tutorName}</h4>
                                <p style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">Subject: ${subStr} &bull; Qualification: ${t.qualification || 'Degree'}</p>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button class="dash-btn dash-btn-outline" style="padding: 6px 12px; font-size: 12px;" onclick="previewTutorDocumentsModal('${t._id}')"><i class="fa-solid fa-eye"></i> Preview</button>
                                <button class="dash-btn dash-btn-primary" style="padding: 6px 12px; font-size: 12px;" onclick="verifyTutorDocumentAction('${t._id}', 'approved')"><i class="fa-solid fa-check"></i> Approve</button>
                            </div>
                        </div>
                    `;
                }).join("");
            }
        }

        if (fullQueueContainer) {
            if (tutorsList.length === 0) {
                fullQueueContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 30px;">No pending tutor background verification applications in queue.</div>`;
            } else {
                fullQueueContainer.innerHTML = tutorsList.map(t => {
                    const tutorName = t.user ? t.user.name : "Tutor Account";
                    const tutorEmail = t.user ? t.user.email : "";
                    const subStr = t.subjects ? t.subjects.join(", ") : "Tuition Subjects";
                    const docs = t.documents || [];
                    const docTypes = docs.length 
                        ? docs.map(d => d.name || d.docType || d.type || "Uploaded Document").join(", ") 
                        : "No KYC documents uploaded yet";

                    return `
                        <div style="padding: 18px; border: 1px solid var(--border-color); border-radius: 12px; background: #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                                <div>
                                    <h4 style="margin: 0 0 4px 0; font-size: 16px; color: #0f2a4a; font-weight: 800;">${tutorName} &bull; ${subStr}</h4>
                                    <span style="font-size: 12px; color: var(--text-muted);">${tutorEmail} &bull; Experience: ${t.experience || 0} Yrs &bull; ${t.location || 'Online'}</span>
                                </div>
                                <span class="status-pill status-pending" style="font-size: 11px;">Verification Pending</span>
                            </div>
                            <p style="font-size: 13px; color: #475569; margin-bottom: 14px; background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                                <i class="fa-solid fa-folder-open" style="color: #b45309;"></i> <strong>Submitted Credentials:</strong> ${docTypes}
                            </p>
                            <div style="display: flex; gap: 10px;">
                                <button class="dash-btn dash-btn-primary" style="background: #b45309;" onclick="previewTutorDocumentsModal('${t._id}')"><i class="fa-solid fa-eye"></i> Preview Documents</button>
                                ${docs.length > 0 ? `<button class="dash-btn dash-btn-primary" onclick="verifyTutorDocumentAction('${t._id}', 'approved')"><i class="fa-solid fa-check"></i> Approve Application</button>` : ''}
                                <button class="dash-btn dash-btn-outline" style="color: #dc2626; border-color: #fca5a5;" onclick="verifyTutorDocumentAction('${t._id}', 'rejected')"><i class="fa-solid fa-xmark"></i> Reject Application</button>
                            </div>
                        </div>
                    `;
                }).join("");
            }
        }

        // Load Activity Audit Logs
        const logRes = await fetch("/api/admin/activity-logs");
        const logData = await logRes.json();
        const logContainer = document.getElementById("adminActivityLogsContainer");
        if (logContainer && logData.success) {
            if (!logData.logs || logData.logs.length === 0) {
                logContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px;">No recent activity logs.</div>`;
            } else {
                logContainer.innerHTML = logData.logs.slice(0, 5).map(l => {
                    const dateStr = new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return `
                        <div style="padding-bottom: 8px; border-bottom: 1px solid var(--border-color);">
                            <span style="color: var(--text-muted);">${dateStr}</span>
                            <p style="font-weight: 600; color: var(--text-dark); margin-top: 2px;">${l.action}</p>
                        </div>
                    `;
                }).join("");
            }
        }

        // Load Users Directory Table
        const userRes = await fetch("/api/admin/users");
        const userData = await userRes.json();
        const userTbody = document.getElementById("adminUsersTableBody");
        if (userTbody && userData.success) {
            if (!userData.users || userData.users.length === 0) {
                userTbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">No users found.</td></tr>`;
            } else {
                userTbody.innerHTML = userData.users.map(u => {
                    const roleBadgeClass = u.role === "student" ? "badge-student" : u.role === "tutor" ? "badge-tutor" : u.role === "admin" ? "badge-admin" : "badge-parent";
                    const joined = new Date(u.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
                    return `
                        <tr>
                            <td>
                                <div style="font-weight: 700;">${u.name || u.email.split("@")[0]}</div>
                                <span style="font-size: 11px; color: var(--text-muted);">${u.email}</span>
                            </td>
                            <td><span class="role-badge ${roleBadgeClass}">${u.role.toUpperCase()}</span></td>
                            <td>${joined}</td>
                            <td><span class="status-pill status-active">${u.isVerified ? 'Verified' : 'Pending'}</span></td>
                            <td>
                                <button class="dash-btn dash-btn-outline" style="padding: 4px 10px; font-size: 12px;" onclick="alert('User details:\\nName: ${u.name || ''}\\nEmail: ${u.email}\\nRole: ${u.role}\\nReferral Code: ${u.referralCode || 'N/A'}')">View</button>
                            </td>
                        </tr>
                    `;
                }).join("");
            }
        }

        // Load Academic Subjects Catalog
        window.loadSubjectsCatalog();

        // Load Platform Revenue & Escrow Commission Log
        window.loadFinanceRevenueLog();

        // Load Certificate Approval Requests
        window.loadAdminCertificateRequests();

        // Load Educator Payout Requests
        window.loadAdminPayoutRequests();
    } catch (err) {
        console.error("Load Admin Dashboard Error:", err);
    }
};

window.loadAdminPayoutRequests = async function() {
    const tbody = document.getElementById("adminPayoutRequestsTableBody");
    if (!tbody) return;

    try {
        const res = await fetch("/api/admin/payout-requests");
        const data = await res.json();

        if (data.success && data.payoutRequests) {
            const requests = data.payoutRequests;
            if (requests.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 24px; color: #64748b;">
                            <i class="fa-solid fa-circle-check" style="color: #16a34a; margin-right: 6px;"></i> No pending educator payout requests.
                        </td>
                    </tr>
                `;
            } else {
                tbody.innerHTML = requests.map(p => {
                    const payId = `#PAY-${p._id.toString().slice(-6).toUpperCase()}`;
                    const tutorName = p.tutor ? (p.tutor.name || p.tutor.email) : "Unknown Tutor";
                    const tutorEmail = p.tutor ? p.tutor.email : "";
                    const dateStr = new Date(p.requestedAt || p.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
                    const availBal = p.availableBalance !== undefined ? p.availableBalance : 0;
                    
                    let statusBadge = `<span class="status-pill status-pending" style="background: #fef3c7; color: #b45309; font-weight: bold; padding: 4px 10px; border-radius: 20px; font-size: 11px;">Pending Approval</span>`;
                    if (p.status === "Approved") {
                        statusBadge = `<span class="status-pill status-active" style="background: #dcfce7; color: #15803d; font-weight: bold; padding: 4px 10px; border-radius: 20px; font-size: 11px;">Approved & Processed</span>`;
                    } else if (p.status === "Rejected") {
                        statusBadge = `<span class="status-pill status-danger" style="background: #fee2e2; color: #dc2626; font-weight: bold; padding: 4px 10px; border-radius: 20px; font-size: 11px;">Rejected</span>`;
                    }

                    let actionBtns = ``;
                    if (p.status === "Pending") {
                        actionBtns = `
                            <button class="dash-btn dash-btn-primary" style="padding: 4px 10px; font-size: 12px; background: #16a34a; border-color: #16a34a;" onclick="approveAdminPayout('${p._id}', '${tutorName.replace(/'/g, "\\'")}', ${p.amount})">
                                <i class="fa-solid fa-check"></i> Approve
                            </button>
                            <button class="dash-btn dash-btn-outline" style="padding: 4px 10px; font-size: 12px; color: #dc2626; border-color: #fca5a5;" onclick="rejectAdminPayout('${p._id}', '${tutorName.replace(/'/g, "\\'")}')">
                                <i class="fa-solid fa-xmark"></i> Reject
                            </button>
                        `;
                    } else {
                        actionBtns = `<span style="font-size: 12px; color: #64748b;">Action Complete</span>`;
                    }

                    return `
                        <tr>
                            <td><strong>${payId}</strong></td>
                            <td><strong>${tutorName}</strong><br><small style="color: #64748b;">${tutorEmail}</small></td>
                            <td><strong style="color: #15803d; font-size: 14px;">₹${p.amount.toLocaleString('en-IN')}</strong></td>
                            <td><strong style="color: #0f2a4a; font-size: 14px;">₹${availBal.toLocaleString('en-IN')}</strong></td>
                            <td>${dateStr}</td>
                            <td>${statusBadge}</td>
                            <td><div style="display: flex; gap: 6px;">${actionBtns}</div></td>
                        </tr>
                    `;
                }).join("");
            }
        }
    } catch (err) {
        console.error("Load Admin Payout Requests Error:", err);
    }
};

window.approveAdminPayout = async function(payoutId, tutorName, amount) {
    const confirmed = window.showCustomConfirm
        ? await window.showCustomConfirm(`Are you sure you want to APPROVE and process payout of ₹${amount.toLocaleString('en-IN')} for ${tutorName}?`, "Approve Payout", "Approve", "Cancel")
        : confirm(`Are you sure you want to APPROVE and process payout of ₹${amount.toLocaleString('en-IN')} for ${tutorName}?`);
    if (!confirmed) return;

    try {
        const res = await fetch(`/api/admin/payout-requests/${payoutId}/approve`, { method: "POST" });
        const data = await res.json();
        if (data.success) {
            showToast(`✅ ${data.message}`);
            window.loadAdminPayoutRequests();
        } else {
            showToast(`❌ ${data.message || "Failed to approve payout request."}`);
        }
    } catch (err) {
        console.error("Approve Payout Error:", err);
        showToast("❌ Network error approving payout.");
    }
};

window.rejectAdminPayout = async function(payoutId, tutorName) {
    const reason = window.showCustomPrompt
        ? await window.showCustomPrompt(`Enter rejection reason for ${tutorName}'s payout request (optional):`, "Account details pending verification", "Reject Payout")
        : prompt(`Enter rejection reason for ${tutorName}'s payout request (optional):`, "Account details pending verification");
    if (reason === null) return;

    try {
        const res = await fetch(`/api/admin/payout-requests/${payoutId}/reject`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rejectionReason: reason })
        });
        const data = await res.json();
        if (data.success) {
            showToast(`✅ ${data.message}`);
            window.loadAdminPayoutRequests();
        } else {
            showToast(`❌ ${data.message || "Failed to reject payout request."}`);
        }
    } catch (err) {
        console.error("Reject Payout Error:", err);
        showToast("❌ Network error rejecting payout.");
    }
};

window.loadAdminCertificateRequests = async function() {
    const tbody = document.getElementById("adminCertificateRequestsTableBody");
    if (!tbody) return;

    try {
        const res = await fetch("/api/admin/certificate-requests");
        const data = await res.json();
        if (!data.success || !data.requests) return;

        if (data.requests.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 30px; color: #64748b;">
                        <i class="fa-solid fa-award" style="font-size: 32px; color: #cbd5e1; margin-bottom: 8px;"></i>
                        <h4 style="font-size: 15px; font-weight: 700; color: #1e293b; margin: 0 0 4px 0;">No Certificate Approval Requests Pending</h4>
                        <p style="font-size: 12px; color: #64748b; margin: 0;">Course completion requests submitted by tutors will appear here for Admin verification.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = data.requests.map(r => {
            const studentName = r.student ? r.student.name : "Student Account";
            const tutorName = r.tutor ? r.tutor.name : "Tutor Account";
            const attendance = `${r.attendancePercentage || 100}%`;
            let statusPill = `<span class="status-pill status-active">Pending Review</span>`;
            if (r.status === "Approved") statusPill = `<span class="status-pill status-completed">Approved</span>`;
            if (r.status === "Rejected") statusPill = `<span class="status-pill status-danger">Rejected</span>`;

            let actionButtons = ``;
            if (r.status === "Pending") {
                actionButtons = `
                    <div style="display: flex; gap: 6px;">
                        <button class="dash-btn dash-btn-primary" style="padding: 4px 10px; font-size: 11px;" onclick="approveAdminCertificateRequest('${r._id}')">
                            <i class="fa-solid fa-check"></i> Approve
                        </button>
                        <button class="dash-btn dash-btn-outline" style="padding: 4px 10px; font-size: 11px; color: #dc2626; border-color: #fca5a5;" onclick="rejectAdminCertificateRequest('${r._id}')">
                            <i class="fa-solid fa-xmark"></i> Reject
                        </button>
                    </div>
                `;
            } else if (r.status === "Approved" && r.certificate) {
                actionButtons = `
                    <a href="/api/student/certificates/download/${r.certificate._id || r.certificate}" target="_blank" class="dash-btn dash-btn-outline" style="padding: 4px 10px; font-size: 11px; text-decoration: none;">
                        <i class="fa-solid fa-file-pdf"></i> View PDF
                    </a>
                `;
            } else {
                actionButtons = `<span style="font-size: 11px; color: #94a3b8;">Decision Finalized</span>`;
            }

            return `
                <tr>
                    <td><strong>${studentName}</strong></td>
                    <td>${tutorName}</td>
                    <td><b>${r.courseName}</b></td>
                    <td><span style="color: #0284c7; font-weight: 700;">${attendance}</span></td>
                    <td style="font-size: 12px; color: #475569;">${r.tutorRemarks || 'Course completed cleanly.'}</td>
                    <td>${statusPill}</td>
                    <td>${actionButtons}</td>
                </tr>
            `;
        }).join("");
    } catch (err) {
        console.error("Load Admin Certificate Requests Error:", err);
    }
};

window.approveAdminCertificateRequest = async function(reqId) {
    const confirmed = window.showCustomConfirm
        ? await window.showCustomConfirm("Are you sure you want to approve this certificate request and issue an official PDF certificate?", "Approve Certificate", "Approve", "Cancel")
        : confirm("Are you sure you want to approve this certificate request and issue an official PDF certificate?");
    if (!confirmed) return;
    try {
        const res = await fetch(`/api/admin/certificate-requests/${reqId}/approve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ adminRemarks: "Approved by Admin" })
        });
        const data = await res.json();
        if (data.success) {
            showToast(`🎓 ${data.message}`);
            window.loadAdminCertificateRequests();
        } else {
            showToast(`❌ ${data.message}`);
        }
    } catch (err) {
        console.error("Approve Certificate Error:", err);
        showToast("❌ Failed to approve certificate request.");
    }
};

window.rejectAdminCertificateRequest = async function(reqId) {
    const remarks = window.showCustomPrompt
        ? await window.showCustomPrompt("Please enter rejection feedback for the tutor:", "Pending revisions needed", "Reject Certificate")
        : prompt("Please enter rejection feedback for the tutor:");
    if (remarks === null) return;

    try {
        const res = await fetch(`/api/admin/certificate-requests/${reqId}/reject`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ adminRemarks: remarks || "Course completion criteria not fully satisfied." })
        });
        const data = await res.json();
        if (data.success) {
            showToast(`🚫 ${data.message}`);
            window.loadAdminCertificateRequests();
        } else {
            showToast(`❌ ${data.message}`);
        }
    } catch (err) {
        console.error("Reject Certificate Error:", err);
        showToast("❌ Failed to reject certificate request.");
    }
};

window.loadFinanceRevenueLog = async function() {
    const payoutSpan = document.getElementById("adminTutorPayoutAmount");
    const commissionSpan = document.getElementById("adminPlatformCommissionAmount");
    const payoutBar = document.getElementById("adminTutorPayoutProgressBar");
    const commissionBar = document.getElementById("adminPlatformCommissionProgressBar");

    if (!payoutSpan && !commissionSpan) return;

    try {
        const res = await fetch("/api/admin/finance-revenue");
        const data = await res.json();
        if (data.success) {
            const gross = data.grossRevenue || 0;
            const payout = data.tutorPayout || 0;
            const commission = data.platformCommission || 0;

            const formattedPayout = `₹${payout.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            const formattedCommission = `₹${commission.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

            if (payoutSpan) payoutSpan.textContent = formattedPayout;
            if (commissionSpan) commissionSpan.textContent = formattedCommission;

            if (payoutBar) payoutBar.style.width = gross > 0 ? "85%" : "0%";
            if (commissionBar) commissionBar.style.width = gross > 0 ? "15%" : "0%";
        }
    } catch (err) {
        console.error("Load Finance Revenue Log Error:", err);
    }
};

window.loadSubjectsCatalog = async function() {
    const subjContainer = document.getElementById("adminSubjectsContainer");
    if (!subjContainer) return;

    try {
        const res = await fetch("/api/admin/subjects");
        const data = await res.json();
        if (data.success && data.subjects) {
            if (data.subjects.length === 0) {
                subjContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 30px; grid-column: 1 / -1;">No subject categories added yet. Click "Add Subject" above to create one.</div>`;
            } else {
                subjContainer.innerHTML = data.subjects.map(s => `
                    <div style="padding: 16px; border: 1px solid var(--border-color); border-radius: 12px; background: #f8fafc; display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                                <h4 style="margin: 0; color: #0f2a4a; font-size: 15px; font-weight: 700;">${s.name}</h4>
                                <span class="role-badge badge-tutor" style="font-size: 10px;">${s.category}</span>
                            </div>
                            <span style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 8px;">Grade/Class: ${s.grade}</span>
                            ${s.description ? `<p style="font-size: 12px; color: #475569; margin: 0 0 10px 0; line-height: 1.4;">${s.description}</p>` : ''}
                        </div>
                        <div style="display: flex; justify-content: flex-end; margin-top: 10px; border-top: 1px solid #e2e8f0; padding-top: 8px;">
                            <button class="dash-btn dash-btn-outline" style="padding: 3px 8px; font-size: 11px; color: #dc2626; border-color: #fca5a5;" onclick="window.deleteSubjectAction('${s._id}')">
                                <i class="fa-solid fa-trash-can"></i> Remove
                            </button>
                        </div>
                    </div>
                `).join("");
            }
        }
    } catch (err) {
        console.error("Load Subjects Error:", err);
    }
};

window.openAddSubjectModal = function() {
    const form = document.getElementById("addSubjectForm");
    if (form) form.reset();
    const modal = document.getElementById("addSubjectModal");
    if (modal) {
        modal.style.display = "flex";
        modal.classList.add("open");
    }
};

window.submitAddSubjectForm = async function(event) {
    event.preventDefault();
    const name = document.getElementById("subjName")?.value || "";
    const category = document.getElementById("subjCategory")?.value || "";
    const grade = document.getElementById("subjGrade")?.value || "";
    const description = document.getElementById("subjDescription")?.value || "";

    try {
        const res = await fetch("/api/admin/subjects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, category, grade, description })
        });

        const data = await res.json();
        if (data.success) {
            showToast(`✅ ${data.message}`);
            closeModal("addSubjectModal");
            const form = document.getElementById("addSubjectForm");
            if (form) form.reset();
            window.loadSubjectsCatalog();
        } else {
            showToast(`❌ ${data.message}`);
        }
    } catch (err) {
        console.error("Submit Add Subject Error:", err);
        showToast("❌ Server error adding subject.");
    }
};

window.deleteSubjectAction = async function(id) {
    const confirmed = window.showCustomConfirm
        ? await window.showCustomConfirm("Are you sure you want to remove this subject category?", "Remove Subject", "Remove", "Cancel")
        : confirm("Are you sure you want to remove this subject category?");
    if (!confirmed) return;
    try {
        const res = await fetch(`/api/admin/subjects/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) {
            showToast(`✅ ${data.message}`);
            window.loadSubjectsCatalog();
        } else {
            showToast(`❌ ${data.message}`);
        }
    } catch (err) {
        console.error("Delete Subject Error:", err);
    }
};

window.closePreviewDocModal = function() {
    const m = document.getElementById("previewDocModal");
    if (m) {
        m.classList.remove("open");
        m.style.display = "none";
        m.remove();
    }
};

window.previewTutorDocumentsModal = async function(tutorProfileId) {
    window.closePreviewDocModal();

    try {
        const docRes = await fetch("/api/admin/pending-documents");
        const docData = await docRes.json();
        const tutorsList = docData.tutors || docData.pendingDocuments || [];
        const tutor = tutorsList.find(t => String(t._id) === String(tutorProfileId));

        const tutorName = tutor && tutor.user ? tutor.user.name : "Tutor Credentials";
        const docs = (tutor && Array.isArray(tutor.documents)) ? tutor.documents : [];

        let docRows = "";
        let isApproveEnabled = docs.length > 0;

        if (docs.length === 0) {
            docRows = `
                <div style="padding: 24px; background: #fff1f2; border: 1px solid #fecdd3; border-radius: 10px; text-align: center; color: #9f1239;">
                    <i class="fa-solid fa-file-circle-xmark" style="font-size: 28px; color: #e11d48; margin-bottom: 8px;"></i>
                    <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700;">No document uploaded.</p>
                    <span style="font-size: 12px; color: #be123c;">This tutor account has not submitted any identity cards, academic diplomas, or teaching certifications.</span>
                </div>
            `;
        } else {
            docRows = docs.map((d, index) => {
                const docName = d.name || d.docType || d.type || `Document #${index + 1}`;
                const uploadDate = d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A";
                const docStatus = d.status || "Pending";
                const statusBadgeStyle = docStatus === "Approved" ? "background: #dcfce7; color: #15803d;" : docStatus === "Rejected" ? "background: #fee2e2; color: #b91c1c;" : "background: #fef3c7; color: #b45309;";
                const rawUrl = d.fileUrl || d.url || "";
                const hasValidFile = rawUrl && !rawUrl.includes("example.com") && !rawUrl.includes("demo.pdf");
                const fileUrl = hasValidFile ? rawUrl : "";

                return `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 12px;">
                        <div>
                            <div style="font-weight: 700; font-size: 14px; color: #0f172a; margin-bottom: 4px;">
                                <i class="fa-solid fa-file-contract" style="color: #b45309; margin-right: 6px;"></i> ${docName}
                            </div>
                            <div style="display: flex; gap: 12px; align-items: center; font-size: 12px; color: #64748b;">
                                <span><i class="fa-solid fa-calendar-days"></i> Uploaded: ${uploadDate}</span>
                                <span style="padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 700; ${statusBadgeStyle}">${docStatus.toUpperCase()}</span>
                            </div>
                        </div>
                        ${fileUrl ? `
                            <a href="${fileUrl}" target="_blank" rel="noopener noreferrer" class="dash-btn dash-btn-outline" style="padding: 6px 14px; font-size: 12px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
                                <i class="fa-solid fa-arrow-up-right-from-square"></i> Inspect Document
                            </a>
                        ` : `
                            <span style="font-size: 11px; color: #94a3b8; font-style: italic;">No document file uploaded.</span>
                        `}
                    </div>
                `;
            }).join("");
        }

        const modalHTML = `
            <div class="dash-modal-backdrop open" id="previewDocModal" style="display: flex; z-index: 1250;" onclick="if(event.target === this) window.closePreviewDocModal();">
                <div class="dash-modal-content" style="max-width: 600px; width: 95%;">
                    <div class="dash-modal-header" style="background: #0f2a4a; color: #ffffff;">
                        <h3 style="margin: 0; font-size: 18px; color: #ffffff;"><i class="fa-solid fa-id-card"></i> ${tutorName} - KYC Credentials</h3>
                        <button class="dash-modal-close" onclick="window.closePreviewDocModal()" style="color: #ffffff;">&times;</button>
                    </div>
                    <div class="dash-modal-body" style="padding: 20px;">
                        <p style="font-size: 13px; color: #64748b; margin-bottom: 16px;">
                            Official tutor verification records and uploaded credentials. Inspect uploaded files before approving verification status.
                        </p>
                        ${docRows}
                        <div style="display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end;">
                            <button type="button" class="dash-btn dash-btn-outline" onclick="window.closePreviewDocModal()">Close</button>
                            ${isApproveEnabled ? `
                                <button type="button" class="dash-btn dash-btn-primary" onclick="window.closePreviewDocModal(); window.verifyTutorDocumentAction('${tutorProfileId}', 'approved');">
                                    <i class="fa-solid fa-check"></i> Approve Application
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    } catch (err) {
        console.error("Preview Document Error:", err);
    }
};

window.verifyTutorDocumentAction = async function(tutorProfileId, status) {
    try {
        const res = await fetch(`/api/admin/document-verify/${tutorProfileId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        });
        const data = await res.json();
        if (data.success) {
            showToast(`✅ ${data.message}`);
            window.closePreviewDocModal();
            loadAdminDashboardData();
        } else {
            showToast(`❌ ${data.message}`);
        }
    } catch (err) {
        console.error("Verify Document Error:", err);
    }
};

// ==========================================
// SECURITY CENTER & THREAT AUDIT MONITOR
// ==========================================
window.CURRENT_SECURITY_LOGS = [];
window.FILTERED_SECURITY_LOGS = [];
window.SEC_CURRENT_PAGE = 1;
window.SEC_PAGE_SIZE = 10;

window.openSecurityCenterModal = async function() {
    const modal = document.getElementById('securityCenterModal');
    if (modal) {
        modal.classList.add('open');
        modal.style.display = 'flex';
    }
    const tbody = document.getElementById("securityAuditTableBody");
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 25px; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Loading security audit logs from database...</td></tr>`;
    }

    try {
        const res = await fetch("/api/admin/security-audit");
        const data = await res.json();

        if (data.success) {
            window.CURRENT_SECURITY_LOGS = data.logs || [];
            window.SEC_CURRENT_PAGE = 1;
            
            // Update Stat Cards
            const stats = data.stats || {};
            if (document.getElementById("secStatLogins")) document.getElementById("secStatLogins").textContent = stats.totalLogins || 0;
            if (document.getElementById("secStatFailed")) document.getElementById("secStatFailed").textContent = stats.failedLogins || 0;
            if (document.getElementById("secStatCritical")) document.getElementById("secStatCritical").textContent = stats.criticalAlerts || 0;
            if (document.getElementById("secStatPass")) document.getElementById("secStatPass").textContent = (stats.passwordResets || 0) + (stats.otpVerifications || 0);

            filterSecurityLogs();
        } else {
            if (typeof showToast === 'function') showToast(`❌ ${data.message || "Failed to load security logs"}`);
        }
    } catch (err) {
        console.error("Security Center Audit Error:", err);
    }
};

window.filterSecurityLogs = function(resetPage = true) {
    if (resetPage) window.SEC_CURRENT_PAGE = 1;

    const searchText = (document.getElementById("secSearchInput")?.value || "").toLowerCase().trim();
    const timeRange = document.getElementById("secTimeFilter")?.value || "all";
    const severity = document.getElementById("secSeverityFilter")?.value || "all";
    const category = document.getElementById("secCategoryFilter")?.value || "all";
    const tbody = document.getElementById("securityAuditTableBody");
    if (!tbody) return;

    const now = new Date();
    window.FILTERED_SECURITY_LOGS = (window.CURRENT_SECURITY_LOGS || []).filter(log => {
        const logDate = new Date(log.createdAt);

        // Time Range Filter
        if (timeRange === "today") {
            if (logDate.toDateString() !== now.toDateString()) return false;
        } else if (timeRange === "7days") {
            const diffDays = (now - logDate) / (1000 * 60 * 60 * 24);
            if (diffDays > 7) return false;
        } else if (timeRange === "30days") {
            const diffDays = (now - logDate) / (1000 * 60 * 60 * 24);
            if (diffDays > 30) return false;
        }

        // Severity Filter
        if (severity !== "all") {
            const logSev = log.severity || "info";
            if (logSev !== severity) return false;
        }

        // Category Filter
        if (category !== "all" && log.category !== category) return false;

        // Search Text Filter
        if (searchText) {
            const userName = log.user ? log.user.name || "" : "";
            const userEmail = log.user ? log.user.email || "" : (log.userEmail || "");
            const action = log.action || "";
            const ip = log.ipAddress || "";
            const matchStr = `${userName} ${userEmail} ${action} ${ip}`.toLowerCase();
            if (!matchStr.includes(searchText)) return false;
        }

        return true;
    });

    renderSecTablePage();
};

window.renderSecTablePage = function() {
    const tbody = document.getElementById("securityAuditTableBody");
    if (!tbody) return;

    const total = window.FILTERED_SECURITY_LOGS.length;
    if (total === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 25px; color: var(--text-muted);">No security events match the selected criteria.</td></tr>`;
        updateSecPaginationUI(0, 0, 0);
        return;
    }

    const totalPages = Math.ceil(total / window.SEC_PAGE_SIZE);
    if (window.SEC_CURRENT_PAGE > totalPages) window.SEC_CURRENT_PAGE = totalPages;
    if (window.SEC_CURRENT_PAGE < 1) window.SEC_CURRENT_PAGE = 1;

    const startIdx = (window.SEC_CURRENT_PAGE - 1) * window.SEC_PAGE_SIZE;
    const endIdx = Math.min(startIdx + window.SEC_PAGE_SIZE, total);
    const pageData = window.FILTERED_SECURITY_LOGS.slice(startIdx, endIdx);

    tbody.innerHTML = pageData.map(l => {
        const timeStr = new Date(l.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "medium" });
        const userDisplay = l.user 
            ? `<div style="font-weight: 700; color: #0f172a;">${l.user.name || 'User'}</div><span style="font-size: 11px; color: #64748b;">${l.user.email}</span>`
            : `<div style="font-weight: 700; color: #475569;">${l.userEmail || 'System / Guest'}</div>`;

        let severityBadge = `<span class="status-pill" style="background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0;">INFO</span>`;
        if (l.severity === "critical" || l.action.toLowerCase().includes("unauthorized") || l.action.toLowerCase().includes("invalid")) {
            severityBadge = `<span class="status-pill" style="background: #fef2f2; color: #dc2626; border: 1px solid #fca5a5; font-weight: 800;"><i class="fa-solid fa-triangle-exclamation"></i> CRITICAL</span>`;
        } else if (l.severity === "warning" || l.action.toLowerCase().includes("failed")) {
            severityBadge = `<span class="status-pill" style="background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; font-weight: 700;">WARNING</span>`;
        }

        const catBadge = (l.category || "user_action").toUpperCase();

        return `
            <tr style="${l.severity === 'critical' ? 'background: #fff5f5;' : ''}">
                <td style="font-size: 12px; font-weight: 600; white-space: nowrap;">${timeStr}</td>
                <td>${severityBadge}</td>
                <td><span style="font-size: 10px; font-weight: 800; background: #e2e8f0; color: #334155; padding: 2px 6px; border-radius: 4px;">${catBadge}</span></td>
                <td>${userDisplay}</td>
                <td style="font-size: 13px; font-weight: 600; color: ${l.severity === 'critical' ? '#991b1b' : '#1e293b'};">${l.action}</td>
                <td><code style="font-size: 11px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #475569;">${l.ipAddress || '127.0.0.1'}</code></td>
            </tr>
        `;
    }).join("");

    updateSecPaginationUI(startIdx + 1, endIdx, total);
};

function updateSecPaginationUI(start, end, total) {
    const infoSpan = document.getElementById("secPaginationInfo");
    const pageSpan = document.getElementById("secPageNumber");
    const prevBtn = document.getElementById("secPrevBtn");
    const nextBtn = document.getElementById("secNextBtn");

    if (infoSpan) infoSpan.textContent = `Showing ${start}-${end} of ${total} events`;
    if (pageSpan) pageSpan.textContent = `Page ${window.SEC_CURRENT_PAGE} of ${Math.ceil(total / window.SEC_PAGE_SIZE) || 1}`;
    if (prevBtn) prevBtn.disabled = (window.SEC_CURRENT_PAGE <= 1);
    if (nextBtn) nextBtn.disabled = (window.SEC_CURRENT_PAGE >= Math.ceil(total / window.SEC_PAGE_SIZE));
}

window.prevSecPage = function() {
    if (window.SEC_CURRENT_PAGE > 1) {
        window.SEC_CURRENT_PAGE--;
        renderSecTablePage();
    }
};

window.nextSecPage = function() {
    const totalPages = Math.ceil(window.FILTERED_SECURITY_LOGS.length / window.SEC_PAGE_SIZE);
    if (window.SEC_CURRENT_PAGE < totalPages) {
        window.SEC_CURRENT_PAGE++;
        renderSecTablePage();
    }
};

window.exportSecurityLogsCSV = function() {
    if (!window.FILTERED_SECURITY_LOGS || window.FILTERED_SECURITY_LOGS.length === 0) {
        showToast("⚠️ No security logs to export.");
        return;
    }

    const headers = ["Timestamp", "Severity", "Category", "User / Initiator", "User Email", "Action Detail", "Client IP"];
    const rows = window.FILTERED_SECURITY_LOGS.map(l => [
        `"${new Date(l.createdAt).toISOString()}"`,
        `"${(l.severity || 'info').toUpperCase()}"`,
        `"${(l.category || 'user_action').toUpperCase()}"`,
        `"${l.user ? (l.user.name || '') : ''}"`,
        `"${l.user ? l.user.email : (l.userEmail || '')}"`,
        `"${(l.action || '').replace(/"/g, '""')}"`,
        `"${l.ipAddress || '127.0.0.1'}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `security_audit_logs_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("✅ Security audit CSV report downloaded successfully!");
};

// Add & Link Child Profile Modal System
window.openAddChildModal = function() {
    let modal = document.getElementById("addChildModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "addChildModal";
        modal.className = "dash-modal open";
        modal.style.display = "flex";
        modal.innerHTML = `
            <div class="dash-modal-content" style="max-width: 520px; padding: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">
                    <h3 style="margin: 0; color: #0f2a4a; font-size: 18px; font-weight: 800; display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-user-plus" style="color: #7e22ce;"></i> Add & Link Child Profile
                    </h3>
                    <button type="button" style="background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer;" onclick="document.getElementById('addChildModal').remove()">&times;</button>
                </div>
                <form id="addChildForm" onsubmit="handleAddChildSubmit(event)">
                    <div style="margin-bottom: 14px;">
                        <label style="display: block; font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">Child's Registered Student Email <span style="color: #dc2626;">*</span></label>
                        <input type="email" id="addChildEmail" class="dash-input" placeholder="e.g. student@hometutor.com" required style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px;" />
                        <span style="font-size: 11px; color: #64748b;">Must match an existing registered student account email.</span>
                    </div>
                    <div style="margin-bottom: 14px;">
                        <label style="display: block; font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">Child Display Name (Optional)</label>
                        <input type="text" id="addChildName" class="dash-input" placeholder="Child's Full Name (defaults to student account name)" style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px;" />
                    </div>
                    <div style="margin-bottom: 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div>
                            <label style="display: block; font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">Grade / Class <span style="color: #dc2626;">*</span></label>
                            <input type="text" id="addChildGrade" class="dash-input" placeholder="e.g. Class 10 (Class 1 to 12)" required style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px;" />
                        </div>
                        <div>
                            <label style="display: block; font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">School Name</label>
                            <input type="text" id="addChildSchool" class="dash-input" placeholder="e.g. St. Xavier School" style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px;" />
                        </div>
                    </div>
                    <div style="margin-bottom: 18px;">
                        <label style="display: block; font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">Subjects Needed</label>
                        <input type="text" id="addChildSubjects" class="dash-input" placeholder="e.g. Mathematics, Physics" style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px;" />
                    </div>
                    <div id="addChildErrorMsg" style="display: none; padding: 10px 14px; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 6px; color: #991b1b; font-size: 13px; margin-bottom: 14px;"></div>
                    <div style="display: flex; justify-content: flex-end; gap: 10px;">
                        <button type="button" class="dash-btn dash-btn-outline" onclick="document.getElementById('addChildModal').remove()">Cancel</button>
                        <button type="submit" id="addChildSubmitBtn" class="dash-btn dash-btn-primary" style="background: #7e22ce;">Link Child Profile</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
    } else {
        modal.classList.add("open");
        modal.style.display = "flex";
    }
};

window.handleAddChildSubmit = async function(e) {
    e.preventDefault();
    const email = document.getElementById("addChildEmail").value.trim();
    const name = document.getElementById("addChildName").value.trim();
    const grade = document.getElementById("addChildGrade").value.trim();
    const school = document.getElementById("addChildSchool").value.trim();
    const subjectsNeeded = document.getElementById("addChildSubjects").value.trim();
    const errorDiv = document.getElementById("addChildErrorMsg");
    const submitBtn = document.getElementById("addChildSubmitBtn");

    if (!email || !grade) {
        if (errorDiv) {
            errorDiv.textContent = "Child student email and grade are required.";
            errorDiv.style.display = "block";
        }
        return;
    }

    try {
        if (submitBtn) submitBtn.disabled = true;
        if (errorDiv) errorDiv.style.display = "none";

        const res = await fetch("/api/parent/child", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, name, grade, school, subjectsNeeded }),
        });
        const data = await res.json();

        if (res.ok && data.success) {
            if (typeof showToast === "function") {
                showToast("✅ " + (data.message || "Child profile linked successfully!"));
            }
            const modal = document.getElementById("addChildModal");
            if (modal) modal.remove();
            // Dynamically refresh children list & dashboard statistics without page reload
            window.loadParentDashboardData();
        } else {
            if (errorDiv) {
                errorDiv.textContent = data.message || "Failed to link child profile.";
                errorDiv.style.display = "block";
            } else if (typeof showToast === "function") {
                showToast("❌ " + (data.message || "Failed to link child profile."));
            }
        }
    } catch (err) {
        console.error("Add Child Error:", err);
        if (errorDiv) {
            errorDiv.textContent = "Server connection error. Please try again.";
            errorDiv.style.display = "block";
        }
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
};

window.triggerParentPrimaryPendingInvoicePay = function() {
    const pendingInvoices = window.CURRENT_PARENT_PENDING_INVOICES || [];
    if (pendingInvoices.length > 0) {
        const inv = pendingInvoices[0];
        window.triggerRazorpayInvoicePayment(inv.amount, inv.invoiceId, `Tuition Fee - ${inv.subject}`);
    } else {
        if (typeof showToast === 'function') {
            showToast("ℹ️ No pending real tuition invoices to pay.");
        }
    }
};

window.loadParentDashboardData = async function() {
    try {
        const res = await fetch("/api/parent/dashboard-stats");
        const data = await res.json();

        const activeDisplay = document.getElementById("parentActiveChildDisplay");
        const childrenContainer = document.getElementById("parentChildrenListContainer");
        const attendanceRateDisplay = document.getElementById("parentAttendanceRateDisplay");
        const attendanceSubDisplay = document.getElementById("parentAttendanceSubDisplay");
        const gradeScoreDisplay = document.getElementById("parentGradeScoreDisplay");
        const assignedTutorsDisplay = document.getElementById("parentAssignedTutorsDisplay");
        const pendingInvoicesDisplay = document.getElementById("parentPendingInvoicesDisplay");
        const subjectProgressContainer = document.getElementById("parentSubjectProgressContainer");
        const invoicesTableBody = document.getElementById("parentInvoicesTableBody");

        if (data.success) {
            const children = data.children || [];
            const stats = data.stats || {};
            const subjectProgress = data.subjectProgress || [];
            const invoices = data.invoices || [];

            // Global store for header pay button
            window.CURRENT_PARENT_PENDING_INVOICES = invoices.filter(i => i.status === "Pending");

            // Update Active Children Badge
            if (activeDisplay) {
                if (children.length === 0) {
                    activeDisplay.textContent = "No Linked Children";
                } else {
                    const childSummary = children.map(c => `${c.name} (${c.grade})`).join(", ");
                    activeDisplay.textContent = `Active Children: ${childSummary}`;
                }
            }

            // Update Stats Grid Cards
            if (attendanceRateDisplay) {
                attendanceRateDisplay.textContent = stats.attendanceRate || "N/A";
            }
            if (attendanceSubDisplay) {
                if (stats.totalClasses > 0) {
                    attendanceSubDisplay.innerHTML = `<i class="fa-solid fa-check-double"></i> ${stats.attendedClasses}/${stats.totalClasses} Classes Attended`;
                } else {
                    attendanceSubDisplay.innerHTML = `<i class="fa-solid fa-calendar-check"></i> No Classes Scheduled Yet`;
                }
            }
            if (gradeScoreDisplay) {
                gradeScoreDisplay.textContent = stats.averageGradeScore || "N/A";
            }
            if (assignedTutorsDisplay) {
                assignedTutorsDisplay.textContent = `${stats.assignedTutorsCount || 0} Educators`;
            }
            if (pendingInvoicesDisplay) {
                pendingInvoicesDisplay.textContent = `₹${(stats.pendingInvoicesAmount || 0).toLocaleString('en-IN')}`;
            }

            // Update Linked Children Profiles Card
            if (childrenContainer) {
                if (children.length === 0) {
                    childrenContainer.innerHTML = `
                        <div style="text-align: center; padding: 24px; background: #f8fafc; border-radius: 10px; border: 1px dashed #cbd5e1;">
                            <i class="fa-solid fa-child" style="font-size: 32px; color: #94a3b8; margin-bottom: 8px; display: block;"></i>
                            <h4 style="margin: 0 0 4px 0; color: #1e293b; font-size: 14px; font-weight: 700;">No children linked yet</h4>
                            <p style="margin: 0 0 12px 0; color: #64748b; font-size: 12px;">Link your child's registered student account to monitor progress and view certificates.</p>
                            <button class="dash-btn dash-btn-primary" style="background: #7e22ce; font-size: 12px; padding: 5px 14px;" onclick="openAddChildModal()"><i class="fa-solid fa-user-plus"></i> Link First Child Profile</button>
                        </div>
                    `;
                } else {
                    childrenContainer.innerHTML = children.map(c => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff; margin-bottom: 8px;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: #f3e8ff; color: #7e22ce; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px;">
                                    ${(c.name || 'C').substring(0, 1).toUpperCase()}
                                </div>
                                <div>
                                    <h4 style="margin: 0; font-size: 14px; font-weight: 700; color: #0f2a4a;">${c.name} <span style="font-size: 11px; font-weight: 600; background: #f3e8ff; color: #7e22ce; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">${c.grade}</span></h4>
                                    <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">
                                        <i class="fa-solid fa-envelope" style="font-size: 11px;"></i> ${c.email || (c.student ? c.student.email : 'N/A')}
                                        ${c.school ? ` &bull; <i class="fa-solid fa-school" style="font-size: 11px;"></i> ${c.school}` : ''}
                                    </p>
                                </div>
                            </div>
                            <div style="display: flex; gap: 6px;">
                                <button class="dash-btn dash-btn-outline" style="font-size: 11px; padding: 4px 8px; color: #7e22ce; border-color: #d8b4fe;" onclick="openParentCertificatesModal()">
                                    <i class="fa-solid fa-award"></i> View Certificates
                                </button>
                            </div>
                        </div>
                    `).join("");
                }
            }

            // Render Dynamic Subject Progress Bars & Attendance + Exactly ONE Display-Only Sample Demo Record
            window.renderParentSubjectProgress(subjectProgress);

            // Render Dynamic Real MongoDB Invoices Only
            if (invoicesTableBody) {
                if (invoices.length === 0) {
                    invoicesTableBody.innerHTML = `
                        <tr>
                            <td colspan="6" style="padding: 20px; background: #f8fafc; color: #64748b; font-size: 13px; text-align: center;">
                                <i class="fa-solid fa-circle-check" style="color: #16a34a; margin-right: 6px;"></i> No pending invoices.
                            </td>
                        </tr>
                    `;
                } else {
                    invoicesTableBody.innerHTML = invoices.map(inv => {
                        const statusBadge = inv.status === "Paid"
                            ? `<span class="status-pill status-active" style="background: #dcfce7; color: #15803d; font-weight: bold; padding: 4px 10px; border-radius: 20px; font-size: 11px;"><i class="fa-solid fa-circle-check"></i> Paid</span>`
                            : `<button class="dash-btn dash-btn-primary" style="padding: 4px 10px; font-size: 12px; background: #7e22ce;" onclick="triggerRazorpayInvoicePayment(${inv.amount}, '${inv.invoiceId}', 'Tuition Fee - ${inv.subject}')"><i class="fa-solid fa-credit-card"></i> Pay ₹${inv.amount.toLocaleString('en-IN')}</button>`;

                        return `
                            <tr>
                                <td><strong>#${inv.invoiceId}</strong></td>
                                <td><strong>${inv.studentName}</strong></td>
                                <td>${inv.tutorName} <span style="color: #64748b;">(${inv.subject})</span></td>
                                <td>${inv.dueDate}</td>
                                <td><strong>₹${inv.amount.toLocaleString('en-IN')}</strong></td>
                                <td>${statusBadge}</td>
                            </tr>
                        `;
                    }).join("");
                }
            }

            // Render Dynamic Assigned Tutors List in Chat Tab
            const assignedTutorsListContainer = document.getElementById("parentAssignedTutorsChatList");
            const assignedTutors = data.assignedTutors || [];

            if (assignedTutorsListContainer) {
                if (assignedTutors.length === 0) {
                    assignedTutorsListContainer.innerHTML = `
                        <div style="text-align: center; padding: 30px; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;">
                            <i class="fa-solid fa-comments" style="font-size: 36px; color: #94a3b8; margin-bottom: 8px; display: block;"></i>
                            <h4 style="font-size: 14px; font-weight: 700; color: #1e293b; margin: 0 0 4px 0;">No tutors assigned yet</h4>
                            <p style="font-size: 12px; color: #64748b; margin: 0;">Once your linked children have scheduled classes or active tutor bookings, assigned educators will appear here for direct 1-to-1 real-time chat.</p>
                        </div>
                    `;
                } else {
                    assignedTutorsListContainer.innerHTML = assignedTutors.map(t => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; border: 1px solid #e2e8f0; border-radius: 10px; background: #ffffff; margin-bottom: 12px;">
                            <div style="display: flex; align-items: center; gap: 14px;">
                                <div style="width: 44px; height: 44px; border-radius: 50%; background: #f3e8ff; color: #7e22ce; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px;">
                                    ${(t.name || 'T').substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h4 style="margin: 0; font-size: 15px; font-weight: 700; color: #0f2a4a;">
                                        ${t.name} <span style="font-size: 11px; font-weight: 600; background: #e0f2fe; color: #0284c7; padding: 2px 8px; border-radius: 4px; margin-left: 6px;">${t.subject}</span>
                                    </h4>
                                    <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">
                                        <i class="fa-solid fa-child" style="color: #7e22ce;"></i> Educator for <strong>${t.childName}</strong> &bull; <i class="fa-solid fa-envelope"></i> ${t.email}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <button class="dash-btn dash-btn-primary" style="background: #7e22ce; font-size: 12px; padding: 6px 14px;" onclick="openChatDrawer('${t._id}', '${t.name.replace(/'/g, "\\'")}')">
                                    <i class="fa-solid fa-comment-dots"></i> Open Chat
                                </button>
                            </div>
                        </div>
                    `).join("");
                }
            }
        }
    } catch (err) {
        console.error("Load Parent Dashboard Error:", err);
        window.renderParentSubjectProgress([]);
    }
};

window.renderParentSubjectProgress = function(subjectProgress = []) {
    const container = document.getElementById("parentSubjectProgressContainer");
    if (!container) return;

    let realProgressHtml = "";
    if (Array.isArray(subjectProgress) && subjectProgress.length > 0) {
        realProgressHtml = subjectProgress.map(sp => `
            <div style="margin-bottom: 14px;">
                <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 700; margin-bottom: 4px;">
                    <span>${sp.subject} &bull; ${sp.tutorName}${sp.childName ? ` (${sp.childName})` : ''}</span>
                    <span style="color: ${sp.progressBarColor}; font-weight: 700;">${sp.gradeLabel} &bull; ${sp.attendancePercentage}% Attendance</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width: ${Math.max(5, sp.gradePercentage)}%; background: ${sp.progressBarColor};"></div>
                </div>
            </div>
        `).join("");
    }

    const sampleDemoHtml = `
        <div style="background: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; padding: 14px 16px; border-radius: 10px;">
            <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 700; color: #0f2a4a; margin-bottom: 6px;">
                <span>
                    Calculus & Mathematics &bull; Dr. Sarah Jenkins
                    <span style="font-size: 10px; font-weight: 800; color: #b45309; background: #fef3c7; border: 1px solid #fcd34d; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px; margin-left: 8px;">
                        <i class="fa-solid fa-flask"></i> Sample Demo Record
                    </span>
                </span>
                <span style="color: #15803d; font-weight: 700;">Grade A (96%) &bull; 100% Attendance</span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: 96%; background: #15803d;"></div>
            </div>
        </div>
    `;

    container.innerHTML = realProgressHtml + sampleDemoHtml;
};

window.loadPublicContent = async function() {
    const blogContainers = document.querySelectorAll("#publicBlogsContainer, .blog-dynamic-container");
    if (blogContainers.length > 0) {
        try {
            const res = await fetch("/api/content/blogs");
            const data = await res.json();
            if (data.success && data.blogs && data.blogs.length > 0) {
                const html = data.blogs.map(b => `
                    <div style="padding: 18px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.04); display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <span style="font-size: 11px; font-weight: 700; color: var(--primary); background: #e0f2fe; padding: 3px 10px; border-radius: 12px; display: inline-block; margin-bottom: 8px;">${b.category || 'Article'}</span>
                            <h4 style="margin: 0 0 8px 0; color: #0f2a4a; font-size: 16px; font-weight: 700;">${b.title}</h4>
                            <p style="margin: 0 0 12px 0; color: #64748b; font-size: 13px; line-height: 1.5;">${b.content ? b.content.substring(0, 130) : ''}...</p>
                        </div>
                        <div style="font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 8px; display: flex; justify-content: space-between; align-items: center;">
                            <span><i class="fa-solid fa-user-pen"></i> ${b.author || 'Academic Team'}</span>
                            <span><i class="fa-solid fa-clock"></i> ${b.readTime || '5 min read'}</span>
                        </div>
                    </div>
                `).join("");
                blogContainers.forEach(c => c.innerHTML = html);
            } else {
                blogContainers.forEach(c => c.innerHTML = `<div style="padding: 16px; color: #64748b; grid-column: 1/-1;">No blog articles published yet.</div>`);
            }
        } catch (e) {
            console.error(e);
        }
    }
};

window.exportAdminPdfReport = function() {
    showToast("Generating & downloading platform audit PDF report...");
    const link = document.createElement("a");
    link.href = "/api/admin/export-pdf-report";
    link.download = `SmartHomeTutor_Admin_Platform_Audit_Report_${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

window.loadStudentScheduleTable = async function() {
    const tbody = document.getElementById("studentClassScheduleTableBody");
    if (!tbody) return;

    try {
        const res = await fetch("/api/student/class-schedule");
        const data = await res.json();
        if (!data.success) return;

        const schedules = data.schedules || [];
        const acceptedBookings = data.acceptedBookings || [];

        if (schedules.length === 0 && acceptedBookings.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px 20px; color: #64748b;">
                        <i class="fa-solid fa-calendar-xmark" style="font-size: 36px; color: #94a3b8; margin-bottom: 12px;"></i>
                        <h4 style="font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 4px 0;">No Active Classes or Schedules Found</h4>
                        <p style="font-size: 13px; color: #64748b; margin: 0;">Once your booked tutor accepts your request, your regular class schedule will appear here.</p>
                    </td>
                </tr>
            `;
            return;
        }

        let html = "";

        // Render Scheduled Classes from ClassSchedule collection
        schedules.forEach(s => {
            const tutorName = s.tutor ? s.tutor.name : "Assigned Tutor";
            const dateStr = s.date ? new Date(s.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Scheduled";
            const timing = `${s.startTime || '18:00'} - ${s.endTime || '19:00'}`;

            let statusBadge = `<span class="status-pill status-active">${s.status || 'Scheduled'}</span>`;
            if (s.status === "Completed") statusBadge = `<span class="status-pill status-completed">Completed</span>`;
            if (s.status === "Cancelled") statusBadge = `<span class="status-pill status-danger">Cancelled</span>`;

            let actionBtn = `<button class="dash-btn dash-btn-outline" style="padding: 4px 10px; font-size: 12px;" onclick="openStudentChatWithTutor('${s.tutor ? s.tutor._id : ''}')"><i class="fa-solid fa-comments"></i> Message</button>`;
            if (s.status === "Scheduled" || s.status === "Rescheduled") {
                actionBtn = `<button class="dash-btn dash-btn-primary" style="padding: 4px 10px; font-size: 12px;" onclick="triggerStudentVideoCall()"><i class="fa-solid fa-video"></i> Join HD Video</button>`;
            }

            html += `
                <tr>
                    <td>
                        <div style="font-weight: 700; color: #0f2a4a;">${s.subject}</div>
                        <span style="font-size: 11px; color: var(--text-muted);">${tutorName}</span>
                    </td>
                    <td>Regular Session</td>
                    <td>${dateStr} &bull; ${timing}</td>
                    <td>${statusBadge} <small style="font-size: 10px; color: #64748b; margin-left: 4px;">(${s.attendance || 'Pending'})</small></td>
                    <td>${actionBtn}</td>
                </tr>
            `;
        });

        // Render Accepted Booking Requests
        acceptedBookings.forEach(b => {
            const tutorName = b.tutor ? b.tutor.name : "Assigned Tutor";
            const tutorId = b.tutor ? b.tutor._id : "";
            const subStr = b.tutorProfile && b.tutorProfile.subjects && b.tutorProfile.subjects.length ? b.tutorProfile.subjects.join(", ") : "Tuition Class";

            html += `
                <tr>
                    <td>
                        <div style="font-weight: 700; color: #0f2a4a;">${subStr}</div>
                        <span style="font-size: 11px; color: var(--text-muted);">${tutorName}</span>
                    </td>
                    <td>Regular Accepted Tuition</td>
                    <td>Weekly Sessions Active</td>
                    <td><span class="status-pill status-active">Active Tuition</span></td>
                    <td>
                        <div style="display: flex; gap: 6px;">
                            <button class="dash-btn dash-btn-primary" style="padding: 4px 10px; font-size: 12px;" onclick="triggerStudentVideoCall()"><i class="fa-solid fa-video"></i> Join HD Video</button>
                            <button class="dash-btn dash-btn-outline" style="padding: 4px 10px; font-size: 12px;" onclick="openStudentChatWithTutor('${tutorId}')"><i class="fa-solid fa-comments"></i> Message</button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    } catch (err) {
        console.error("Load Student Class Schedule Error:", err);
    }
};

window.openStudentChatWithTutor = function(tutorId) {
    const tabBtn = document.querySelector('[data-tab="chat"]');
    if (tabBtn) tabBtn.click();
    if (tutorId && typeof selectStudentTutorConversation === "function") {
        selectStudentTutorConversation(tutorId);
    }
};

window.loadStudentWalletAndInvoices = async function() {
    const walletEl = document.getElementById("walletBalanceDisplay");
    const tbody = document.getElementById("studentInvoicesTableBody");

    if (!walletEl && !tbody) return;

    try {
        const res = await fetch("/api/student/dashboard-stats");
        const data = await res.json();
        if (!data.success) return;

        const balance = (data.stats && data.stats.walletBalance !== undefined) ? data.stats.walletBalance : 0;
        const formattedBalance = `₹${balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        if (walletEl) walletEl.innerText = formattedBalance;

        const transactions = data.transactions || [];
        if (tbody) {
            if (transactions.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 30px 20px; color: #64748b;">
                            <i class="fa-solid fa-receipt" style="font-size: 32px; color: #94a3b8; margin-bottom: 8px;"></i>
                            <h4 style="font-size: 15px; font-weight: 700; color: #1e293b; margin: 0 0 4px 0;">No Payment History or Invoices Found</h4>
                            <p style="font-size: 12px; color: #64748b; margin: 0;">Top up credits or pay tuition fees to see your invoices listed here.</p>
                        </td>
                    </tr>
                `;
            } else {
                tbody.innerHTML = transactions.map(t => {
                    const invId = `#INV-${t._id.toString().slice(-6).toUpperCase()}`;
                    const dateStr = t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A";
                    const amountStr = `₹${(t.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    let statusPill = `<span class="status-pill status-completed">Paid</span>`;
                    if (t.status === "Pending") statusPill = `<span class="status-pill status-active">Pending</span>`;
                    if (t.status === "Failed") statusPill = `<span class="status-pill status-danger">Failed</span>`;

                    return `
                        <tr>
                            <td>${invId}</td>
                            <td>${t.description || t.type || 'Wallet Topup'}</td>
                            <td>${dateStr}</td>
                            <td><strong>${amountStr}</strong></td>
                            <td>${statusPill}</td>
                        </tr>
                    `;
                }).join("");
            }
        }
    } catch (err) {
        console.error("Load Student Wallet & Invoices Error:", err);
    }
};

window.loadStudentDashboardOverview = async function() {
    try {
        const res = await fetch("/api/student/dashboard-stats");
        const data = await res.json();
        if (!data.success) return;

        const stats = data.stats || {};
        const upcomingClasses = data.upcomingClasses || [];
        const bookings = data.bookings || [];

        const upcomingEl = document.getElementById("studentUpcomingCount");
        if (upcomingEl) upcomingEl.innerText = stats.upcomingClassesCount || 0;

        const hoursEl = document.getElementById("studentLearningHours");
        if (hoursEl) hoursEl.innerText = `${((stats.completedClassesCount || 0) * 1.5).toFixed(1)} hrs`;

        const hoursSubEl = document.getElementById("studentLearningHoursSub");
        if (hoursSubEl) hoursSubEl.innerHTML = `<i class="fa-solid fa-check"></i> ${stats.completedClassesCount || 0} classes completed`;

        const tutorsEl = document.getElementById("studentActiveTutorsCount");
        if (tutorsEl) tutorsEl.innerText = `${stats.activeTutorsCount || 0} Tutors`;

        const tutorsSubEl = document.getElementById("studentActiveTutorsSub");
        if (tutorsSubEl) tutorsSubEl.innerHTML = `<i class="fa-solid fa-graduation-cap"></i> Verified instructors`;

        const avgScoreEl = document.getElementById("studentAvgScore");
        if (avgScoreEl) avgScoreEl.innerText = `${stats.attendancePercentage || 100}%`;

        const avgScoreSubEl = document.getElementById("studentAvgScoreSub");
        if (avgScoreSubEl) avgScoreSubEl.innerHTML = `<i class="fa-solid fa-user-check"></i> Attendance rate`;

        const walletDisplayEl = document.getElementById("walletBalanceDisplay");
        if (walletDisplayEl) walletDisplayEl.innerText = `₹${(stats.walletBalance || 0).toLocaleString('en-IN')}.00`;

        const upcomingContainer = document.getElementById("studentUpcomingClassesContainer");
        if (upcomingContainer) {
            if (upcomingClasses.length === 0) {
                upcomingContainer.innerHTML = `
                    <div style="padding: 24px; text-align: center; color: #64748b; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;">
                        <i class="fa-solid fa-calendar-check" style="font-size: 32px; color: #cbd5e1; margin-bottom: 8px; display: block;"></i>
                        <h4 style="font-size: 15px; font-weight: 700; color: #1e293b; margin: 0 0 4px 0;">No Upcoming Classes Scheduled</h4>
                        <p style="font-size: 12px; color: #64748b; margin: 0;">Book a tuition session with a verified tutor to populate your schedule.</p>
                    </div>
                `;
            } else {
                upcomingContainer.innerHTML = upcomingClasses.map(cls => {
                    const tutorName = cls.tutor ? cls.tutor.name : "Verified Educator";
                    const subject = cls.subject || "Tuition";
                    const dateStr = cls.date ? new Date(cls.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) : "Scheduled Session";
                    const timeStr = cls.startTime || "18:00";

                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                            <div>
                                <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #0284c7; background: #e0f2fe; padding: 2px 6px; border-radius: 4px;">${subject}</span>
                                <h4 style="margin: 4px 0 2px 0; font-size: 15px; font-weight: 800; color: #0f2a4a;">${tutorName}</h4>
                                <p style="font-size: 12px; color: #64748b; margin: 0;"><i class="fa-solid fa-clock" style="color: #0284c7;"></i> ${dateStr} at ${timeStr}</p>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button class="dash-btn dash-btn-primary" style="padding: 6px 12px; font-size: 12px;" onclick="triggerStudentVideoCall()">
                                    <i class="fa-solid fa-video"></i> Join HD Video
                                </button>
                                <button class="dash-btn dash-btn-outline" style="padding: 6px 12px; font-size: 12px;" onclick="selectStudentChatTarget('${cls.tutor ? cls.tutor._id : ''}', '${tutorName}')">
                                    <i class="fa-solid fa-comments"></i> Message
                                </button>
                            </div>
                        </div>
                    `;
                }).join("");
            }
        }

        const syllabusContainer = document.getElementById("studentSyllabusContainer");
        if (syllabusContainer) {
            const acceptedBookings = bookings.filter(b => b.status === "Accepted");

            if (acceptedBookings.length === 0) {
                syllabusContainer.innerHTML = `
                    <div style="padding: 20px; text-align: center; color: #64748b; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;">
                        <p style="font-size: 13px; margin: 0;">Syllabus progress will track automatically once your accepted tutor starts classes.</p>
                    </div>
                `;
            } else {
                const colors = ["#0284c7", "#15803d", "#b45309", "#6b21a8"];
                syllabusContainer.innerHTML = acceptedBookings.map((b, idx) => {
                    const subject = (b.tutorProfile && b.tutorProfile.subjects && b.tutorProfile.subjects[0]) ? b.tutorProfile.subjects[0] : (b.subject || "Tuition Syllabus");
                    const tutorName = b.tutorProfile && b.tutorProfile.user ? b.tutorProfile.user.name : "Educator";
                    const color = colors[idx % colors.length];
                    const progress = stats.progressPercentage || 50;

                    return `
                        <div style="margin-bottom: 14px;">
                            <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; margin-bottom: 4px;">
                                <span>${subject} &bull; <small style="font-weight: 500; color: #64748b;">${tutorName}</small></span>
                                <span style="color: ${color};">${progress}% Completed</span>
                            </div>
                            <div class="progress-bar-container"><div class="progress-bar-fill" style="width: ${progress}%; background: ${color};"></div></div>
                        </div>
                    `;
                }).join("");
            }
        }

    } catch (err) {
        console.error("Load Student Dashboard Overview Error:", err);
    }
};

window.loadStudentStudyNotesLibrary = async function() {
    const grid = document.getElementById("studentStudyNotesGrid");
    if (!grid) return;

    try {
        const [notesRes, materialsRes] = await Promise.all([
            fetch("/api/student/study-notes"),
            fetch("/api/student/study-materials")
        ]);

        const notesData = await notesRes.json();
        const materialsData = await materialsRes.json();

        const notes = (notesData && notesData.success) ? (notesData.studyNotes || []) : [];
        const materials = (materialsData && materialsData.success) ? (materialsData.studyMaterials || []) : [];

        const allItems = [...notes, ...materials];

        if (allItems.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; padding: 40px 20px; text-align: center; color: #64748b; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;">
                    <i class="fa-solid fa-book-bookmark" style="font-size: 38px; color: #cbd5e1; margin-bottom: 10px; display: block;"></i>
                    <h4 style="font-size: 15px; font-weight: 700; color: #1e293b; margin: 0 0 4px 0;">No Study Notes Available Yet</h4>
                    <p style="font-size: 12px; color: #64748b; margin: 0;">Study notes and materials published by your educators will appear here for download.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = allItems.map(item => {
            const title = item.title || "Study Reference Material";
            const subject = item.subject || "General";
            const tutorName = item.tutor ? (item.tutor.name || "Verified Educator") : "Assigned Educator";
            const fileUrl = item.fileUrl || item.documentUrl || "#";
            const board = item.board || "CBSE";

            return `
                <div style="padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #0284c7; background: #e0f2fe; padding: 2px 8px; border-radius: 4px;">${subject} (${board})</span>
                            <small style="font-size: 11px; color: #94a3b8;">${item.class ? 'Class ' + item.class : ''}</small>
                        </div>
                        <h4 style="margin: 4px 0 6px 0; font-size: 15px; font-weight: 800; color: #0f2a4a;">${title}</h4>
                        <p style="font-size: 12px; color: #64748b; margin: 0 0 12px 0;">Uploaded by <b>${tutorName}</b></p>
                    </div>
                    <a href="${fileUrl}" target="_blank" download class="dash-btn dash-btn-outline" style="font-size: 12px; justify-content: center; text-decoration: none;">
                        <i class="fa-solid fa-file-pdf" style="color: #ef4444;"></i> Download PDF Note
                    </a>
                </div>
            `;
        }).join("");
    } catch (err) {
        console.error("Load Student Study Notes Error:", err);
    }
};

window.loadStudentDashboardData = function() {
    window.loadStudentDashboardOverview();
    window.loadStudentScheduleTable();
    window.loadStudentStudyNotesLibrary();
    window.loadStudentWalletAndInvoices();
    window.loadStudentReferrals();
};

// AUTO-INITIALIZE DASHBOARDS ON DOM READY
document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;
    if (path.includes("tutor")) {
        loadTutorDashboardData();
    } else if (path.includes("student")) {
        loadStudentDashboardData();
    } else if (path.includes("admin")) {
        loadAdminDashboardData();
    } else if (path.includes("parent")) {
        loadParentDashboardData();
    }
    loadPublicContent();
    fetchUserNotifications();
});

window.adminBlogsCache = {};
window.currentBlogTags = [];
window.blogTipTapEditorInstance = null;

// Initialize TipTap Editor
window.initBlogTipTapEditor = function() {
    const workspace = document.getElementById("blogTipTapWorkspace");
    if (!workspace || window.blogTipTapEditorInstance) return;

    if (!window.TipTapModules || !window.TipTapModules.Editor) {
        setTimeout(window.initBlogTipTapEditor, 250);
        return;
    }

    const { Editor, StarterKit, Underline, Link, Image, TextAlign, Placeholder } = window.TipTapModules;

    window.blogTipTapEditorInstance = new Editor({
        element: workspace,
        extensions: [
            StarterKit,
            Underline,
            Link.configure({ openOnClick: false }),
            Image,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Placeholder.configure({ placeholder: 'Write your blog content here...' })
        ],
        content: '',
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            document.getElementById("blogContentInput").value = html;
            window.autoCalculateReadTime();
            window.updateTipTapToolbarState();
        },
        onSelectionUpdate: () => {
            window.updateTipTapToolbarState();
        }
    });

    // Bind toolbar buttons
    const toolbar = document.getElementById("blogTipTapToolbar");
    if (toolbar) {
        toolbar.addEventListener("click", (e) => {
            const btn = e.target.closest(".tiptap-btn");
            if (!btn) return;
            e.preventDefault();
            const action = btn.getAttribute("data-action");
            const editor = window.blogTipTapEditorInstance;
            if (!editor) return;

            switch (action) {
                case "bold": editor.chain().focus().toggleBold().run(); break;
                case "italic": editor.chain().focus().toggleItalic().run(); break;
                case "underline": editor.chain().focus().toggleUnderline().run(); break;
                case "h2": editor.chain().focus().toggleHeading({ level: 2 }).run(); break;
                case "h3": editor.chain().focus().toggleHeading({ level: 3 }).run(); break;
                case "bulletList": editor.chain().focus().toggleBulletList().run(); break;
                case "orderedList": editor.chain().focus().toggleOrderedList().run(); break;
                case "link": {
                    const prevUrl = editor.getAttributes("link").href || "";
                    const url = window.showCustomPrompt
                        ? await window.showCustomPrompt("Enter link URL:", prevUrl, "Insert Link")
                        : prompt("Enter link URL:", prevUrl);
                    if (url === null) return;
                    if (url === "") {
                        editor.chain().focus().extendMarkRange("link").unsetLink().run();
                    } else {
                        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
                    }
                    break;
                }
                case "image": {
                    const url = window.showCustomPrompt
                        ? await window.showCustomPrompt("Enter image URL:", "", "Insert Image")
                        : prompt("Enter image URL:");
                    if (url) editor.chain().focus().setImage({ src: url }).run();
                    break;
                }
                case "alignLeft": editor.chain().focus().setTextAlign("left").run(); break;
                case "alignCenter": editor.chain().focus().setTextAlign("center").run(); break;
                case "alignRight": editor.chain().focus().setTextAlign("right").run(); break;
                case "alignJustify": editor.chain().focus().setTextAlign("justify").run(); break;
                case "undo": editor.chain().focus().undo().run(); break;
                case "redo": editor.chain().focus().redo().run(); break;
            }
            window.updateTipTapToolbarState();
        });
    }
};

window.updateTipTapToolbarState = function() {
    const editor = window.blogTipTapEditorInstance;
    const toolbar = document.getElementById("blogTipTapToolbar");
    if (!editor || !toolbar) return;

    const checkState = (action, condition) => {
        const btn = toolbar.querySelector(`.tiptap-btn[data-action="${action}"]`);
        if (btn) {
            if (condition) btn.classList.add("is-active");
            else btn.classList.remove("is-active");
        }
    };

    checkState("bold", editor.isActive("bold"));
    checkState("italic", editor.isActive("italic"));
    checkState("underline", editor.isActive("underline"));
    checkState("h2", editor.isActive("heading", { level: 2 }));
    checkState("h3", editor.isActive("heading", { level: 3 }));
    checkState("bulletList", editor.isActive("bulletList"));
    checkState("orderedList", editor.isActive("orderedList"));
    checkState("link", editor.isActive("link"));
    checkState("alignLeft", editor.isActive({ textAlign: "left" }));
    checkState("alignCenter", editor.isActive({ textAlign: "center" }));
    checkState("alignRight", editor.isActive({ textAlign: "right" }));
    checkState("alignJustify", editor.isActive({ textAlign: "justify" }));
};

// Tags Management
window.renderBlogTagsChips = function() {
    const container = document.getElementById("blogTagsChips");
    if (!container) return;
    container.innerHTML = window.currentBlogTags.map((tag, idx) => {
        return `
            <span class="blog-tag-chip">
                ${tag}
                <i class="fa-solid fa-xmark remove-tag" onclick="window.removeBlogTag(${idx})" title="Remove tag"></i>
            </span>
        `;
    }).join("");
};

window.addBlogTagFromInput = function() {
    const input = document.getElementById("blogTagInput");
    if (!input) return;
    const val = input.value.trim().replace(/^#/, "");
    if (val && !window.currentBlogTags.includes(val)) {
        window.currentBlogTags.push(val);
        window.renderBlogTagsChips();
        input.value = "";
    }
};

window.removeBlogTag = function(index) {
    if (index >= 0 && index < window.currentBlogTags.length) {
        window.currentBlogTags.splice(index, 1);
        window.renderBlogTagsChips();
    }
};

// Read Time Auto-Calculation
window.autoCalculateReadTime = function() {
    const editor = window.blogTipTapEditorInstance;
    let text = "";
    if (editor) {
        text = editor.getText();
    } else {
        const input = document.getElementById("blogContentInput");
        if (input) text = input.value;
    }

    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const mins = Math.max(1, Math.ceil(words / 200));
    const readTimeInput = document.getElementById("blogReadTimeInput");
    if (readTimeInput) {
        readTimeInput.value = `${mins} min read`;
    }
};

// Cover Image Handling
window.handleBlogCoverFileUpload = async function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
        if (typeof showToast === 'function') showToast("Uploading cover image...");
        const res = await fetch("/api/admin/blogs/upload-cover", {
            method: "POST",
            body: formData
        });
        const data = await res.json();
        if (data.success && data.url) {
            document.getElementById("blogCoverImageInput").value = data.url;
            window.showBlogCoverPreview(data.url);
            if (typeof showToast === 'function') showToast("Cover image uploaded!");
        } else {
            alert(data.message || "Failed to upload image.");
        }
    } catch (err) {
        console.error("Cover image upload error:", err);
        alert("Server error uploading image.");
    }
};

window.showBlogCoverPreview = function(url) {
    const container = document.getElementById("blogCoverPreviewContainer");
    const img = document.getElementById("blogCoverPreviewImg");
    if (container && img && url && url.trim() !== "") {
        img.src = url;
        container.style.display = "inline-block";
    }
};

window.removeBlogCoverPreview = function() {
    document.getElementById("blogCoverImageInput").value = "";
    const container = document.getElementById("blogCoverPreviewContainer");
    if (container) container.style.display = "none";
    const fileInput = document.getElementById("blogCoverFileInput");
    if (fileInput) fileInput.value = "";
};

window.loadAdminBlogs = async function() {
    const tbody = document.getElementById("adminBlogsTableBody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 25px; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Loading blog articles...</td></tr>`;

    try {
        const res = await fetch("/api/admin/blogs");
        const data = await res.json();

        if (data.success && Array.isArray(data.blogs) && data.blogs.length > 0) {
            window.adminBlogsCache = {};
            data.blogs.forEach(b => window.adminBlogsCache[b._id] = b);

            tbody.innerHTML = data.blogs.map(blog => {
                const createdDate = new Date(blog.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                });
                const defaultImg = "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=300&q=80";
                const imgUrl = blog.coverImage && blog.coverImage.trim() !== "" ? blog.coverImage : defaultImg;

                const statusBadge = blog.published
                    ? `<span style="background: #dcfce7; color: #15803d; border: 1px solid #86efac; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 700;"><i class="fa-solid fa-check-circle"></i> Published</span>`
                    : `<span style="background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 700;"><i class="fa-solid fa-eye-slash"></i> Draft</span>`;

                return `
                    <tr>
                        <td>
                            <img src="${imgUrl}" alt="Cover" style="width: 54px; height: 38px; object-fit: cover; border-radius: 6px; border: 1px solid #cbd5e1;" onError="this.src='${defaultImg}'" />
                        </td>
                        <td>
                            <strong style="color: #213547; display: block; font-size: 14px;">${blog.title}</strong>
                            <small style="color: #64748b; font-size: 11px;">/${blog.slug || blog._id}</small>
                        </td>
                        <td><span style="background: #f1f5f9; color: #334155; padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;">${blog.category || 'General'}</span></td>
                        <td style="font-size: 13px; color: #475569;">${blog.author || 'Academic Team'}</td>
                        <td>${statusBadge}</td>
                        <td style="font-size: 12px; color: #64748b;">${createdDate}</td>
                        <td>
                            <div style="display: flex; gap: 6px;">
                                <button type="button" class="dash-btn dash-btn-outline" style="padding: 4px 8px; font-size: 12px;" onclick="openEditBlogModal('${blog._id}')">
                                    <i class="fa-solid fa-pen"></i> Edit
                                </button>
                                <button type="button" class="dash-btn dash-btn-outline" style="padding: 4px 8px; font-size: 12px; color: ${blog.published ? '#b45309' : '#15803d'}; border-color: ${blog.published ? '#fcd34d' : '#86efac'};" onclick="toggleAdminBlogPublish('${blog._id}')">
                                    <i class="fa-solid ${blog.published ? 'fa-eye-slash' : 'fa-eye'}"></i> ${blog.published ? 'Unpublish' : 'Publish'}
                                </button>
                                <button type="button" class="dash-btn dash-btn-outline" style="padding: 4px 8px; font-size: 12px; color: #dc2626; border-color: #fca5a5;" onclick="deleteAdminBlog('${blog._id}')">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join("");
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 35px 20px; color: #64748b;">
                        <i class="fa-solid fa-newspaper" style="font-size: 32px; color: #cbd5e1; margin-bottom: 8px; display: block;"></i>
                        <strong>No Blog Articles Found</strong>
                        <p style="margin: 4px 0 0 0; font-size: 13px;">Click "+ Create New Blog" to publish your first educational resource article.</p>
                    </td>
                </tr>
            `;
        }
    } catch (err) {
        console.error("Load Admin Blogs Error:", err);
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px; color: #dc2626;">Error loading blogs from server.</td></tr>`;
    }
};

window.openCreateBlogModal = function() {
    window.initBlogTipTapEditor();
    document.getElementById("blogModalTitle").innerHTML = `<i class="fa-solid fa-plus-circle" style="color: #38bdf8; margin-right: 8px;"></i> Create New Blog Post`;
    document.getElementById("blogEditId").value = "";
    document.getElementById("blogTitleInput").value = "";
    document.getElementById("blogExcerptInput").value = "";
    document.getElementById("blogCoverImageInput").value = "";
    window.removeBlogCoverPreview();
    document.getElementById("blogCategoryInput").value = "Learning Resources";
    document.getElementById("blogAuthorInput").value = "Smart HomeTutor Academic Team";
    window.currentBlogTags = [];
    window.renderBlogTagsChips();
    document.getElementById("blogReadTimeInput").value = "5 min read";
    document.getElementById("blogStatusInput").value = "published";

    if (window.blogTipTapEditorInstance) {
        window.blogTipTapEditorInstance.commands.setContent("");
    }
    document.getElementById("blogContentInput").value = "";
    document.getElementById("blogModal").style.display = "flex";
};

window.openEditBlogModal = function(blogId) {
    window.initBlogTipTapEditor();
    const blog = window.adminBlogsCache[blogId];
    if (!blog) {
        alert("Blog details not found.");
        return;
    }

    document.getElementById("blogModalTitle").innerHTML = `<i class="fa-solid fa-pen-to-square" style="color: #38bdf8; margin-right: 8px;"></i> Edit Blog Post`;
    document.getElementById("blogEditId").value = blog._id;
    document.getElementById("blogTitleInput").value = blog.title || "";
    document.getElementById("blogExcerptInput").value = blog.excerpt || "";
    document.getElementById("blogCoverImageInput").value = blog.coverImage || "";
    if (blog.coverImage && blog.coverImage.trim() !== "") {
        window.showBlogCoverPreview(blog.coverImage);
    } else {
        window.removeBlogCoverPreview();
    }
    document.getElementById("blogCategoryInput").value = blog.category || "Learning Resources";
    document.getElementById("blogAuthorInput").value = blog.author || "Smart HomeTutor Academic Team";
    
    window.currentBlogTags = Array.isArray(blog.tags) ? [...blog.tags] : [];
    window.renderBlogTagsChips();
    
    document.getElementById("blogReadTimeInput").value = blog.readTime || "5 min read";
    document.getElementById("blogStatusInput").value = blog.published ? "published" : "draft";

    const contentHtml = blog.content || "";
    document.getElementById("blogContentInput").value = contentHtml;
    if (window.blogTipTapEditorInstance) {
        window.blogTipTapEditorInstance.commands.setContent(contentHtml);
    }

    document.getElementById("blogModal").style.display = "flex";
};

window.submitAdminBlogWithStatus = async function(statusOverride) {
    const id = document.getElementById("blogEditId").value;
    const title = document.getElementById("blogTitleInput").value.trim();
    const excerpt = document.getElementById("blogExcerptInput").value.trim();
    const coverImage = document.getElementById("blogCoverImageInput").value.trim();
    const category = document.getElementById("blogCategoryInput").value;
    const author = document.getElementById("blogAuthorInput").value.trim();
    const tags = window.currentBlogTags;
    
    let content = "";
    if (window.blogTipTapEditorInstance) {
        content = window.blogTipTapEditorInstance.getHTML().trim();
        if (content === "<p></p>") content = "";
    } else {
        content = document.getElementById("blogContentInput").value.trim();
    }

    const readTime = document.getElementById("blogReadTimeInput").value.trim();
    
    let isPublished = true;
    if (statusOverride === "draft") {
        isPublished = false;
    } else if (statusOverride === "published") {
        isPublished = true;
    } else {
        isPublished = document.getElementById("blogStatusInput").value === "published";
    }

    // Required Fields Validation
    if (!title) {
        if (typeof showToast === 'function') showToast("⚠️ Title is a required field.");
        else alert("Title is a required field.");
        document.getElementById("blogTitleInput").focus();
        return;
    }
    if (!excerpt) {
        if (typeof showToast === 'function') showToast("⚠️ Excerpt is a required field.");
        else alert("Excerpt is a required field.");
        document.getElementById("blogExcerptInput").focus();
        return;
    }
    if (!coverImage) {
        if (typeof showToast === 'function') showToast("⚠️ Cover Image is required. Please upload or enter image URL.");
        else alert("Cover Image is required.");
        document.getElementById("blogCoverImageInput").focus();
        return;
    }
    if (!content) {
        if (typeof showToast === 'function') showToast("⚠️ Blog Content is a required field.");
        else alert("Blog Content is a required field.");
        return;
    }

    const payload = {
        title,
        excerpt,
        coverImage,
        category,
        author,
        tags,
        content,
        readTime: readTime || "5 min read",
        published: isPublished
    };

    const method = id ? "PUT" : "POST";
    const endpoint = id ? `/api/admin/blogs/${id}` : "/api/admin/blogs";

    try {
        const res = await fetch(endpoint, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (data.success) {
            if (typeof showToast === 'function') showToast(data.message || "Blog saved successfully!");
            else alert(data.message || "Blog saved successfully!");
            closeModal("blogModal");
            window.loadAdminBlogs();
        } else {
            if (typeof showToast === 'function') showToast(data.message || "Failed to save blog post.");
            else alert(data.message || "Failed to save blog post.");
        }
    } catch (err) {
        console.error("Submit Admin Blog Error:", err);
        if (typeof showToast === 'function') showToast("Server error while saving blog.");
        else alert("Server error while saving blog.");
    }
};

window.handleAdminBlogSubmit = function(event) {
    event.preventDefault();
    const statusVal = document.getElementById("blogStatusInput").value;
    window.submitAdminBlogWithStatus(statusVal);
};

window.toggleAdminBlogPublish = async function(id) {
    try {
        const res = await fetch(`/api/admin/blogs/${id}/publish`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (data.success) {
            if (typeof showToast === 'function') showToast(data.message);
            else alert(data.message);
            window.loadAdminBlogs();
        } else {
            if (typeof showToast === 'function') showToast(data.message || "Failed to update publication status.");
            else alert(data.message || "Failed to update publication status.");
        }
    } catch (err) {
        console.error("Toggle Blog Publish Error:", err);
        if (typeof showToast === 'function') showToast("Server error while toggling publication state.");
        else alert("Server error while toggling publication state.");
    }
};

window.deleteAdminBlog = async function(id) {
    const confirmed = window.showCustomConfirm
        ? await window.showCustomConfirm("Are you sure you want to permanently delete this blog article?", "Delete Blog", "Delete", "Cancel")
        : confirm("Are you sure you want to permanently delete this blog article?");
    if (!confirmed) return;

    try {
        const res = await fetch(`/api/admin/blogs/${id}`, {
            method: "DELETE",
        });
        const data = await res.json();
        if (data.success) {
            if (typeof showToast === 'function') showToast(data.message || "Blog deleted successfully!");
            else alert(data.message || "Blog deleted successfully!");
            window.loadAdminBlogs();
        } else {
            if (typeof showToast === 'function') showToast(data.message || "Failed to delete blog article.");
            else alert(data.message || "Failed to delete blog article.");
        }
    } catch (err) {
        console.error("Delete Admin Blog Error:", err);
        if (typeof showToast === 'function') showToast("Server error while deleting blog article.");
        else alert("Server error while deleting blog article.");
    }
};









