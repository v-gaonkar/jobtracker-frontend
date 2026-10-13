import { useEffect, useRef } from 'react';

interface ProfileSummary {
    username?: string;
    email?: string;
    targetRole?: string;
}

interface ViewProfileModalProps {
    profile: ProfileSummary;
    onClose: () => void;
    onEdit: () => void;
}

export function ViewProfileModal({ profile, onClose, onEdit }: ViewProfileModalProps) {
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        closeButtonRef.current?.focus();
    }, []);

    useEffect(() => {
        function handleEscape(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const initials = profile.username
        ? profile.username.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
        : '?';

    return (
        <div className="account-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="account-modal profile-view-modal" role="dialog" aria-modal="true" aria-labelledby="view-profile-title">
                <div className="account-modal-header">
                    <div>
                        <div className="account-modal-title" id="view-profile-title">Profile</div>
                        <div className="account-modal-subtitle">Your job seeker profile</div>
                    </div>
                    <button className="account-modal-close" type="button" aria-label="Close" ref={closeButtonRef} onClick={onClose}>
                        &times;
                    </button>
                </div>

                <div className="profile-modal-body">
                    <div className="profile-modal-summary">
                        <div className="profile-large-avatar">{initials}</div>
                        <div>
                            <strong>{profile.username}</strong>
                            <span>{profile.email}</span>
                        </div>
                    </div>
                    <div className="profile-modal-fields">
                        <div>
                            <span>Full Name</span>
                            <strong>{profile.username || '—'}</strong>
                        </div>
                        <div>
                            <span>Email</span>
                            <strong>{profile.email || '—'}</strong>
                        </div>
                        <div>
                            <span>Job Title (Target)</span>
                            <strong>{profile.targetRole || '—'}</strong>
                        </div>
                    </div>
                </div>

                <div className="account-modal-footer">
                    <button className="btn btn-secondary btn-sm" type="button" onClick={onClose}>Close</button>
                    <button className="btn btn-primary btn-sm" type="button" onClick={onEdit}>Edit Profile</button>
                </div>
            </div>
        </div>
    );
}