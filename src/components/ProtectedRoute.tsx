import React from 'react';
import { Navigate } from 'react-router-dom';
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

  // Check if user role is allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(userProfile.role)) {
    // Redirect to appropriate dashboard based on role
    const roleRedirect = {
      employee: '/employee',
      team_lead: '/team-lead',
      hr: '/hr'
    };
    return <Navigate to={roleRedirect[userProfile.role]} replace />;
  }

  return <>{children}</>;
};