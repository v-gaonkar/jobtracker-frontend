import { useContext } from 'react';
import { CompanyContext } from './company-context-data';

export function useCompanies() {
    const context = useContext(CompanyContext);

    if (!context) {
        throw new Error('useCompanies must be used inside a CompanyProvider');
    }

    return context;
}
