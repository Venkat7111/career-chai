import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        const message = err.response?.data?.error || err.message || 'Something went wrong';
        return Promise.reject(new Error(message));
    }
);

export default api;

export const authApi = {
    signup: (data) => api.post('/auth/signup', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    me: () => api.get('/auth/me'),
};

export const taskApi = {
    list: () => api.get('/tasks'),
    get: (id) => api.get(`/tasks/${id}`),
};

export const assignmentApi = {
    take: (taskId) => api.post('/assignments', { taskId }),
    myList: () => api.get('/assignments/my'),
    history: () => api.get('/assignments/history'),
    start: (id) => api.patch(`/assignments/${id}/start`),
    unassign: (id) => api.delete(`/assignments/${id}`),
};

export const resultApi = {
    submit: (data) => api.post('/results', data),
    myList: () => api.get('/results/my'),
};

export const todoApi = {
    list: (params) => api.get('/todos', { params }),
    create: (data) => api.post('/todos', data),
    update: (id, data) => api.patch(`/todos/${id}`, data),
    delete: (id) => api.delete(`/todos/${id}`),
};

export const dashboardApi = {
    user: () => api.get('/dashboard/user'),
    admin: () => api.get('/dashboard/admin'),
};

export const settingsApi = {
    get: () => api.get('/settings'),
    update: (data) => api.patch('/settings', data),
    submitContact: (data) => api.post('/settings/contact', data),
    getInquiries: () => api.get('/settings/inquiries'),
};

export const adminUserApi = {
    list: (params) => api.get('/admin/users', { params }),
    get: (id) => api.get(`/admin/users/${id}`),
    setStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }),
};

export const adminTaskApi = {
    list: (params) => api.get('/admin/tasks', { params }),
    get: (id) => api.get(`/admin/tasks/${id}`),
    create: (data) => api.post('/admin/tasks', data),
    update: (id, data) => api.patch(`/admin/tasks/${id}`, data),
    setStatus: (id, status) => api.patch(`/admin/tasks/${id}/status`, { status }),
};

export const adminAssignmentApi = {
    list: (params) => api.get('/admin/assignments', { params }),
    remove: (id, data) => api.delete(`/admin/assignments/${id}`, { data }),
};

export const adminResultApi = {
    list: (params) => api.get('/admin/results', { params }),
    get: (id) => api.get(`/admin/results/${id}`),
};

export const challengeApi = {
    list: () => api.get('/challenges'),
    getStreak: () => api.get('/challenges/streak/my'),
    submit: (id, data) => api.post(`/challenges/${id}/submit`, data),
    compile: (data) => api.post('/challenges/compile', data),
};

export const adminChallengeApi = {
    list: () => api.get('/admin/challenges'),
    create: (data) => api.post('/admin/challenges', data),
    update: (id, data) => api.patch(`/admin/challenges/${id}`, data),
    delete: (id) => api.delete(`/admin/challenges/${id}`),
    submissions: () => api.get('/admin/challenges/submissions'),
    review: (id, data) => api.patch(`/admin/challenges/submissions/${id}/review`, data),
};
