import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import AdminPortal from './pages/AdminPortal';
import OfficerPortal from './pages/OfficerPortal';
import CitizenPortal from './pages/CitizenPortal';
import Dashboard from './pages/Dashboard';
import Inspections from './pages/Inspections';
import InspectionDetail from './pages/InspectionDetail';
import Beneficiaries from './pages/Beneficiaries';
import Approvals from './pages/Approvals';
import Installments from './pages/Installments';
import RiskCases from './pages/RiskCases';
import AuditLogs from './pages/AuditLogs';
import NewInspection from './pages/NewInspection';
import TestAI from './pages/TestAI';
import RiskMap from './pages/RiskMap';
import VideoInspector from './pages/VideoInspector';
import SpatialTwinStudio from './pages/SpatialTwinStudio';

function ProtectedRoute({ children, roleRequired }) {
  const { isAuthenticated, user, authChecking } = useAuth();

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#edf2f7]">
        <div className="flex items-center gap-3 p-4 bg-[#f8fafd] rounded-2xl shadow-sm border border-[#d8e2ec]">
          <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold text-slate-800">Verifying Government Clearance...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (roleRequired && user?.role !== roleRequired) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/officer'} replace />;
  }

  return children;
}

function RoleHomeRedirect() {
  const { user } = useAuth();
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/officer" replace />;
}

function AppRoutes() {
  const { isAuthenticated, user, authChecking } = useAuth();

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#edf2f7]">
        <div className="flex items-center gap-3 p-4 bg-[#f8fafd] rounded-2xl shadow-sm border border-[#d8e2ec]">
          <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold text-slate-800">Loading Smart-Gram Verify...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Citizen / Beneficiary Portal (No Login Required) */}
      <Route path="/client" element={<CitizenPortal />} />
      <Route path="/citizen" element={<CitizenPortal />} />

      {/* Auth */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={user?.role === 'admin' ? '/admin' : '/officer'} replace />
          ) : (
            <Login />
          )
        }
      />

      {/* Main Authenticated Layout */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<RoleHomeRedirect />} />

        {/* Admin Strictly Enforced Routes */}
        <Route path="admin" element={<ProtectedRoute roleRequired="admin"><AdminPortal /></ProtectedRoute>} />
        <Route path="approvals" element={<ProtectedRoute roleRequired="admin"><Approvals /></ProtectedRoute>} />
        <Route path="installments" element={<ProtectedRoute roleRequired="admin"><Installments /></ProtectedRoute>} />
        <Route path="risk-cases" element={<ProtectedRoute roleRequired="admin"><RiskCases /></ProtectedRoute>} />
        <Route path="audit-logs" element={<ProtectedRoute roleRequired="admin"><AuditLogs /></ProtectedRoute>} />
        <Route path="overview" element={<ProtectedRoute roleRequired="admin"><Dashboard /></ProtectedRoute>} />
        <Route path="test-ai" element={<ProtectedRoute roleRequired="admin"><TestAI /></ProtectedRoute>} />

        {/* Officer Strictly Enforced Routes */}
        <Route path="officer" element={<ProtectedRoute roleRequired="officer"><OfficerPortal /></ProtectedRoute>} />
        <Route path="new-inspection" element={<ProtectedRoute roleRequired="officer"><NewInspection /></ProtectedRoute>} />

        {/* Shared Authenticated Routes */}
        <Route path="inspections" element={<Inspections />} />
        <Route path="inspections/:id" element={<InspectionDetail />} />
        <Route path="beneficiaries" element={<Beneficiaries />} />
        <Route path="risk-map" element={<RiskMap />} />
        <Route path="video-inspector" element={<VideoInspector />} />
        <Route path="spatial-twin" element={<SpatialTwinStudio />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
