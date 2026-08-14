'use client';
import { statusBadgeClass, statusLabel } from '@/utils/helpers';

export default function Badge({ status }) {
    return (
        <span className={`badge ${statusBadgeClass(status)}`}>
            {statusLabel(status)}
        </span>
    );
}
