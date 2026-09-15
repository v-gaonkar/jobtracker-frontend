import { Outlet } from 'react-router-dom';
import { CompanyProvider } from '../../contexts/company-context';

export function CompanyProviderLayout() {
    return (
        <CompanyProvider>
            <Outlet />
        </CompanyProvider>
    );
}