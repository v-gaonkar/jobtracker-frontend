import { createContext } from 'react';

export interface CompanyOption {
    id: number;
    name: string;
    website?: string | null;
    industry?: string | null;
    careerPageUrl?: string | null;
    notes?: string | null;
}

export interface CompanyContextValue {
    companies: CompanyOption[];
    loading: boolean;
    error: string | null;
    refreshCompanies: () => Promise<void>;
}

export const CompanyContext = createContext<CompanyContextValue | undefined>(undefined);
