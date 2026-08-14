import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

export const fmtDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return isValid(d) ? format(d, 'MMM d, yyyy') : '—';
};

export const fmtDateTime = (dateStr) => {
    if (!dateStr) return '—';
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return isValid(d) ? format(d, 'MMM d, yyyy h:mm a') : '—';
};

export const fmtRelative = (dateStr) => {
    if (!dateStr) return '—';
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : '—';
};

export const initials = (name = '') =>
    name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

export const statusBadgeClass = (status = '') => {
    const map = {
        PENDING: 'badge-pending',
        ACTIVE: 'badge-active',
        REJECTED: 'badge-rejected',
        REVOKED: 'badge-revoked',
        DISABLED: 'badge-disabled',
        DRAFT: 'badge-draft',
        PUBLISHED: 'badge-published',
        REMOVED: 'badge-removed',
        NOT_STARTED: 'badge-not-started',
        IN_PROGRESS: 'badge-in-progress',
        COMPLETED: 'badge-completed',
        LOW: 'badge-low',
        MEDIUM: 'badge-medium',
        HIGH: 'badge-high',
    };
    return map[status.toUpperCase()] || 'badge-draft';
};

export const statusLabel = (status = '') => status.replace(/_/g, ' ');
