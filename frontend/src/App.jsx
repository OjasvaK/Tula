import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { LandingPage } from "./pages/LandingPage";
import { Overview } from "./pages/Overview";
import { ListingsPage } from "./pages/ListingsPage";
import { ListingDetailPage } from "./pages/ListingDetailPage";
import { IngestPage } from "./pages/IngestPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { HelpPage } from "./pages/HelpPage";
import { NotFound } from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<LandingPage />} />

                <Route
                  path="/app"
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Overview />} />
                  <Route path="listings" element={<ListingsPage />} />
                  <Route path="listings/:id" element={<ListingDetailPage />} />
                  <Route path="ingest" element={<IngestPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="help" element={<HelpPage />} />
                </Route>

                <Route path="/dashboard" element={<Navigate to="/app" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </MotionConfig>
    </QueryClientProvider>
  );
}

export default App;
