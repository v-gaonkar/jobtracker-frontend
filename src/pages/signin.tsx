import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../api/axiosInstance';
import '../assets/styles/auth.css';
import { tokenStorage } from '../utils/tokenStorage';

export function Signin() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [rememberMe, setRememberMe] = useState(false);

    const navigate = useNavigate();

    async function handleSignin(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault(); 
        if(!email || !password) {
            setError('Please fill in all fields');
            return;
        }
        setLoading(true);
        setError(null);
        try {
             const response = await api.post('/api/auth/login', {
                email,
                password
            });
            setLoading(false);
            if(response.status === 200 && response.data) {
                console.log('Login successful:', response.data);
                tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken, rememberMe);
                navigate('/applications'); 
            }
        } catch (err: unknown) {
            if(axios.isAxiosError(err) && err.response) {
                setError(err.response.data.message || 'An error occurred while signing in. Please try again.');
            }
        }
    }
    
    return (
        <>
            <title>Jobtracker - Login</title>
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
                        <div className="auth-heading">
                            <h1>Sign in</h1>
                            <p>Welcome back — let's pick up where you left off.</p>
                        </div>

                        <form className="auth-form">
                            <div className="form-field">
                                <label className="form-label">Email address</label>
                                <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} id="email" type="email" placeholder="alex@example.com" />
                            </div>
                            <div className="form-field">
                                <label className="form-label">Password</label>
                                <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} id="password" type="password" placeholder="••••••••" />
                            </div>

                            {error && <span className="form-help">{error}</span>}

                            <div className="auth-actions">
                                <label className="checkbox-inline">
                                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}/>
                                    <span>Remember me</span>
                                </label>
                                <Link className="auth-link" to="/forgot-password">Forgot password?</Link>
                            </div>

                            <button className="btn btn-primary" type="submit" onClick={handleSignin}>
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>

                            <div className="divider"><span>or</span></div>

                            <p className="auth-footer">
                                Don&apos;t have an account?
                                <Link className="auth-link" to="/signup"> Sign up</Link>
                            </p>
                        </form>
                    </div>
                </main>
            </div>
        </>

    );
}