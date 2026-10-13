import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import api from '../api/axiosInstance';
import '../assets/styles/auth.css';

export function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') ?? '';
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!token) {
            setError('This reset link is invalid. Please request a new one.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/api/auth/reset-password', { token, newPassword });
            setSuccess(true);
            setTimeout(() => navigate('/signin'), 2000);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data?.message || 'This reset link is invalid or has expired.');
            } else {
                setError('This reset link is invalid or has expired.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <title>Jobtracker - Reset Password</title>
            <div className="auth-root">
                <aside className="auth-left">
                    <div className="auth-panel">
                        <div className="logo-mark" aria-hidden="true">
                            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                                <path d="M5 21V11l8-6 8 6v10H17V15h-6v6H5z" fill="white" />
                            </svg>
                        </div>
                        <h1 className="auth-brand">Tracker</h1>
                        <p className="auth-copy">Stay on top of your job search — every application, interview, and offer in one place.</p>
                        <div className="feature-list">
                            <div className="feature-card"><span>Track every application in one place</span></div>
                            <div className="feature-card"><span>Never miss an interview or deadline</span></div>
                            <div className="feature-card"><span>See all your offers at a glance</span></div>
                        </div>
                    </div>
                </aside>

                <div className="auth-banner">
                    <div className="banner-icon" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 26 26" fill="none">
                            <path d="M5 21V11l8-6 8 6v10H17V15h-6v6H5z" fill="white" />
                        </svg>
                    </div>
                    <div>
                        <span className="auth-banner-name">Trackr</span>
                        <span className="auth-banner-tag">Stay on top of your job search</span>
                    </div>
                </div>

                <main className="auth-right">
                    <div className="auth-form-wrapper">
                        {success ? (
                            <div className="auth-heading">
                                <h1>Password reset</h1>
                                <p>Your password has been updated. Redirecting to sign in...</p>
                            </div>
                        ) : (
                            <>
                                <div className="auth-heading">
                                    <h1>Reset password</h1>
                                    <p>Choose a new password for your account.</p>
                                </div>

                                <form className="auth-form" onSubmit={handleSubmit}>
                                    <div className="form-field">
                                        <label className="form-label">New Password</label>
                                        <input
                                            className="input"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label className="form-label">Confirm Password</label>
                                        <input
                                            className="input"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>

                                    {error && <span className="form-help">{error}</span>}

                                    <button className="btn btn-primary" type="submit" disabled={loading}>
                                        {loading ? 'Resetting...' : 'Reset Password'}
                                    </button>

                                    <p className="auth-footer">
                                        Remembered your password?
                                        <Link className="auth-link" to="/signin"> Sign in</Link>
                                    </p>
                                </form>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}
