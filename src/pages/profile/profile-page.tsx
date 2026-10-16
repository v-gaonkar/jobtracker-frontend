import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import { SidebarNav } from "../components/sidebar-nav";
import { BufferLoader } from "../components/common/BufferingLoader";
import './profile-page.css';
import axios from "axios";

interface ProfileData {
    username?: string;
    email?: string;
    targetRole?: string;
    yearsExperience?: number;
    bio?: string;
    location?: string;
}

export function ProfilePage() {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [targetRole, setTargetRole] = useState<string>('');
    const [yearsExperience, setYearsExperience] = useState<string>('');
    const [bio, setBio] = useState<string>('');
    const [location, setLocation] = useState<string>('');

    useEffect(() => {
        async function fetchProfile() {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get('/api/user/profile');
                setProfile(response.data);
                setUsername(response.data.username || '');
                setEmail(response.data.email || '');
                setTargetRole(response.data.targetRole || '');
                setYearsExperience(response.data.yearsExperience?.toString() || '');
                setBio(response.data.bio || '');
                setLocation(response.data.location || '');
            } catch {
                setError('Failed to load profile.');
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, []);

    async function handleSave(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const payload = {
            username,
            email,
            targetRole: targetRole || null,
            yearsExperience: yearsExperience ? Number(yearsExperience) : null,
            bio: bio || null,
            location: location || null,
        };

        try {
            const response = await api.put('/api/user/profile', payload);
            setProfile(response.data);
            setIsEditing(false);
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.message || 'Failed to save changes.');
            } else {
                setError('Could not reach the server. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }

    function handleCancel() {
        if (profile) {
            setUsername(profile.username || '');
            setEmail(profile.email || '');
            setTargetRole(profile.targetRole || '');
            setYearsExperience(profile.yearsExperience?.toString() || '');
            setBio(profile.bio || '');
            setLocation(profile.location || '');
        }
        setIsEditing(false);
    }

    if (loading && !profile) {
        return (
            <div className="app-shell">
                <SidebarNav />
                <main className="content profile-content">
                    <BufferLoader variant="contentOverlay" label="Loading profile..." />
                </main>
            </div>
        );
    }

    return (
        <div className="app-shell">
            <SidebarNav />
            <main className="content profile-content">
                <div className="profile-heading">
                    <h1>Profile</h1>
                    <p>Manage your account and preferences</p>
                </div>

                {error && <div className="form-help" style={{ color: '#b91c1c' }}>{error}</div>}

                <section className="card profile-card">
                    <div className="profile-card-header">
                        <div className="profile-summary">
                            <div className="profile-large-avatar">
                                {(profile?.username || '?').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <strong>{profile?.username}</strong>
                                <span>{profile?.email}</span>
                            </div>
                        </div>
                        {!isEditing && (
                            <button className="btn btn-secondary btn-sm" type="button" onClick={() => setIsEditing(true)}>
                                Edit profile
                            </button>
                        )}
                    </div>

                    {!isEditing ? (
                        <div className="profile-view-fields profile-fields">
                            <div className="profile-field">
                                <label>Full Name</label>
                                <div className="profile-value">{profile?.username || '—'}</div>
                            </div>
                            <div className="profile-field">
                                <label>Email</label>
                                <div className="profile-value">{profile?.email || '—'}</div>
                            </div>
                            <div className="profile-field full-width">
                                <label>Job Title (Target)</label>
                                <div className="profile-value">{profile?.targetRole || '—'}</div>
                            </div>
                            <div className="profile-field">
                                <label>Years of Experience</label>
                                <div className="profile-value">{profile?.yearsExperience ?? '—'}</div>
                            </div>
                            <div className="profile-field">
                                <label>Location</label>
                                <div className="profile-value">{profile?.location || '—'}</div>
                            </div>
                            <div className="profile-field full-width">
                                <label>Bio</label>
                                <div className="profile-value">{profile?.bio || '—'}</div>
                            </div>
                        </div>
                    ) : (
                        <form className="profile-edit-fields profile-fields" onSubmit={handleSave}>
                            <div className="profile-field">
                                <label htmlFor="full-name">Full Name</label>
                                <input className="input" id="full-name" value={username} onChange={(e) => setUsername(e.target.value)} required />
                            </div>
                            <div className="profile-field">
                                <label htmlFor="email">Email</label>
                                <input className="input" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            <div className="profile-field full-width">
                                <label htmlFor="target-title">Job Title (Target)</label>
                                <input className="input" id="target-title" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
                            </div>
                            <div className="profile-field">
                                <label htmlFor="years-exp">Years of Experience</label>
                                <input className="input" id="years-exp" type="number" min="0" value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} />
                            </div>
                            <div className="profile-field">
                                <label htmlFor="location">Location</label>
                                <input className="input" id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
                            </div>
                            <div className="profile-field full-width">
                                <label htmlFor="bio">Bio</label>
                                <textarea className="input" id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
                            </div>
                            <div className="profile-actions full-width">
                                <button className="btn btn-secondary btn-sm" type="button" onClick={handleCancel}>Cancel</button>
                                <button className="btn btn-primary btn-sm" type="submit" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save changes'}
                                </button>
                            </div>
                        </form>
                    )}
                </section>
            </main>
        </div>
    );
}