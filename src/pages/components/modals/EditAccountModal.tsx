import { useEffect, useRef, useState } from 'react';
import api from '../../../api/axiosInstance';
import axios from 'axios';

interface ProfileSummary {
    username?: string;
    email?: string;
    targetRole?: string;
}

interface EditAccountModalProps {
    currentUsername: string;
    currentEmail: string;
    onClose: () => void;
    onSaved: (profile: ProfileSummary) => void;
}

export function EditAccountModal({ currentUsername, currentEmail, onClose, onSaved }: EditAccountModalProps) {
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const [name, setName] = useState(currentUsername);
    const [email, setEmail] = useState(currentEmail);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

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

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await api.put('/api/users/profile', {
                username: name,
                email: email,
            });
            onSaved(response.data);
            onClose();
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.message || 'Failed to save changes.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="account-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="account-modal" role="dialog" aria-modal="true" aria-labelledby="edit-account-title">
                <div className="account-modal-header">
                    <div>
                        <div className="account-modal-title" id="edit-account-title">Edit Account</div>
                        <div className="account-modal-subtitle">Update your profile and security settings</div>
                    </div>
                    <button className="account-modal-close" type="button" aria-label="Close" ref={closeButtonRef} onClick={onClose}>
                        &times;
                    </button>
                </div>

                <form className="account-modal-form" onSubmit={handleSubmit}>
                    <div className="account-modal-section">
                        <div className="account-modal-section-title">Profile</div>
                        <label>
                            Full Name
                            <input className="input" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
                        </label>
                        <label>
                            Email address
                            <input className="input" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </label>
                    </div>

                    <div className="account-modal-divider" />

                    <div className="account-modal-section">
                        <div className="account-modal-section-title">Change Password</div>
                        <p className="form-help">Password changes aren't available yet — coming soon.</p>
                    </div>

                    {error && <p className="form-help" style={{ color: '#b91c1c' }}>{error}</p>}

                    <div className="account-modal-footer">
                        <button className="btn btn-secondary btn-sm" type="button" onClick={onClose}>Cancel</button>
                        <button className="btn btn-primary btn-sm" type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}