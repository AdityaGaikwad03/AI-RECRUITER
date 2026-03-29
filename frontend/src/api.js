import axios from 'axios';
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});
API.interceptors.request.use(c => { const t = localStorage.getItem('hiresmart_token'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

// Auth
export const signup = (d) => API.post('/auth/signup', d);
export const login = (d) => API.post('/auth/login', d);

// Candidates
export const getMyProfile = () => API.get('/candidates/me');
export const updateProfile = (d) => API.put('/candidates/me', d);
export const searchCandidates = (p) => API.get('/candidates/search', { params: p });
export const getCandidateById = (id) => API.get(`/candidates/${id}`);
export const getPublicProfile = (id) => API.get(`/candidates/public/${id}`);

// Recruiters
export const getRecruiterProfile = () => API.get('/recruiters/me');
export const toggleShortlist = (id) => API.post(`/recruiters/shortlist/${id}`);
export const getShortlist = () => API.get('/recruiters/shortlist');

// AI
export const aiParseExperience = (text) => API.post('/ai/parse-experience', { text });
export const aiSuggestSkills = (role, current_skills) => API.post('/ai/suggest-skills', { role, current_skills });
export const aiGenerateSummary = (data) => API.post('/ai/generate-summary', data);
export const aiChat = (message, context, step) => API.post('/ai/chat', { message, context, step });
export const aiRecommendRoles = (data) => API.post('/ai/recommend-roles', data);

export default API;
