import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import TeamLeadDashboard from "./pages/TeamLeadDashboard";
import HRDashboard from "./pages/HRDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <AppHeader />}
      <Routes>
        <Route 
          path="/login" 
          element={
            user ? <Navigate to="/dashboard" replace /> : <Login />
          } 
        />
        <Route 
          path="/" 
          element={
            user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Navigate to="/employee" replace />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/employee" 
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/team-lead" 
          element={
            <ProtectedRoute allowedRoles={['team_lead']}>
              <TeamLeadDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/hr" 
          element={
            <ProtectedRoute allowedRoles={['hr']}>
              <HRDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;