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

// Current user GPS state
let userGeoLocation = null;

async function useCurrentGPSLocation() {
    if (!navigator.geolocation) {
        alert("⚠️ Geolocation is not supported by your browser.");
        return;
    }

    const distSelect = document.getElementById("filterDistance");
    if (distSelect && distSelect.value === "all") {
        distSelect.value = "10km"; // Default to 10km radius if not selected
    }

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            userGeoLocation = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
            };
            if (typeof showToast === "function") {
                showToast("📍 Current location acquired! Searching nearby tutors...");
            } else {
                alert("📍 Current location acquired! Updating nearby tutors search...");
            }
            filterTutors();
        },
        (err) => {
            console.error("GPS Error:", err);
            alert("⚠️ Unable to retrieve your GPS location. Please check browser location permissions.");
        }
    );
}

window.useCurrentGPSLocation = useCurrentGPSLocation;

window.openGoogleMap = function(lat, lng, name) {
    const targetLat = lat || 28.6139;
    const targetLng = lng || 77.2090;
    const mapsUrl = `https://www.google.com/maps?q=${targetLat},${targetLng}`;
    window.open(mapsUrl, "_blank");
};

async function filterTutors() {
    const searchText = document.getElementById("filterSearchText")?.value.trim() || "";
    const location = document.getElementById("filterLocation")?.value || "all";
    const subject = document.getElementById("filterSubject")?.value || "all";
    const board = document.getElementById("filterBoard")?.value || "all";
    const grade = document.getElementById("filterGrade")?.value || "all";
    const mode = document.getElementById("filterMode")?.value || "all";
    const distanceRadius = document.getElementById("filterDistance")?.value || "all";
    const gender = document.getElementById("filterGender")?.value || "all";
    const experience = document.getElementById("filterExperience")?.value || "all";
    const maxFee = document.getElementById("filterFeeMax")?.value || "";
    const minRating = document.getElementById("filterRatingMin")?.value || "0";
    const language = document.getElementById("filterLanguage")?.value || "all";

    const query = new URLSearchParams();
    if (searchText) query.append("search", searchText);
    if (location !== "all") query.append("location", location);
    if (subject !== "all") query.append("subject", subject);
    if (board !== "all") query.append("board", board);
    if (grade !== "all") query.append("grade", grade);
    if (mode !== "all") query.append("mode", mode);
    if (gender !== "all") query.append("gender", gender);
    if (experience !== "all") query.append("experience", experience);
    if (maxFee) query.append("maxFee", maxFee);
    if (minRating !== "0") query.append("minRating", minRating);
    if (language !== "all") query.append("language", language);
    if (distanceRadius !== "all") query.append("distanceRadius", distanceRadius);

    if (userGeoLocation) {
        query.append("lat", userGeoLocation.lat);
        query.append("lng", userGeoLocation.lng);
    }

    fetchAndRenderTutors(query);
}

async function fetchAndRenderTutors(query) {
    try {
        const response = await fetch(`/api/tutor/all?${query.toString()}`);
        const result = await response.json();
        if (!result.success) return;

        const container = document.getElementById("tutorGridContainer");
        if (!container) return;

        container.innerHTML = "";

        if (result.tutors.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <i class="fa-solid fa-user-slash" style="font-size: 40px; color: #94a3b8; margin-bottom: 12px;"></i>
                    <h3 style="font-size: 18px; color: #1e293b;">No tutors found matching your criteria</h3>
                    <p style="color: #64748b; font-size: 14px;">Try adjusting your filters or search keywords.</p>
                </div>
            `;
            return;
        }

        result.tutors.forEach(tutor => {
            const tutorName = tutor.user ? tutor.user.name : "Expert Tutor";
            const initials = tutorName.split(" ").map(n => n[0]).join("").toUpperCase();
            const rating = tutor.rating || 5.0;
            const reviewsCount = tutor.totalReviews || 0;
            const lat = tutor.coordinates?.lat || 28.6139;
            const lng = tutor.coordinates?.lng || 77.2090;

            // Distance Tag (e.g. 2.5 km away or service radius)
            let distBadge = "";
            if (tutor.distanceKm !== undefined && tutor.distanceKm !== null) {
                distBadge = `<span style="font-size: 12px; font-weight: 700; color: #0284c7; background: #e0f2fe; padding: 2px 8px; border-radius: 12px; display: inline-flex; align-items: center; gap: 4px;"><i class="fa-solid fa-location-dot"></i> ${tutor.distanceKm} km away</span>`;
            } else if (tutor.serviceAreaRadius) {
                distBadge = `<span style="font-size: 12px; font-weight: 600; color: #475569; background: #f1f5f9; padding: 2px 8px; border-radius: 12px; display: inline-flex; align-items: center; gap: 4px;"><i class="fa-solid fa-compass"></i> Within ${tutor.serviceAreaRadius} km</span>`;
            }

            container.innerHTML += `
            <div class="tutor-card">
                <div class="tutor-header">
                    <div class="avatar">${initials}</div>
                    <div style="flex:1;">
                        <h3 class="tutor-name">${tutorName}</h3>
                        <p class="tutor-title">${tutor.qualification} • ${tutor.experience || 1}+ Yrs Exp</p>
                        ${distBadge ? `<div style="margin-top: 4px;">${distBadge}</div>` : ""}
                    </div>
                </div>

                <div class="tutor-details">
                    <p><strong>Subjects:</strong> ${tutor.subjects ? tutor.subjects.join(", ") : "General"}</p>
                    <p><strong>Classes:</strong> ${tutor.classes ? tutor.classes.join(", ") : "All Grades"}</p>
                    <p><strong>Location:</strong> ${tutor.location || "Online"}</p>
                    <p><strong>Mode:</strong> ${tutor.mode || "Both"}</p>
                </div>

                <div class="tutor-meta">
                    <div class="rating">
                        <i class="fa-solid fa-star" style="color: #f59e0b;"></i> ${rating} (${reviewsCount})
                    </div>
                    <div class="fee">₹${tutor.fee}/hr</div>
                </div>

                <div class="tutor-actions" style="margin-top: 16px; display: flex; flex-wrap: wrap; gap: 8px;">
                    <button onclick="window.location.href='/tutor/${tutor._id}'" class="dash-btn dash-btn-outline" style="flex: 1; justify-content: center; font-size: 12px;">
                        View Profile
                    </button>
                    <button onclick="openGoogleMap(${lat}, ${lng}, '${tutorName}')" class="dash-btn dash-btn-outline" style="flex: 1; justify-content: center; font-size: 12px; color: var(--primary);">
                        <i class="fa-solid fa-map-location-dot"></i> View on Map
                    </button>
                    <button onclick="openBookingModal('${tutor._id}', '${tutorName}')" class="dash-btn dash-btn-primary" style="flex: 100%; justify-content: center; font-size: 12px; margin-top: 4px;">
                        Book Demo Class
                    </button>
                </div>
            </div>
            `;
        });
    } catch (err) {
        console.error("Filter Tutors Error:", err);
    }
}

// Global modal booking helper
window.openBookingModal = function(tutorProfileId, tutorName) {
    const message = prompt(`Request a free trial / demo class with ${tutorName}.\nEnter your message/preferred timing:`, "Hi, I would like to schedule a trial class.");
    if (message === null) return;

    fetch("/api/student/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutorProfileId, message, isTrial: true }),
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("🎉 " + data.message);
        } else {
            alert("⚠️ " + (data.message || "Failed to submit request. Ensure you are logged in as a student."));
        }
    })
    .catch(err => {
        console.error(err);
        alert("❌ Error sending booking request. Please check if you are logged in.");
    });
};

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const gParam = urlParams.get('grade');
    const sParam = urlParams.get('subject');
    const bParam = urlParams.get('board');

    const gradeSelect = document.getElementById("filterGrade");
    const subjectSelect = document.getElementById("filterSubject");
    const boardSelect = document.getElementById("filterBoard");

    if (gParam && gradeSelect) {
        let normalizedG = decodeURIComponent(gParam).replace(/\+/g, ' ').trim();
        if (normalizedG === 'Class 1-5' || normalizedG === 'Class 1–5' || normalizedG.toLowerCase().includes('1-5') || normalizedG.toLowerCase().includes('primary')) normalizedG = 'Class 1-5';
        if (normalizedG === 'Class 6-8' || normalizedG === 'Class 6–8' || normalizedG.toLowerCase().includes('6-8') || normalizedG.toLowerCase().includes('middle')) normalizedG = 'Class 6-8';
        if (normalizedG === 'Class 9-10' || normalizedG === 'Class 9–10' || normalizedG.toLowerCase().includes('9-10') || normalizedG.toLowerCase().includes('secondary')) normalizedG = 'Class 9-10';
        if (normalizedG === 'Class 11-12' || normalizedG === 'Class 11–12' || normalizedG.toLowerCase().includes('11-12') || normalizedG.toLowerCase().includes('11–12')) normalizedG = 'Class 11-12';
        gradeSelect.value = normalizedG;
    }
    if (sParam && subjectSelect) {
        subjectSelect.value = decodeURIComponent(sParam).replace(/\+/g, ' ').trim();
    }
    if (bParam && boardSelect) {
        boardSelect.value = decodeURIComponent(bParam).replace(/\+/g, ' ').trim();
    }

    filterTutors();
});