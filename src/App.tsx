import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AppProvider, useApp } from "@/context/AppContext";
import { AuthProvider, useAuthContext } from "@/context/AuthContext";
import Home from "./pages/Home";
import Disclaimer from "./pages/Disclaimer";
import OnboardingWizard from "./pages/onboarding/OnboardingWizard";
import MedicalStop from "./pages/onboarding/MedicalStop";
import Plan from "./pages/Plan";
import Workout from "./pages/Workout";
import QuickCheckin from "./pages/QuickCheckin";
import CheckinPage from "./pages/CheckinPage";
import CompletePage from "./pages/CompletePage";
import Stop from "./pages/Stop";
import ExpertReview from "./pages/ExpertReview";
import AuditExport from "./pages/AuditExport";
import ClinicalExport from "./pages/ClinicalExport";
import Library from "./pages/Library";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import DevExportEngineData from "./pages/DevExportEngineData";
import About from "./pages/About";
import Cookies from "./pages/Cookies";
import Accessibility from "./pages/Accessibility";
import CookieConsent from "./components/CookieConsent";

const queryClient = new QueryClient();

/** Only allow access to /plan etc. if onboarding is done */
function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  if (!state.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}

/** If onboarding is already completed, redirect /onboarding to /plan */
function OnboardingRedirectGuard({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  if (state.onboardingCompleted) {
    return <Navigate to="/plan" replace />;
  }
  return <>{children}</>;
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isGuest } = useAuthContext();
  if (loading) return null;
  if (!user && !isGuest) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/" element={<Home />} />
      <Route path="/disclaimer" element={<Disclaimer />} />
      <Route path="/about" element={<About />} />
      <Route path="/cookies" element={<Cookies />} />
      <Route path="/accessibility" element={<Accessibility />} />

      <Route path="/onboarding" element={<OnboardingRedirectGuard><OnboardingWizard /></OnboardingRedirectGuard>} />
      <Route path="/onboarding/medical-stop" element={<MedicalStop />} />

      <Route path="/conditions" element={<Navigate to="/onboarding" replace />} />
      <Route path="/setup" element={<Navigate to="/onboarding" replace />} />
      <Route path="/questionnaire" element={<Navigate to="/onboarding" replace />} />

      <Route path="/plan" element={<AuthGuard><OnboardingGuard><Plan /></OnboardingGuard></AuthGuard>} />
      <Route path="/workout/:sessionId?" element={<AuthGuard><Workout /></AuthGuard>} />
      <Route path="/checkin/:sessionId" element={<AuthGuard><OnboardingGuard><CheckinPage /></OnboardingGuard></AuthGuard>} />
      <Route path="/check-in" element={<AuthGuard><QuickCheckin /></AuthGuard>} />
      <Route path="/complete" element={<AuthGuard><OnboardingGuard><CompletePage /></OnboardingGuard></AuthGuard>} />
      <Route path="/stop" element={<AuthGuard><Stop /></AuthGuard>} />
      <Route path="/library" element={<AuthGuard><Library /></AuthGuard>} />
      <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />
      <Route path="/expert-review" element={<AuthGuard><ExpertReview /></AuthGuard>} />
      <Route path="/audit-export" element={<AuthGuard><AuditExport /></AuthGuard>} />
      <Route path="/clinical-export" element={<AuthGuard><ClinicalExport /></AuthGuard>} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/admin" element={<AuthGuard><Admin /></AuthGuard>} />
      {import.meta.env.DEV && <Route path="/dev/export-engine-data" element={<DevExportEngineData />} />}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <AppProvider>
            <BrowserRouter>
              <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-background focus:px-4 focus:py-2 focus:rounded focus:shadow-lg focus:text-foreground focus:ring-2 focus:ring-primary">
                Skip to main content
              </a>
              <AppRoutes />
              <CookieConsent />
            </BrowserRouter>
          </AppProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
