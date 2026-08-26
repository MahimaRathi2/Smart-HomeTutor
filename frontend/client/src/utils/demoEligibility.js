/**
 * Utility helper to check if a student has completed a demo class with a specific tutor.
 */
export const isDemoCompletedForTutor = (tutor, completedDemoTutorIds = []) => {
  if (!tutor || !Array.isArray(completedDemoTutorIds) || completedDemoTutorIds.length === 0) {
    return false;
  }

  const tutorUserId = tutor.user
    ? (typeof tutor.user === 'object' ? (tutor.user._id ? tutor.user._id.toString() : '') : tutor.user.toString())
    : (tutor._id ? tutor._id.toString() : '');

  const tutorProfileId = tutor._id ? tutor._id.toString() : '';

  return completedDemoTutorIds.some((id) => {
    if (!id) return false;
    const idStr = id.toString();
    return (tutorUserId && idStr === tutorUserId) || (tutorProfileId && idStr === tutorProfileId);
  });
};

/**
 * Utility helper to check if a student has a pending demo request with a specific tutor.
 */
export const isPendingDemoForTutor = (tutor, pendingDemoTutorIds = []) => {
  if (!tutor || !Array.isArray(pendingDemoTutorIds) || pendingDemoTutorIds.length === 0) {
    return false;
  }

  const tutorUserId = tutor.user
    ? (typeof tutor.user === 'object' ? (tutor.user._id ? tutor.user._id.toString() : '') : tutor.user.toString())
    : (tutor._id ? tutor._id.toString() : '');

  const tutorProfileId = tutor._id ? tutor._id.toString() : '';

  return pendingDemoTutorIds.some((id) => {
    if (!id) return false;
    const idStr = id.toString();
    return (tutorUserId && idStr === tutorUserId) || (tutorProfileId && idStr === tutorProfileId);
  });
};
