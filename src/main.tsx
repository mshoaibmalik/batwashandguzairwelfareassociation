import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LangProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import type { ReactNode } from "react";

import "./styles.css";

// Pages
import Home from "@/routes/index";
import Collections from "@/routes/collections";
import Events from "@/routes/events";
import EventDetail from "@/routes/events.$eventId";
import Expenses from "@/routes/expenses";
import Families from "@/routes/families";
import FamilyDetail from "@/routes/families.$familyId";
import LoginPage from "@/routes/admin.login";
import AdminDashboard from "@/routes/admin.dashboard";
import AdminFamilies from "@/routes/admin.families";
import AdminFamilyDetail from "@/routes/admin.families.$familyId";
import AdminCollections from "@/routes/admin.collections";
import AdminEvents from "@/routes/admin.events";
import AdminExpenses from "@/routes/admin.expenses";
import AdminReports from "@/routes/admin.reports";

const queryClient = new QueryClient();

function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  if (!user) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <LangProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:eventId" element={<EventDetail />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/families" element={<Families />} />
                <Route path="/families/:familyId" element={<FamilyDetail />} />

                {/* Admin routes */}
                <Route path="/admin/login" element={<LoginPage />} />
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/families"
                  element={
                    <AdminRoute>
                      <AdminFamilies />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/families/:familyId"
                  element={
                    <AdminRoute>
                      <AdminFamilyDetail />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/collections"
                  element={
                    <AdminRoute>
                      <AdminCollections />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/events"
                  element={
                    <AdminRoute>
                      <AdminEvents />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/expenses"
                  element={
                    <AdminRoute>
                      <AdminExpenses />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <AdminRoute>
                      <AdminReports />
                    </AdminRoute>
                  }
                />

                {/* 404 fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <Toaster position="top-center" richColors />
          </AuthProvider>
        </LangProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
