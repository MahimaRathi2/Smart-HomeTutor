import React, { useState } from 'react';

export const TutorApplicationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Main Form Data State
  const [formData, setFormData] = useState({
    // Step 1: Personal & Location
    fullName: '',
    gender: '',
    dob: '',
    mobile: '',
    whatsapp: '',
    email: '',
    alternateContact: '',
    currentAddress: '',
    city: '',
    state: '',
    pincode: '',
    teachingArea: '',
    preferredRadius: '10 km',

    // Step 2: Qualification & Experience
    highestQualification: '',
    degreeName: '',
    collegeUniversity: '',
    passingYear: '',
    specialization: ['Subject Specialization'],
    additionalQualifications: '',
    experienceType: 'Experienced', // 'Fresher' | 'Experienced'
    totalExperience: '',
    previousInstitute: '',
    experienceDuration: '',
    classesTaught: [],
    subjectsTaught: [],

    // Step 3: Teaching Details & Approach
    classesYouTeach: ['Class 9–10', 'Class 11–12'],
    board: ['CBSE', 'ICSE'],
    subjectsYouTeach: ['Mathematics', 'Physics'],
    classType: ['One-to-One'], // 'One-to-One' | 'Group Class'
    teachingMethod: '',
    studentLevel: 'Intermediate', // 'Beginner' | 'Intermediate' | 'Advanced'
    teachingMode: 'Both', // 'Home Tuition' | 'Online Tuition' | 'Both'
    // Home Tuition Conditional
    preferredTeachingAreas: '',
    maxTravelDistance: '10 km',
    preferredLocation: '',
    // Online Tuition Conditional
    onlinePlatform: 'Zoom / Google Meet',
    laptopAvailable: 'Yes',
    stableInternet: 'Yes',
    digitalTabletAvailable: 'No',

    // Step 4: Availability & Fees
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    startTime: '09:00',
    endTime: '19:00',
    expectedFee: '',
    feeType: 'Per Hour', // 'Per Hour' | 'Per Class' | 'Monthly'
    negotiable: 'Yes',
    additionalFeeNotes: '',

    // Step 5: Optional Payment Details & Declaration
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
    declarationAccepted: false,
  });

  // File Upload State
  const [files, setFiles] = useState({
    profilePhoto: null,
    qualificationDoc: null,
    experienceDoc: null,
    idProofDoc: null,
    resumeDoc: null,
    addressProofDoc: null,
  });

  // Custom subject input state for Step 3
  const [customSubjectInput, setCustomSubjectInput] = useState('');

  // Handle Text/Select/Radio input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle Array Multi-Select Toggle
  const handleArrayToggle = (field, value) => {
    setFormData((prev) => {
      const currentList = prev[field] || [];
      const exists = currentList.includes(value);
      const updated = exists ? currentList.filter((item) => item !== value) : [...currentList, value];
      return { ...prev, [field]: updated };
    });
  };

  // Handle Custom Subject Add/Remove in Step 3
  const handleAddSubject = () => {
    const trimmed = customSubjectInput.trim();
    if (trimmed && !formData.subjectsYouTeach.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        subjectsYouTeach: [...prev.subjectsYouTeach, trimmed],
      }));
      setCustomSubjectInput('');
    }
  };

  const handleRemoveSubject = (subjectToRemove) => {
    setFormData((prev) => ({
      ...prev,
      subjectsYouTeach: prev.subjectsYouTeach.filter((s) => s !== subjectToRemove),
    }));
  };

  // Handle File Upload Change
  const handleFileChange = (e, fieldName) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage(`File size for ${fieldName} exceeds 10MB limit.`);
      return;
    }

    // Validate extension
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setErrorMessage(`Invalid file format for ${fieldName}. Only JPG, JPEG, PNG, and PDF are allowed.`);
      return;
    }

    setFiles((prev) => ({ ...prev, [fieldName]: file }));
    if (errorMessage) setErrorMessage('');
  };

  const handleRemoveFile = (fieldName) => {
    setFiles((prev) => ({ ...prev, [fieldName]: null }));
  };

  // Step Validation Logic
  const validateStep = (step) => {
    setErrorMessage('');

    if (step === 1) {
      if (!formData.fullName.trim()) return 'Full Name is required.';
      if (!formData.gender) return 'Gender selection is required.';
      if (!formData.mobile.trim()) return 'Mobile Number is required.';
      if (!formData.email.trim()) return 'Email Address is required.';
      if (!formData.currentAddress.trim()) return 'Current Address is required.';
      if (!formData.city.trim()) return 'City is required.';
      if (!formData.state.trim()) return 'State is required.';
      if (!formData.pincode.trim()) return 'Pincode is required.';
      if (!formData.teachingArea.trim()) return 'Teaching Area / Locality is required.';
    }

    if (step === 2) {
      if (!formData.highestQualification.trim()) return 'Highest Qualification is required.';
      if (!formData.totalExperience.trim()) return 'Total Teaching Experience is required.';
      if (formData.experienceType === 'Experienced' && !formData.previousInstitute.trim()) {
        return 'Previous School / Institute / Coaching Name is required for experienced tutors.';
      }
    }

    if (step === 3) {
      if (!formData.classesYouTeach || formData.classesYouTeach.length === 0) {
        return 'Please select at least one Class that you teach.';
      }
      if (!formData.board || formData.board.length === 0) {
        return 'Please select at least one Board (e.g. CBSE, ICSE).';
      }
      if (!formData.subjectsYouTeach || formData.subjectsYouTeach.length === 0) {
        return 'Please select or add at least one Subject.';
      }
      if (!formData.teachingMode) return 'Please select a Teaching Mode.';
    }

    if (step === 4) {
      if (!formData.expectedFee.trim()) return 'Expected Fee is required.';
    }

    if (step === 5) {
      if (!files.qualificationDoc) return 'Qualification Certificate document upload is required.';
      if (!files.idProofDoc) return 'ID Proof document upload is required.';
      if (!formData.declarationAccepted) return 'You must accept the declaration to submit your application.';
    }

    return null;
  };

  // Step Navigation
  const handleNext = () => {
    const error = validateStep(currentStep);
    if (error) {
      setErrorMessage(error);
      return;
    }
    setErrorMessage('');
    setCurrentStep((prev) => Math.min(prev + 1, 5));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setErrorMessage('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetAndNewApplication = () => {
    setFormData({
      fullName: '',
      gender: '',
      dob: '',
      mobile: '',
      whatsapp: '',
      email: '',
      alternateContact: '',
      currentAddress: '',
      city: '',
      state: '',
      pincode: '',
      teachingArea: '',
      preferredRadius: '10 km',

      highestQualification: '',
      degreeName: '',
      collegeUniversity: '',
      passingYear: '',
      specialization: '',
      additionalQualifications: '',
      experienceType: 'Experienced',
      totalExperience: '',
      previousInstitute: '',
      experienceDuration: '',
      classesTaught: [],
      subjectsTaught: [],

      classesYouTeach: ['Class 9–10', 'Class 11–12'],
      board: ['CBSE', 'ICSE'],
      subjectsYouTeach: ['Mathematics', 'Physics'],
      teachingMode: 'Both',
      preferredTeachingAreas: '',
      maxTravelDistance: '10 km',
      preferredLocation: '',
      onlinePlatform: 'Zoom / Google Meet',
      laptopAvailable: 'Yes',
      stableInternet: 'Yes',
      digitalTabletAvailable: 'No',

      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      startTime: '09:00',
      endTime: '19:00',
      expectedFee: '',
      feeType: 'Per Hour',
      negotiable: 'Yes',
      additionalFeeNotes: '',

      declarationAccepted: false,
    });
    setFiles({
      profilePhoto: null,
      qualificationDoc: null,
      experienceDoc: null,
      idProofDoc: null,
    });
    setCustomSubjectInput('');
    setErrorMessage('');
    setCurrentStep(1);
    setSubmitSuccess(false);
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateStep(5);
    if (error) {
      setErrorMessage(error);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const dataPayload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (Array.isArray(formData[key])) {
          dataPayload.append(key, JSON.stringify(formData[key]));
        } else {
          dataPayload.append(key, formData[key]);
        }
      });

      if (files.profilePhoto) dataPayload.append('profilePhoto', files.profilePhoto);
      if (files.qualificationDoc) dataPayload.append('qualificationDoc', files.qualificationDoc);
      if (files.experienceDoc) dataPayload.append('experienceDoc', files.experienceDoc);
      if (files.idProofDoc) dataPayload.append('idProofDoc', files.idProofDoc);
      if (files.resumeDoc) dataPayload.append('resumeDoc', files.resumeDoc);
      if (files.addressProofDoc) dataPayload.append('addressProofDoc', files.addressProofDoc);

      const response = await fetch('/api/tutor/profile', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: dataPayload,
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setIsSubmitting(false);
        setSubmitSuccess(true);
      } else {
        setIsSubmitting(false);
        setErrorMessage(resData.message || 'Submission failed. Please try again.');
      }
    } catch (err) {
      console.error('Tutor Registration Submission Error:', err);
      setIsSubmitting(false);
      setErrorMessage('Network error while submitting application. Please try again.');
    }
  };

  const availableSubjectOptions = [
    'Mathematics',
    'Science',
    'English',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'Social Science',
    'Hindi',
    'Accountancy',
    'Economics',
    'Business Studies',
  ];

  return (
    <div className="tr-multi-step-form-container">
      {/* 5-STEP PROGRESS INDICATOR */}
      <div className="tr-progress-header">
        {[
          { step: 1, title: 'Personal & Location', icon: 'fa-user' },
          { step: 2, title: 'Qualification & Exp.', icon: 'fa-graduation-cap' },
          { step: 3, title: 'Teaching Details', icon: 'fa-chalkboard-user' },
          { step: 4, title: 'Availability & Fees', icon: 'fa-clock' },
          { step: 5, title: 'Documents & Submit', icon: 'fa-file-shield' },
        ].map((st) => {
          const isCompleted = currentStep > st.step;
          const isCurrent = currentStep === st.step;
          return (
            <div
              key={st.step}
              className={`tr-progress-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
              onClick={() => {
                if (st.step < currentStep) setCurrentStep(st.step);
              }}
            >
              <div className="tr-step-badge">
                {isCompleted ? <i className="fa-solid fa-check"></i> : st.step}
              </div>
              <div className="tr-step-info">
                <span className="tr-step-subtitle">STEP {st.step}</span>
                <span className="tr-step-title">{st.title}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ERROR ALERT DISPLAY */}
      {errorMessage && (
        <div className="tr-alert error-banner">
          <i className="fa-solid fa-circle-exclamation"></i>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* SUCCESS CARD */}
      {submitSuccess ? (
        <div className="tr-success-card">
          <div className="tr-success-icon-circle">
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <h2>✓ Registration Submitted</h2>
          <p>
            Your tutor application has been submitted successfully.
          </p>
          <div className="tr-success-summary-box">
            <p><strong>Status:</strong> <span style={{ color: '#b45309', fontWeight: 700 }}>Pending Review</span></p>
            <p><strong>Applicant Name:</strong> {formData.fullName}</p>
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>Mobile:</strong> {formData.mobile}</p>
            <p><strong>Teaching Mode:</strong> {formData.teachingMode}</p>
          </div>
          <p style={{ fontSize: '13.5px', color: '#64748b', marginBottom: '24px' }}>
            Our admin team will review your application and documents.
          </p>
          <button
            type="button"
            className="tr-btn tr-btn-primary"
            onClick={handleResetAndNewApplication}
          >
            Submit Another Application
          </button>
        </div>
      ) : (
        <form className="tr-step-form-body" onSubmit={handleSubmit}>
          {/* ========================================================================= */}
          {/* STEP 1: PERSONAL & LOCATION */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="tr-form-step-pane">
              <div className="tr-step-heading">
                <h3>Personal & Location Details</h3>
                <p>Provide your official contact details and current residential address.</p>
              </div>

              {/* Personal Details Subsection */}
              <div className="tr-form-card">
                <h4 className="tr-card-title">Personal Details</h4>
                <div className="tr-grid-2col">
                  <div className="tr-field-group">
                    <label className="tr-field-label">Full Name <span className="req">*</span></label>
                    <input
                      type="text"
                      name="fullName"
                      className="tr-input"
                      placeholder="e.g. Dr. Ramesh Kumar"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="tr-field-group">
                    <label className="tr-field-label">Gender <span className="req">*</span></label>
                    <select name="gender" className="tr-select" value={formData.gender} onChange={handleChange} required>
                      <option value="">Select Gender *</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="tr-field-group">
                    <label className="tr-field-label">Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      className="tr-input"
                      value={formData.dob}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="tr-field-group">
                    <label className="tr-field-label">Mobile Number <span className="req">*</span></label>
                    <input
                      type="tel"
                      name="mobile"
                      className="tr-input"
                      placeholder="10-digit Mobile Number *"
                      value={formData.mobile}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="tr-field-group">
                    <label className="tr-field-label">WhatsApp Number</label>
                    <input
                      type="tel"
                      name="whatsapp"
                      className="tr-input"
                      placeholder="WhatsApp Number (if different)"
                      value={formData.whatsapp}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="tr-field-group">
                    <label className="tr-field-label">Email Address <span className="req">*</span></label>
                    <input
                      type="email"
                      name="email"
                      className="tr-input"
                      placeholder="your.email@example.com *"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="tr-field-group">
                    <label className="tr-field-label">Alternate Contact Number</label>
                    <input
                      type="tel"
                      name="alternateContact"
                      className="tr-input"
                      placeholder="Alternate phone / emergency contact"
                      value={formData.alternateContact}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Address Details Subsection */}
              <div className="tr-form-card">
                <h4 className="tr-card-title">Address Details</h4>
                <div className="tr-grid-2col">
                  <div className="tr-field-group full-width">
                    <label className="tr-field-label">Current Address <span className="req">*</span></label>
                    <textarea
                      name="currentAddress"
                      className="tr-textarea"
                      rows="2"
                      placeholder="House/Flat No., Street, Landmark *"
                      value={formData.currentAddress}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>

                  <div className="tr-field-group">
                    <label className="tr-field-label">City <span className="req">*</span></label>
                    <input
                      type="text"
                      name="city"
                      className="tr-input"
                      placeholder="e.g. New Delhi *"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="tr-field-group">
                    <label className="tr-field-label">State <span className="req">*</span></label>
                    <input
                      type="text"
                      name="state"
                      className="tr-input"
                      placeholder="e.g. Delhi *"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="tr-field-group">
                    <label className="tr-field-label">Pincode <span className="req">*</span></label>
                    <input
                      type="text"
                      name="pincode"
                      className="tr-input"
                      placeholder="6-digit Pincode *"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="tr-field-group">
                    <label className="tr-field-label">Teaching Area / Locality <span className="req">*</span></label>
                    <input
                      type="text"
                      name="teachingArea"
                      className="tr-input"
                      placeholder="e.g. South Extension, Saket *"
                      value={formData.teachingArea}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="tr-field-group">
                    <label className="tr-field-label">Preferred Radius for Home Tuition</label>
                    <select
                      name="preferredRadius"
                      className="tr-select"
                      value={formData.preferredRadius}
                      onChange={handleChange}
                    >
                      <option value="5 km">Within 5 km</option>
                      <option value="10 km">Within 10 km</option>
                      <option value="15 km">Within 15 km</option>
                      <option value="25 km+">25 km+</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: QUALIFICATION & EXPERIENCE */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="tr-form-step-pane">
              <div className="tr-step-heading">
                <h3>Qualification & Teaching Experience</h3>
                <p>Provide details of your educational degree and past teaching experience.</p>
              </div>

              {/* Educational Qualification */}
              <div className="tr-form-card">
                <h4 className="tr-card-title">Educational Qualification</h4>
                <div className="tr-grid-2col">
                  <div className="tr-field-group">
                    <label className="tr-field-label">Highest Qualification <span className="req">*</span></label>
                    <input
                      type="text"
                      name="highestQualification"
                      className="tr-input"
                      placeholder="e.g. M.Sc. Mathematics / B.Tech / M.A."
                      value={formData.highestQualification}
                      onChange={handleChange}
                      required
                    />
                    <small className="tr-field-hint">Example: B.Sc. Mathematics | HNB Garhwal University | 2023</small>
                  </div>

                  <div className="tr-field-group">
                    <label className="tr-field-label">Degree / Course Name</label>
                    <input
                      type="text"
                      name="degreeName"
                      className="tr-input"
                      placeholder="e.g. Bachelor of Science in Mathematics"
                      value={formData.degreeName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="tr-field-group">
                    <label className="tr-field-label">College / University</label>
                    <input
                      type="text"
                      name="collegeUniversity"
                      className="tr-input"
                      placeholder="e.g. Delhi University"
                      value={formData.collegeUniversity}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="tr-field-group">
                    <label className="tr-field-label">Passing Year</label>
                    <input
                      type="text"
                      name="passingYear"
                      className="tr-input"
                      placeholder="e.g. 2022"
                      value={formData.passingYear}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="tr-field-group">
                    <label className="tr-field-label">Specialization / Stream</label>
                    <input
                      type="text"
                      name="specialization"
                      className="tr-input"
                      placeholder="e.g. Pure Mathematics & Statistics"
                      value={formData.specialization}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="tr-field-group">
                    <label className="tr-field-label">Additional Qualifications</label>
                    <input
                      type="text"
                      name="additionalQualifications"
                      className="tr-input"
                      placeholder="e.g. B.Ed, CTET Qualified"
                      value={formData.additionalQualifications}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Teaching Experience */}
              <div className="tr-form-card">
                <h4 className="tr-card-title">Teaching Experience</h4>

                <div className="tr-grid-2col" style={{ marginBottom: '16px' }}>
                  <div className="tr-field-group">
                    <label className="tr-field-label">Experience Status <span className="req">*</span></label>
                    <div className="tr-radio-toggle-group">
                      <label className={`tr-radio-card ${formData.experienceType === 'Fresher' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="experienceType"
                          value="Fresher"
                          checked={formData.experienceType === 'Fresher'}
                          onChange={handleChange}
                        />
                        <span><i className="fa-solid fa-seedling"></i> Fresher</span>
                      </label>
                      <label className={`tr-radio-card ${formData.experienceType === 'Experienced' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="experienceType"
                          value="Experienced"
                          checked={formData.experienceType === 'Experienced'}
                          onChange={handleChange}
                        />
                        <span><i className="fa-solid fa-award"></i> Experienced</span>
                      </label>
                    </div>
                  </div>

                  <div className="tr-field-group">
                    <label className="tr-field-label">Total Teaching Experience <span className="req">*</span></label>
                    <input
                      type="text"
                      name="totalExperience"
                      className="tr-input"
                      placeholder="e.g. 4 Years / Fresher"
                      value={formData.totalExperience}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Conditional Fields for Experienced Tutors */}
                {formData.experienceType === 'Experienced' && (
                  <div className="tr-grid-2col tr-conditional-block">
                    <div className="tr-field-group">
                      <label className="tr-field-label">Previous School / Institute / Coaching Name <span className="req">*</span></label>
                      <input
                        type="text"
                        name="previousInstitute"
                        className="tr-input"
                        placeholder="e.g. Allen Career Institute / DPS School"
                        value={formData.previousInstitute}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="tr-field-group">
                      <label className="tr-field-label">Experience Duration</label>
                      <input
                        type="text"
                        name="experienceDuration"
                        className="tr-input"
                        placeholder="e.g. 2020 to Present"
                        value={formData.experienceDuration}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: TEACHING DETAILS */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="tr-form-step-pane">
              <div className="tr-step-heading">
                <h3>Teaching Details & Preferences</h3>
                <p>Select the classes, academic boards, subjects, and teaching modes you offer.</p>
              </div>

              {/* Classes You Teach */}
              <div className="tr-form-card">
                <h4 className="tr-card-title">Classes You Teach <span className="req">*</span></h4>
                <div className="tr-pill-grid">
                  {['Class 1–5', 'Class 6–8', 'Class 9–10', 'Class 11–12'].map((cls) => {
                    const selected = formData.classesYouTeach.includes(cls);
                    return (
                      <button
                        type="button"
                        key={cls}
                        className={`tr-pill-btn ${selected ? 'active' : ''}`}
                        onClick={() => handleArrayToggle('classesYouTeach', cls)}
                      >
                        <i className={`fa-solid ${selected ? 'fa-square-check' : 'fa-square'}`}></i> {cls}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Academic Board */}
              <div className="tr-form-card">
                <h4 className="tr-card-title">Academic Board <span className="req">*</span></h4>
                <div className="tr-pill-grid">
                  {['CBSE', 'ICSE', 'State Board', 'IB', 'Other'].map((b) => {
                    const selected = formData.board.includes(b);
                    return (
                      <button
                        type="button"
                        key={b}
                        className={`tr-pill-btn ${selected ? 'active' : ''}`}
                        onClick={() => handleArrayToggle('board', b)}
                      >
                        <i className={`fa-solid ${selected ? 'fa-circle-check' : 'fa-circle'}`}></i> {b} Board
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subjects You Teach */}
              <div className="tr-form-card">
                <h4 className="tr-card-title">Subjects You Teach <span className="req">*</span></h4>
                
                <div className="tr-chips-wrapper" style={{ marginBottom: '14px' }}>
                  {formData.subjectsYouTeach.map((sub) => (
                    <span key={sub} className="tr-subject-chip">
                      #{sub}
                      <i className="fa-solid fa-xmark" onClick={() => handleRemoveSubject(sub)}></i>
                    </span>
                  ))}
                </div>

                <div className="tr-preset-subjects">
                  <label className="tr-field-hint" style={{ display: 'block', marginBottom: '8px' }}>Select from popular subjects or add custom below:</label>
                  <div className="tr-pill-grid">
                    {availableSubjectOptions.map((sub) => {
                      const selected = formData.subjectsYouTeach.includes(sub);
                      return (
                        <button
                          type="button"
                          key={sub}
                          className={`tr-pill-btn sm ${selected ? 'active' : ''}`}
                          onClick={() => handleArrayToggle('subjectsYouTeach', sub)}
                        >
                          {selected ? '✓ ' : '+ '}{sub}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="tr-add-custom-subject-row" style={{ marginTop: '14px' }}>
                  <input
                    type="text"
                    className="tr-input"
                    placeholder="Add another subject (e.g. Sanskrit, French, Coding)"
                    value={customSubjectInput}
                    onChange={(e) => setCustomSubjectInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubject();
                      }
                    }}
                  />
                  <button type="button" className="tr-btn tr-btn-outline" onClick={handleAddSubject}>
                    + Add Subject
                  </button>
                </div>
              </div>

              {/* Class Type */}
              <div className="tr-form-card">
                <h4 className="tr-card-title">Class Type <span className="req">*</span></h4>
                <div className="tr-pill-grid">
                  {['One-to-One', 'Group Class'].map((ct) => {
                    const selected = (formData.classType || []).includes(ct);
                    return (
                      <button
                        type="button"
                        key={ct}
                        className={`tr-pill-btn ${selected ? 'active' : ''}`}
                        onClick={() => handleArrayToggle('classType', ct)}
                      >
                        <i className={`fa-solid ${selected ? 'fa-check-circle' : 'fa-circle'}`}></i> {ct}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Specialization */}
              <div className="tr-form-card">
                <h4 className="tr-card-title">Specialization <span className="req">*</span></h4>
                <div className="tr-pill-grid">
                  {['Subject Specialization', 'Competitive Exam Preparation', 'Other Teaching Expertise'].map((spec) => {
                    const selected = (formData.specialization || []).includes(spec);
                    return (
                      <button
                        type="button"
                        key={spec}
                        className={`tr-pill-btn ${selected ? 'active' : ''}`}
                        onClick={() => handleArrayToggle('specialization', spec)}
                      >
                        <i className={`fa-solid ${selected ? 'fa-check-circle' : 'fa-circle'}`}></i> {spec}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Teaching Approach */}
              <div className="tr-form-card">
                <h4 className="tr-card-title">Teaching Approach</h4>
                <div className="tr-field-group full-width">
                  <label className="tr-field-label">Teaching Method / Short Introduction</label>
                  <textarea
                    name="teachingMethod"
                    className="tr-textarea"
                    rows="3"
                    placeholder="Briefly describe your teaching style, interactive methods, exam strategies, or a short introduction for students..."
                    value={formData.teachingMethod}
                    onChange={handleChange}
                  ></textarea>
                </div>
                <div className="tr-field-group" style={{ marginTop: '14px' }}>
                  <label className="tr-field-label">Student Level Catered To</label>
                  <div className="tr-pill-grid">
                    {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => {
                      const isSelected = formData.studentLevel === lvl;
                      return (
                        <button
                          type="button"
                          key={lvl}
                          className={`tr-pill-btn sm ${isSelected ? 'active' : ''}`}
                          onClick={() => setFormData((prev) => ({ ...prev, studentLevel: lvl }))}
                        >
                          {isSelected ? '✓ ' : ''}{lvl} Level
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Teaching Mode */}
              <div className="tr-form-card">
                <h4 className="tr-card-title">Teaching Mode <span className="req">*</span></h4>
                <div className="tr-mode-cards-grid">
                  {[
                    { mode: 'Home Tuition', icon: 'fa-house-user', label: 'Home Tuition', desc: 'Travel to student residence for in-person classes.' },
                    { mode: 'Online Tuition', icon: 'fa-display', label: 'Online Tuition', desc: 'Conduct classes remotely via video calling software.' },
                    { mode: 'Both', icon: 'fa-arrows-split-up-and-left', label: 'Both Home & Online', desc: 'Flexible to offer both home tuition and online classes.' },
                  ].map((m) => {
                    const selected = formData.teachingMode === m.mode;
                    return (
                      <div
                        key={m.mode}
                        className={`tr-mode-card ${selected ? 'active' : ''}`}
                        onClick={() => setFormData((prev) => ({ ...prev, teachingMode: m.mode }))}
                      >
                        <i className={`fa-solid ${m.icon} tr-mode-icon`}></i>
                        <h4>{m.label}</h4>
                        <p>{m.desc}</p>
                        <div className="tr-mode-check">
                          <i className={`fa-solid ${selected ? 'fa-circle-check' : 'fa-circle-notch'}`}></i>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Conditional Home Tuition Fields */}
                {(formData.teachingMode === 'Home Tuition' || formData.teachingMode === 'Both') && (
                  <div className="tr-conditional-section">
                    <h5 className="tr-subheading">Home Tuition Preferences</h5>
                    <div className="tr-grid-2col">
                      <div className="tr-field-group">
                        <label className="tr-field-label">Preferred Teaching Areas</label>
                        <input
                          type="text"
                          name="preferredTeachingAreas"
                          className="tr-input"
                          placeholder="e.g. Saket, Malviya Nagar, Hauz Khas"
                          value={formData.preferredTeachingAreas}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="tr-field-group">
                        <label className="tr-field-label">Maximum Travel Distance</label>
                        <select name="maxTravelDistance" className="tr-select" value={formData.maxTravelDistance} onChange={handleChange}>
                          <option value="5 km">Within 5 km</option>
                          <option value="10 km">Within 10 km</option>
                          <option value="15 km">Within 15 km</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Conditional Online Tuition Fields */}
                {(formData.teachingMode === 'Online Tuition' || formData.teachingMode === 'Both') && (
                  <div className="tr-conditional-section">
                    <h5 className="tr-subheading">Online Tuition Setup</h5>
                    <div className="tr-grid-2col">
                      <div className="tr-field-group">
                        <label className="tr-field-label">Preferred Online Platform</label>
                        <input
                          type="text"
                          name="onlinePlatform"
                          className="tr-input"
                          placeholder="e.g. Zoom, Google Meet, MS Teams"
                          value={formData.onlinePlatform}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="tr-field-group">
                        <label className="tr-field-label">Laptop / Desktop Available?</label>
                        <select name="laptopAvailable" className="tr-select" value={formData.laptopAvailable} onChange={handleChange}>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>

                      <div className="tr-field-group">
                        <label className="tr-field-label">Stable High-Speed Internet?</label>
                        <select name="stableInternet" className="tr-select" value={formData.stableInternet} onChange={handleChange}>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>

                      <div className="tr-field-group">
                        <label className="tr-field-label">Digital Writing Tablet / Pen Available?</label>
                        <select name="digitalTabletAvailable" className="tr-select" value={formData.digitalTabletAvailable} onChange={handleChange}>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: AVAILABILITY & FEES */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="tr-form-step-pane">
              <div className="tr-step-heading">
                <h3>Availability & Hourly / Monthly Pricing</h3>
                <p>Specify your preferred teaching days, working hours, and fee expectations.</p>
              </div>

              {/* Availability Section */}
              <div className="tr-form-card">
                <h4 className="tr-card-title">Days Available</h4>
                <div className="tr-pill-grid">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                    const selected = formData.availableDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        className={`tr-pill-btn ${selected ? 'active' : ''}`}
                        onClick={() => handleArrayToggle('availableDays', day)}
                      >
                        <i className={`fa-solid ${selected ? 'fa-circle-check' : 'fa-circle'}`}></i> {day}
                      </button>
                    );
                  })}
                </div>

                <div className="tr-grid-2col" style={{ marginTop: '16px' }}>
                  <div className="tr-field-group">
                    <label className="tr-field-label">Preferred Start Time</label>
                    <input
                      type="time"
                      name="startTime"
                      className="tr-input"
                      value={formData.startTime}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="tr-field-group">
                    <label className="tr-field-label">Preferred End Time</label>
                    <input
                      type="time"
                      name="endTime"
                      className="tr-input"
                      value={formData.endTime}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Fees Section */}
              <div className="tr-form-card">
                <h4 className="tr-card-title">Pricing & Fee Structure</h4>
                
                <div className="tr-grid-2col">
                  <div className="tr-field-group">
                    <label className="tr-field-label">Expected Fee (₹) <span className="req">*</span></label>
                    <input
                      type="number"
                      name="expectedFee"
                      className="tr-input"
                      placeholder="e.g. 500 *"
                      value={formData.expectedFee}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="tr-field-group">
                    <label className="tr-field-label">Fee Type <span className="req">*</span></label>
                    <select name="feeType" className="tr-select" value={formData.feeType} onChange={handleChange} required>
                      <option value="Per Hour">Per Hour (₹/hr)</option>
                      <option value="Per Class">Per Class</option>
                      <option value="Monthly">Monthly Package</option>
                    </select>
                  </div>

                  <div className="tr-field-group">
                    <label className="tr-field-label">Are fees negotiable?</label>
                    <select name="negotiable" className="tr-select" value={formData.negotiable} onChange={handleChange}>
                      <option value="Yes">Yes, Negotiable</option>
                      <option value="No">No, Fixed Rate</option>
                    </select>
                  </div>
                </div>

                <div className="tr-field-group full-width" style={{ marginTop: '14px' }}>
                  <label className="tr-field-label">Additional Fee Notes / Package Discounts</label>
                  <textarea
                    name="additionalFeeNotes"
                    className="tr-textarea"
                    rows="3"
                    placeholder="e.g. Discount available for 3+ classes per week or group sessions..."
                    value={formData.additionalFeeNotes}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: DOCUMENTS & SUBMIT */}
          {/* ========================================================================= */}
          {currentStep === 5 && (
            <div className="tr-form-step-pane">
              <div className="tr-step-heading">
                <h3>Document Upload & Final Review</h3>
                <p>Upload required verification documents and accept the declaration to submit.</p>
              </div>

              {/* Uploads Grid */}
              <div className="tr-form-card">
                <h4 className="tr-card-title">Verification Documents</h4>
                
                <div className="tr-doc-uploads-grid">
                  {/* Profile Photo */}
                  <div className="tr-doc-upload-box">
                    <div className="tr-doc-header">
                      <h5>Profile Photo <span className="req">*</span></h5>
                      <small>Professional headshot photo (JPG/PNG max 5MB)</small>
                    </div>
                    {files.profilePhoto ? (
                      <div className="tr-file-preview-strip">
                        <i className="fa-solid fa-image"></i>
                        <span className="file-name">{files.profilePhoto.name}</span>
                        <button type="button" className="remove-file-btn" onClick={() => handleRemoveFile('profilePhoto')}>&times;</button>
                      </div>
                    ) : (
                      <label className="tr-file-dropzone">
                        <i className="fa-solid fa-cloud-arrow-up"></i>
                        <span>Upload Profile Photo</span>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange(e, 'profilePhoto')}
                        />
                      </label>
                    )}
                  </div>

                  {/* Qualification Document */}
                  <div className="tr-doc-upload-box">
                    <div className="tr-doc-header">
                      <h5>Qualification Certificate <span className="req">*</span></h5>
                      <small>Degree / Marksheet (PDF/JPG/PNG max 10MB)</small>
                    </div>
                    {files.qualificationDoc ? (
                      <div className="tr-file-preview-strip">
                        <i className="fa-solid fa-file-pdf"></i>
                        <span className="file-name">{files.qualificationDoc.name}</span>
                        <button type="button" className="remove-file-btn" onClick={() => handleRemoveFile('qualificationDoc')}>&times;</button>
                      </div>
                    ) : (
                      <label className="tr-file-dropzone">
                        <i className="fa-solid fa-cloud-arrow-up"></i>
                        <span>Upload Degree Certificate</span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange(e, 'qualificationDoc')}
                        />
                      </label>
                    )}
                  </div>

                  {/* ID Proof Document */}
                  <div className="tr-doc-upload-box">
                    <div className="tr-doc-header">
                      <h5>Government ID Proof <span className="req">*</span></h5>
                      <small>Aadhaar / Passport / Driving License / PAN</small>
                    </div>
                    {files.idProofDoc ? (
                      <div className="tr-file-preview-strip">
                        <i className="fa-solid fa-file-image"></i>
                        <span className="file-name">{files.idProofDoc.name}</span>
                        <button type="button" className="remove-file-btn" onClick={() => handleRemoveFile('idProofDoc')}>&times;</button>
                      </div>
                    ) : (
                      <label className="tr-file-dropzone">
                        <i className="fa-solid fa-cloud-arrow-up"></i>
                        <span>Upload ID Proof Document</span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange(e, 'idProofDoc')}
                        />
                      </label>
                    )}
                  </div>

                  {/* Experience Certificate (Optional) */}
                  <div className="tr-doc-upload-box">
                    <div className="tr-doc-header">
                      <h5>Experience Certificate</h5>
                      <small>Relieving letter / Experience proof (Optional)</small>
                    </div>
                    {files.experienceDoc ? (
                      <div className="tr-file-preview-strip">
                        <i className="fa-solid fa-file-lines"></i>
                        <span className="file-name">{files.experienceDoc.name}</span>
                        <button type="button" className="remove-file-btn" onClick={() => handleRemoveFile('experienceDoc')}>&times;</button>
                      </div>
                    ) : (
                      <label className="tr-file-dropzone">
                        <i className="fa-solid fa-cloud-arrow-up"></i>
                        <span>Upload Experience Document</span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange(e, 'experienceDoc')}
                        />
                      </label>
                    )}
                  </div>

                  {/* Resume / CV (Optional) */}
                  <div className="tr-doc-upload-box">
                    <div className="tr-doc-header">
                      <h5>Resume / CV</h5>
                      <small>Updated Curriculum Vitae (Optional)</small>
                    </div>
                    {files.resumeDoc ? (
                      <div className="tr-file-preview-strip">
                        <i className="fa-solid fa-file-pdf"></i>
                        <span className="file-name">{files.resumeDoc.name}</span>
                        <button type="button" className="remove-file-btn" onClick={() => handleRemoveFile('resumeDoc')}>&times;</button>
                      </div>
                    ) : (
                      <label className="tr-file-dropzone">
                        <i className="fa-solid fa-cloud-arrow-up"></i>
                        <span>Upload Resume / CV</span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={(e) => handleFileChange(e, 'resumeDoc')}
                        />
                      </label>
                    )}
                  </div>

                  {/* Address Proof (Optional) */}
                  <div className="tr-doc-upload-box">
                    <div className="tr-doc-header">
                      <h5>Address Proof</h5>
                      <small>Electricity bill / Rent agreement (Optional)</small>
                    </div>
                    {files.addressProofDoc ? (
                      <div className="tr-file-preview-strip">
                        <i className="fa-solid fa-file-image"></i>
                        <span className="file-name">{files.addressProofDoc.name}</span>
                        <button type="button" className="remove-file-btn" onClick={() => handleRemoveFile('addressProofDoc')}>&times;</button>
                      </div>
                    ) : (
                      <label className="tr-file-dropzone">
                        <i className="fa-solid fa-cloud-arrow-up"></i>
                        <span>Upload Address Proof</span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange(e, 'addressProofDoc')}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Bank Payment Details Subsection (Optional) */}
              <div className="tr-form-card">
                <h4 className="tr-card-title">
                  Payment Details <span style={{ fontSize: '13px', fontWeight: 'normal', color: '#64748b' }}>(Optional)</span>
                </h4>
                <p className="tr-field-hint" style={{ marginBottom: '14px' }}>Add your bank account or UPI details for direct payout transfers upon session completions.</p>
                
                <div className="tr-grid-2col">
                  <div className="tr-field-group">
                    <label className="tr-field-label">Account Holder Name</label>
                    <input
                      type="text"
                      name="accountHolderName"
                      className="tr-input"
                      placeholder="Name as per Bank Account"
                      value={formData.accountHolderName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="tr-field-group">
                    <label className="tr-field-label">Bank Name</label>
                    <input
                      type="text"
                      name="bankName"
                      className="tr-input"
                      placeholder="e.g. State Bank of India / HDFC"
                      value={formData.bankName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="tr-field-group">
                    <label className="tr-field-label">Account Number</label>
                    <input
                      type="text"
                      name="accountNumber"
                      className="tr-input"
                      placeholder="Bank Account Number"
                      value={formData.accountNumber}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="tr-field-group">
                    <label className="tr-field-label">IFSC Code</label>
                    <input
                      type="text"
                      name="ifscCode"
                      className="tr-input"
                      placeholder="e.g. SBIN0001234"
                      value={formData.ifscCode}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="tr-field-group full-width">
                    <label className="tr-field-label">UPI ID</label>
                    <input
                      type="text"
                      name="upiId"
                      className="tr-input"
                      placeholder="e.g. yourname@upi / 9876543210@paytm"
                      value={formData.upiId}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Declaration Checkbox */}
              <div className="tr-form-card">
                <label className="tr-declaration-checkbox-label">
                  <input
                    type="checkbox"
                    name="declarationAccepted"
                    checked={formData.declarationAccepted}
                    onChange={handleChange}
                    required
                  />
                  <span>
                    I confirm that the information provided by me is accurate and complete. I agree to abide by Smart HomeTutor terms of service and tutor conduct guidelines. <span className="req">*</span>
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* NAVIGATION BUTTONS BAR */}
          {/* ========================================================================= */}
          <div className="tr-step-actions-bar">
            {currentStep > 1 && (
              <button type="button" className="tr-btn tr-btn-outline" onClick={handlePrev}>
                ← Previous
              </button>
            )}

            {currentStep < 5 ? (
              <button type="button" className="tr-btn tr-btn-primary" onClick={handleNext} style={{ marginLeft: 'auto' }}>
                Next Step →
              </button>
            ) : (
              <button
                type="submit"
                className="tr-btn tr-btn-primary"
                disabled={isSubmitting || !formData.declarationAccepted}
                style={{ marginLeft: 'auto' }}
              >
                {isSubmitting ? (
                  <span><i className="fa-solid fa-spinner fa-spin"></i> Submitting...</span>
                ) : (
                  'Submit Registration'
                )}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};
