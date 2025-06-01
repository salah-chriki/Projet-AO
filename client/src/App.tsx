import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import ActorDashboard from "@/pages/actor-dashboard";
import Tenders from "@/pages/tenders";
import TenderDetail from "@/pages/tender-detail";
import Actors from "@/pages/actors";
import Sidebar from "@/components/sidebar";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/">
            {() => (
              <div className="flex h-screen bg-slate-50">
                <Sidebar />
                <div className="flex-1 overflow-hidden">
                  <Dashboard />
                </div>
              </div>
            )}
          </Route>
          <Route path="/dashboard">
            {() => (
              <div className="flex h-screen bg-slate-50">
                <Sidebar />
                <div className="flex-1 overflow-hidden">
                  <Dashboard />
                </div>
              </div>
            )}
          </Route>
          <Route path="/my-tasks">
            {() => (
              <div className="flex h-screen bg-slate-50">
                <Sidebar />
                <div className="flex-1 overflow-hidden">
                  <ActorDashboard />
                </div>
              </div>
            )}
          </Route>
          <Route path="/tenders">
            {() => (
              <div className="flex h-screen bg-slate-50">
                <Sidebar />
                <div className="flex-1 overflow-hidden">
                  <Tenders />
                </div>
              </div>
            )}
          </Route>
          <Route path="/tenders/:id">
            {() => (
              <div className="flex h-screen bg-slate-50">
                <Sidebar />
                <div className="flex-1 overflow-hidden">
                  <TenderDetail />
                </div>
              </div>
            )}
          </Route>
          <Route path="/actors">
            {() => (
              <div className="flex h-screen bg-slate-50">
                <Sidebar />
                <div className="flex-1 overflow-hidden">
                  <Actors />
                </div>
              </div>
            )}
          </Route>
        </>
      )}
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
