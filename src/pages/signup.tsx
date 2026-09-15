import {useState} from 'react';
import axios from 'axios';
import api from '../api/axiosInstance';
import { Link, useNavigate } from 'react-router-dom';

import '../assets/styles/auth.css';

export function Signup() {
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    // const [termsAccepted, setTermsAccepted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const navigate = useNavigate();

    async function handleSignup(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        if(!username || !email || !password || !confirmPassword) {  
            setError('Please fill in all fields');
            return;
        }
        if(password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        setError(null);

        try {
            await api.post('/api/user/register', {
            username,
            email,
            password
            });
            navigate('/login');
        } catch (err: unknown) {
            if(axios.isAxiosError(err) && err.response) {
                setError(err.response.data.message || 'An error occurred while signing up. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
        <title>Jobtracker - Signup</title>
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
                        <h1>Create your account</h1>
                        <p>Start tracking your job search today.</p>
                    </div>

                    <form className="auth-form">
                        <div className="form-field">
                            <label className="form-label">User Name</label>
                            <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} id="username" type="text" placeholder="AlexMorgan" required />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Email address</label>
                            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} id="email" type="email" placeholder="alex@example.com" required />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Password</label>
                            <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} id="password" type="password" placeholder="••••••••" required />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Confirm Password</label>
                            <input className="input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} id="confirm" type="password" placeholder="••••••••" required />
                            {password === confirmPassword ? 
                            null : (<span className="form-help">Passwords don&apos;t match</span>)} 
                        </div>

                        {/* <label className="terms-inline">
                            <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} required/>
                            <span>I agree to the <a className="auth-link" href="#">Terms &amp; Conditions</a></span>
                        </label> */}
                        {error && <span className="form-help">{error}</span>}

                        <button className="btn btn-primary" type="submit" onClick={handleSignup} disabled={loading}>
                            {loading ? 'Signing Up...' : 'Sign Up'}
                        </button>

                        <div className="divider"><span>or</span></div>

                        <p className="auth-footer">
                            Already have an account?
                            <Link className="auth-link" to="/signin"> Sign in</Link>
                        </p>
                    </form>
                </div>
            </main>
        </div>
        </>
        
    );
}