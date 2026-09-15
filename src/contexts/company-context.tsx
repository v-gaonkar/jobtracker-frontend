import { useEffect, useRef, useState, type ReactNode } from 'react';
import api from '../api/axiosInstance';
import { CompanyContext, type CompanyOption } from './company-context-data';

export function CompanyProvider({ children }: { children: ReactNode }) {
    const [companies, setCompanies] = useState<CompanyOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const hasLoadedRef = useRef(false);

    async function refreshCompanies() {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get('/api/companies?page=0&size=100');
            setCompanies(response.data?.content ?? []);
        } catch (err) {
            console.error('Failed to load companies', err);
            setError('Failed to load companies.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (hasLoadedRef.current) return;
        hasLoadedRef.current = true;

        const run = async () => {
            await refreshCompanies();
        };

        void run();
    }, []);

    return (
        <CompanyContext.Provider value={{ companies, loading, error, refreshCompanies }}>
            {children}
        </CompanyContext.Provider>
    );
}

