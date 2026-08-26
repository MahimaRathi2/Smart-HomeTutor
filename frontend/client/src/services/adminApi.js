/**
 * Admin Dashboard Centralized API Service
 */

export const adminApi = {
  // Stats & Metrics
  async getStats() {
    const res = await fetch('/api/admin/stats', { headers: { Accept: 'application/json' } });
    return res.json();
  },

  // User Management
  async getAllUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `/api/admin/users${query ? `?${query}` : ''}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    return res.json();
  },

  async updateUserRole(id, role) {
    const res = await fetch(`/api/admin/user/${id}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ role })
    });
    return res.json();
  },

  async deleteUser(id) {
    const res = await fetch(`/api/admin/user/${id}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' }
    });
    return res.json();
  },

  // Tutor Verifications & Documents
  async getPendingDocuments() {
    const res = await fetch('/api/admin/pending-documents', { headers: { Accept: 'application/json' } });
    return res.json();
  },

  async getTutorApplications(status = 'all') {
    const res = await fetch(`/api/admin/tutor-applications?status=${status}`, { headers: { Accept: 'application/json' } });
    return res.json();
  },

  async getTutorApplicationDetails(id) {
    const res = await fetch(`/api/admin/tutor-applications/${id}`, { headers: { Accept: 'application/json' } });
    return res.json();
  },

  async verifyDocument(tutorProfileId, status = 'Approved') {
    const res = await fetch(`/api/admin/tutor-applications/${tutorProfileId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  async verifyTutor(tutorId) {
    const res = await fetch(`/api/admin/tutor/${tutorId}/verify`, {
      method: 'PATCH',
      headers: { Accept: 'application/json' }
    });
    return res.json();
  },

  // Activity & Security Audit Logs
  async getActivityLogs() {
    const res = await fetch('/api/admin/activity-logs', { headers: { Accept: 'application/json' } });
    return res.json();
  },

  async getSecurityAudit() {
    const res = await fetch('/api/admin/security-audit', { headers: { Accept: 'application/json' } });
    return res.json();
  },

  // Certificate Approvals
  async getCertificateRequests() {
    const res = await fetch('/api/admin/certificate-requests', { headers: { Accept: 'application/json' } });
    return res.json();
  },

  async approveCertificate(id) {
    const res = await fetch(`/api/admin/certificate-requests/${id}/approve`, {
      method: 'POST',
      headers: { Accept: 'application/json' }
    });
    return res.json();
  },

  async rejectCertificate(id) {
    const res = await fetch(`/api/admin/certificate-requests/${id}/reject`, {
      method: 'POST',
      headers: { Accept: 'application/json' }
    });
    return res.json();
  },

  // Finance, Revenue & Payouts
  async getFinanceRevenue() {
    const res = await fetch('/api/admin/finance-revenue', { headers: { Accept: 'application/json' } });
    return res.json();
  },

  async getPaymentHistory(params = {}) {
    const cleanParams = {};
    Object.keys(params).forEach((key) => {
      const val = params[key];
      if (val !== undefined && val !== null && val !== '') {
        if (key === 'status' && String(val).toLowerCase() === 'all') {
          return;
        }
        cleanParams[key] = val;
      }
    });

    const query = new URLSearchParams(cleanParams).toString();
    const url = `/api/admin/payments${query ? `?${query}` : ''}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    return res.json();
  },

  async getPayoutRequests() {
    const res = await fetch('/api/admin/payout-requests', { headers: { Accept: 'application/json' } });
    return res.json();
  },

  async approvePayout(id) {
    const res = await fetch(`/api/admin/payout-requests/${id}/approve`, {
      method: 'POST',
      headers: { Accept: 'application/json' }
    });
    return res.json();
  },

  async rejectPayout(id) {
    const res = await fetch(`/api/admin/payout-requests/${id}/reject`, {
      method: 'POST',
      headers: { Accept: 'application/json' }
    });
    return res.json();
  },

  // Demo Class & Booking Management
  async getAllBookings() {
    const res = await fetch('/api/admin/bookings', { headers: { Accept: 'application/json' } });
    return res.json();
  },

  async approveBooking(bookingId) {
    const res = await fetch(`/api/admin/bookings/${bookingId}/approve`, {
      method: 'PATCH',
      headers: { Accept: 'application/json' }
    });
    return res.json();
  },

  async rejectBooking(bookingId) {
    const res = await fetch(`/api/admin/bookings/${bookingId}/reject`, {
      method: 'PATCH',
      headers: { Accept: 'application/json' }
    });
    return res.json();
  },

  // Catalog & Subjects
  async getSubjects() {
    const res = await fetch('/api/admin/subjects', { headers: { Accept: 'application/json' } });
    return res.json();
  },

  async addSubject(subjectData) {
    const res = await fetch('/api/admin/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(subjectData)
    });
    return res.json();
  },

  async updateSubject(id, subjectData) {
    const res = await fetch(`/api/admin/subjects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(subjectData)
    });
    return res.json();
  },

  async deleteSubject(id) {
    const res = await fetch(`/api/admin/subjects/${id}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' }
    });
    return res.json();
  },

  // Bulk Announcements & Security
  async sendBulkNotification(data) {
    const res = await fetch('/api/admin/bulk-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getAllComplaints() {
    const res = await fetch('/api/admin/complaints', { headers: { Accept: 'application/json' } });
    return res.json();
  },

  async resolveComplaint(id, payload = {}) {
    const res = await fetch(`/api/admin/complaints/${id}/resolve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Blog Management (CMS)
  async getAllBlogs() {
    const res = await fetch('/api/admin/blogs', { headers: { Accept: 'application/json' } });
    return res.json();
  },

  async createBlog(blogData) {
    const res = await fetch('/api/admin/blogs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(blogData)
    });
    return res.json();
  },

  async updateBlog(id, blogData) {
    const res = await fetch(`/api/admin/blogs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(blogData)
    });
    return res.json();
  },

  async togglePublishBlog(id) {
    const res = await fetch(`/api/admin/blogs/${id}/publish`, {
      method: 'PATCH',
      headers: { Accept: 'application/json' }
    });
    return res.json();
  },

  async deleteBlog(id) {
    const res = await fetch(`/api/admin/blogs/${id}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' }
    });
    return res.json();
  },

  // Admin Chat Unlock Management
  async toggleBookingChatUnlock(bookingId) {
    const res = await fetch(`/api/admin/booking/${bookingId}/toggle-chat-unlock`, {
      method: 'PATCH',
      headers: { Accept: 'application/json' }
    });
    return res.json();
  },

  async toggleUserChatUnlock(userId) {
    const res = await fetch(`/api/admin/user/${userId}/toggle-chat-unlock`, {
      method: 'PATCH',
      headers: { Accept: 'application/json' }
    });
    return res.json();
  },

  async deleteBooking(bookingId) {
    const res = await fetch(`/api/admin/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' }
    });
    return res.json();
  },

  // Newsletter Subscriber Management
  async getNewsletterSubscribers(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `/api/admin/newsletter/subscribers${query ? `?${query}` : ''}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    return res.json();
  },

  async unsubscribeNewsletterSubscriber(id) {
    const res = await fetch(`/api/admin/newsletter/subscribers/${id}/unsubscribe`, {
      method: 'PATCH',
      headers: { Accept: 'application/json' }
    });
    return res.json();
  }
};
