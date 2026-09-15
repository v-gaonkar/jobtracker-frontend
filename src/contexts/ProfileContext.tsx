import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import api from '../api/axiosInstance';

interface ProfileSummary {
    username?: string;
    email?: string;
    targetRole?: string;
    yearsExperience?: number;
    bio?: string;
    location?: string;
}

interface ProfileContextValue {
    profile: ProfileSummary | null;
    loading: boolean;
    error: string | null;
    refreshProfile: () => Promise<void>;
    updateProfile: (updated: ProfileSummary) => void;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
    const [profile, setProfile] = useState<ProfileSummary | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function fetchProfile() {
        setLoading(true);
        setError(null);
        try {
            console.log("user profile");
            const response = await api.get('/api/user/profile');
            setProfile(response.data);
        } catch {
            setError('Failed to load profile.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        (async () => {
            await fetchProfile();
        })();
    }, []);

    function updateProfile(updated: ProfileSummary) {
        setProfile(prev => (prev ? { ...prev, ...updated } : updated));
    }

    const value: ProfileContextValue = {
        profile,
        loading,
        error,
        refreshProfile: fetchProfile,
        updateProfile,
    };

    return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile must be used inside a ProfileProvider');
    }
    return context;
}