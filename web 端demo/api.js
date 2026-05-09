const API_BASE = 'http://localhost:8080/api';

async function fetchJSON(url, options = {}) {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: '请求失败' }));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }
    return res.json();
  } catch(e) {
    console.error('API Error:', e);
    throw e;
  }
}

const api = {
  async getResumes() {
    return fetchJSON(`${API_BASE}/resumes`);
  },
  async uploadResume(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/resumes/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || '上传失败');
    }
    return res.json();
  },
  async deleteResume(id) {
    return fetchJSON(`${API_BASE}/resumes/${id}`, { method: 'DELETE' });
  },
  async setDefaultResume(id) {
    return fetchJSON(`${API_BASE}/resumes/${id}/default`, { method: 'PUT' });
  },

  async getPortfolios() {
    return fetchJSON(`${API_BASE}/portfolios`);
  },
  async uploadPortfolio(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/portfolios/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('上传失败');
    return res.json();
  },
  async deletePortfolio(id) {
    return fetchJSON(`${API_BASE}/portfolios/${id}`, { method: 'DELETE' });
  },

  async getJDs() {
    return fetchJSON(`${API_BASE}/jd`);
  },
  async uploadJD(data) {
    const formData = new FormData();
    formData.append('company_name', data.company_name || '');
    formData.append('job_title', data.job_title || '');
    formData.append('job_text', data.job_text || '');
    if (data.file) formData.append('file', data.file);
    const res = await fetch(`${API_BASE}/jd/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('上传失败');
    return res.json();
  },

  async getMatchInstances() {
    return fetchJSON(`${API_BASE}/match/instances`);
  },
  async getMatchInstance(id) {
    return fetchJSON(`${API_BASE}/match/instances/${id}`);
  },
  async analyzeMatch(data) {
    return fetchJSON(`${API_BASE}/match/analyze`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  async deleteMatchInstance(id) {
    return fetchJSON(`${API_BASE}/match/instances/${id}`, { method: 'DELETE' });
  },

  async getInterviews() {
    return fetchJSON(`${API_BASE}/interview`);
  },
  async getInterview(id) {
    return fetchJSON(`${API_BASE}/interview/${id}`);
  },
  async startInterview(data) {
    return fetchJSON(`${API_BASE}/interview/start`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  async submitAnswer(interviewId, content, questionIndex) {
    return fetchJSON(`${API_BASE}/interview/${interviewId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ content, question_index: questionIndex })
    });
  },
  async submitReverseQuestion(interviewId, content) {
    return fetchJSON(`${API_BASE}/interview/${interviewId}/reverse-question`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  },
  async finishInterview(interviewId) {
    return fetchJSON(`${API_BASE}/interview/${interviewId}/finish`, { method: 'POST' });
  },
  async getInterviewMessages(interviewId) {
    return fetchJSON(`${API_BASE}/interview/${interviewId}/messages`);
  },

  async getAIResult(requestId) {
    return fetchJSON(`${API_BASE}/ai/result/${requestId}`);
  },
  async getPendingAIRequests() {
    return fetchJSON(`${API_BASE}/ai/pending`);
  },
  async postAIResult(requestId, result, status = 'done') {
    return fetchJSON(`${API_BASE}/ai/result/${requestId}`, {
      method: 'POST',
      body: JSON.stringify({ result, status }),
    });
  },

  async pollResult(requestId, { interval = 2000, maxAttempts = 60 } = {}) {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const res = await this.getAIResult(requestId);
        if (res.status === 'done' || res.status === 'failed') {
          return res;
        }
      } catch(e) {
        // ignore polling errors
      }
      await new Promise(r => setTimeout(r, interval));
    }
    return { status: 'timeout', result: null };
  }
};

window.api = api;
