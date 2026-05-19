import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import MfaEncouragementDialog from "@/components/MfaEncouragementDialog";
import Index from "./pages/Index";
import Features from "./pages/Features";
import Status from "./pages/Status";
import Blog from "./pages/Blog";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Setup2FAPage from "./pages/Setup2FAPage";
import Verify2FAPage from "./pages/Verify2FAPage";
import DashboardPage from "./pages/DashboardPage";
import AdminDashboard from "./pages/AdminDashboard";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import ResponsibleDisclosurePage from "./pages/ResponsibleDisclosurePage";
import SiteNotFoundPage from "./pages/SiteNotFoundPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="w-full min-h-screen bg-background">
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/features" element={<Features />} />
            <Route path="/status" element={<Status />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/setup-2fa" element={<Setup2FAPage />} />
            <Route path="/verify-2fa" element={<Verify2FAPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/account-settings"
              element={
                <ProtectedRoute>
                  <AccountSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/responsible-disclosure" element={<ResponsibleDisclosurePage />} />
            <Route path="/sitenotfound" element={<SiteNotFoundPage />} />
            <Route path="*" element={<NotFound />} />
            </Routes>
            <MfaEncouragementDialog />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
