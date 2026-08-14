'use client';
import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = 600 }) {
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ maxWidth }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div>
                        {title && <div className="modal-title">{title}</div>}
                        {subtitle && <div className="modal-subtitle">{subtitle}</div>}
                    </div>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={18} /></button>
                </div>
                {children}
            </div>
        </div>
    );
}
