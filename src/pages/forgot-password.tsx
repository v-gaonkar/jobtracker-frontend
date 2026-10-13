import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import api from '../api/axiosInstance';
import '../assets/styles/auth.css';

export function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await api.post('/api/auth/forgot-password', { email });
            setSubmitted(true);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data?.message || 'Something went wrong. Please try again.');
            } else {
                setError('Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <title>Jobtracker - Forgot Password</title>
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
                        {submitted ? (
                            <>
                                <div className="auth-heading">
                                    <h1>Check your email</h1>
                                    <p>If {email} is associated with an account, we've sent a password reset link. It expires in 30 minutes.</p>
                                </div>
                                <Link className="btn btn-primary" to="/signin">Back to Sign In</Link>
                                <p className="auth-footer">
                                    Wrong email, or no account yet?
                                    <Link className="auth-link" to="/signup"> Sign up</Link>
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="auth-heading">
                                    <h1>Forgot password</h1>
                                    <p>Enter the email address associated with your account, and we'll send you a link to reset your password.</p>
                                </div>

                                <form className="auth-form" onSubmit={handleSubmit}>
                                    <div className="form-field">
                                        <label className="form-label">Email address</label>
                                        <input
                                            className="input"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="alex@example.com"
                                            required
                                        />
                                    </div>

                                    {error && <span className="form-help">{error}</span>}

                                    <button className="btn btn-primary" type="submit" disabled={loading}>
                                        {loading ? 'Sending...' : 'Send Reset Link'}
                                    </button>

                                    <p className="auth-footer">
                                        Don&apos;t have an account?
                                        <Link className="auth-link" to="/signup"> Sign up</Link>
                                    </p>
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
