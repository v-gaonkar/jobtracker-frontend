import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { tokenStorage } from '../../utils/tokenStorage';

export function ProtectedRoute({ children }: { children: ReactNode }) {
    const token = tokenStorage.getAccessToken();

    if (!token) {
        return <Navigate to="/signin" replace />;
    }

    return <>{children}</>;
}