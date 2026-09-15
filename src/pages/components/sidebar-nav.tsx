import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from "../../api/axiosInstance";
import { useProfile } from '../../contexts/ProfileContext';
import { ViewProfileModal } from './modals/ViewProfileModal';
import { EditAccountModal } from './modals/EditAccountModal';
import { tokenStorage } from '../../utils/tokenStorage';

export function SidebarNav() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeModal, setActiveModal] = useState<'view' | 'edit' | null>(null);
    const footerRef = useRef<HTMLDivElement>(null);
    const toggleRef = useRef<HTMLButtonElement>(null);
    const navigate = useNavigate();

    const { profile, updateProfile } = useProfile();

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (footerRef.current && !footerRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        function handleEscape(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                setMenuOpen(false);
                toggleRef.current?.focus();
            }
        }
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

   async function handleSignOut() {
        setMenuOpen(false);
        const refreshToken = localStorage.getItem('refreshToken');
        try {
            if (refreshToken) {
                await api.post('/api/auth/logout', { refreshToken });
            }
        } catch {
            // even if logout call fails, still clear local state and redirect
        }
        tokenStorage.clear();
        navigate('/signin');
    }

    function openViewProfile() {
        setMenuOpen(false);
        setActiveModal('view');
    }

    function openEditAccount() {
        setMenuOpen(false);
        setActiveModal('edit');
    }

    function closeModal() {
        setActiveModal(null);
    }

    function switchToEdit() {
        setActiveModal('edit');
    }

    const initials = profile?.username
        ? profile.username.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
        : '?';

    return (
        <>
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-inner">
                        <div className="sidebar-logo-mark" aria-hidden="true">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M3 12V7l5-4 5 4v5h-3V9H6v3H3z" fill="white" />
                            </svg>
                        </div>
                        <span className="sidebar-logo-text">Trackr</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}>
                        <span className="nav-icon" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" />
                                <rect x="11" y="1" width="6" height="6" rx="1.5" fill="currentColor" />
                                <rect x="1" y="11" width="6" height="6" rx="1.5" fill="currentColor" />
                                <rect x="11" y="11" width="6" height="6" rx="1.5" fill="currentColor" />
                            </svg>
                        </span>
                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink to="/applications" className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}>
                        <span className="nav-icon" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5v10.5a.75.75 0 0 1-1.162.626L9 12.868l-4.838 2.258A.75.75 0 0 1 3 15V4.5z" fill="currentColor" />
                            </svg>
                        </span>
                        <span>Applications</span>
                    </NavLink>

                    <NavLink to="/companies" className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}>
                        <span className="nav-icon" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M2 15.5V6.5l6-4 6 4v9H11v-5H7v5H2z" fill="currentColor" />
                            </svg>
                        </span>
                        <span>Companies</span>
                    </NavLink>

                    <NavLink to="/calendar" className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}>
                        <span className="nav-icon" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <rect x="2" y="3" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                <path d="M2 7h14" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M6 1v4M12 1v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                <circle cx="6" cy="11" r="1" fill="currentColor" />
                                <circle cx="9" cy="11" r="1" fill="currentColor" />
                                <circle cx="12" cy="11" r="1" fill="currentColor" />
                            </svg>
                        </span>
                        <span>Calendar</span>
                    </NavLink>

                    <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}>
                        <span className="nav-icon" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <circle cx="9" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                <path d="M2.5 15.5c0-3.314 2.91-6 6.5-6s6.5 2.686 6.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </span>
                        <span>Profile</span>
                    </NavLink>
                </nav>

                <div className="sidebar-footer" ref={footerRef}>
                    <button
                        className="profile-button profile-menu-toggle"
                        type="button"
                        ref={toggleRef}
                        aria-expanded={menuOpen}
                        aria-controls="profile-menu"
                        onClick={() => setMenuOpen((prev) => !prev)}
                    >
                        <div className="profile-avatar">{initials}</div>
                        <div className="profile-meta">
                            <div className="profile-name">{profile?.username || 'Loading...'}</div>
                            <div className="profile-role">{profile?.targetRole || 'Job Seeker'}</div>
                        </div>
                        <span className="profile-chevron" aria-hidden="true">
                            <svg
                                width="14" height="14" viewBox="0 0 14 14" fill="none"
                                style={{ transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
                            >
                                <path d="M3 5l4 4 4-4" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                    </button>

                    {menuOpen && (
                        <div className="profile-menu" id="profile-menu" role="menu">
                            <button className="menu-item" type="button" role="menuitem" onClick={openViewProfile}>
                                <span aria-hidden="true">
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" stroke="currentColor" strokeWidth="1.2" />
                                        <circle cx="7" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                                    </svg>
                                </span>
                                View Profile
                            </button>

                            <div className="menu-divider" />

                            <button className="menu-item" type="button" role="menuitem" onClick={openEditAccount}>
                                <span aria-hidden="true">
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path d="M2 10.5V12h1.5l6-6L8 4.5l-6 6zM11.5 3a1.06 1.06 0 0 0-1.5 0L9 4l1.5 1.5 1-1a1.06 1.06 0 0 0 0-1.5z" fill="currentColor" />
                                    </svg>
                                </span>
                                Edit Account
                            </button>

                            <div className="menu-divider" />

                            <button className="menu-item danger" type="button" role="menuitem" onClick={handleSignOut}>
                                <span aria-hidden="true">
                                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                                        <path d="M6 2H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3M10 10l3-2.5L10 5M13 7.5H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {activeModal === 'view' && profile && (
                <ViewProfileModal profile={profile} onClose={closeModal} onEdit={switchToEdit} />
            )}
            {activeModal === 'edit' && (
                <EditAccountModal
                    currentUsername={profile?.username || ''}
                    currentEmail={profile?.email || ''}
                    onClose={closeModal}
                    onSaved={updateProfile}
                />
            )}
        </>
    );
}