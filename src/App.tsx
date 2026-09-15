import { Navigate, Route, Routes } from 'react-router'
import { Signup } from './pages/signup'
import { Signin } from './pages/signin'
import { ApplicationList } from './pages/applications/application-list'
import { AddEditApplication } from './pages/applications/add-edit-application'
import { ApplicationDetails } from './pages/applications/application-details'
import { CalendarPage } from './pages/calendar/calendar'
import { AddEditCompany } from './pages/companies/add-edit-company'
import { CompanyDetails } from './pages/companies/company-details'
import { CompanyList } from './pages/companies/company-list'
import { DashboardPage } from './pages/dashboard/dashboard'
import { ProfilePage } from './pages/profile/profile-page';
import { ProfileProvider } from './contexts/ProfileContext';
import { ProtectedRoute } from './pages/components/ProtectedRoute';
import { ForgotPassword } from './pages/forgot-password';
import { ResetPassword } from './pages/reset-password';
import { CompanyProviderLayout } from './pages/components/CompanyProviderLayout';

function App() {
  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <ProfileProvider>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/profile" element={<ProfilePage />} />

                <Route element={<CompanyProviderLayout />}>
                  <Route path="/applications" element={<ApplicationList />} />
                  <Route path="/applications/add" element={<AddEditApplication />} />
                  <Route path="/applications/:id" element={<ApplicationDetails />} />
                  <Route path="/applications/:id/edit" element={<AddEditApplication />} />

                  <Route path="/companies" element={<CompanyList />} />
                  <Route path="/companies/add" element={<AddEditCompany />} />
                  <Route path="/companies/:id" element={<CompanyDetails />} />
                  <Route path="/companies/:id/edit" element={<AddEditCompany />} />
                </Route>

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </ProfileProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App