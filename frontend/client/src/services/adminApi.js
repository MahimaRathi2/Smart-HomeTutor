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

  async verifyDocument(tutorProfileId, status = 'Approved') {
    const res = await fetch(`/api/admin/document-verify/${tutorProfileId}`, {
      method: 'PATCH',
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

  async resolveComplaint(id) {
    const res = await fetch(`/api/admin/complaints/${id}/resolve`, {
      method: 'PATCH',
      headers: { Accept: 'application/json' }
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
  }
};
