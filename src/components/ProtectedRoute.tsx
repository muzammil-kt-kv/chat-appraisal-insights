
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'employee' | 'team_lead' | 'hr'>;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [],
  redirectTo = '/login'
}) => {
  const { user, userProfile, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user || !userProfile) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check if user role is allowed for this route
  if (allowedRoles.length > 0 && !allowedRoles.includes(userProfile.role)) {
    // Only redirect if we're not already on the correct route for this role
    const roleRedirect = {
      employee: '/employee',
      team_lead: '/team-lead',
      hr: '/hr'
    };
    
    const targetRoute = roleRedirect[userProfile.role];
    
    // Prevent infinite redirect loop by checking current location
    if (location.pathname !== targetRoute) {
      return <Navigate to={targetRoute} replace />;
    }
  }

  return <>{children}</>;
};
