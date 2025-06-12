import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import ActorDashboard from "@/pages/actor-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import TendersTable from "@/pages/tenders-table";
import TenderDetail from "@/pages/tender-detail";
import MyTaskTenderDetail from "@/pages/myTask-tender-detail";
import CreateTender from "@/pages/create-tender";
import Actors from "@/pages/actors";
import Contracts from "@/pages/contracts";
import Invoices from "@/pages/invoices";
import Orders from "@/pages/orders";
import Receptions from "@/pages/receptions";
import Payments from "@/pages/payments";
import Projects from "@/pages/Projects";
import WorkflowDashboard from "@/pages/workflow-dashboard";
import ITWorkflowDemo from "@/pages/it-workflow-demo";
import DataExport from "@/pages/data-export";
import Sidebar from "@/components/sidebar";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

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
        <>
          <Route path="/login" component={Login} />
          <Route path="*">{() => <Login />}</Route>
        </>
      ) : (
        <>
          <Route path="/">
            {() => {
              // Rediriger l'admin vers le dashboard au lieu des tâches
              if (user?.role === 'ADMIN') {
                return (
                  <div className="flex h-screen bg-slate-50">
                    <Sidebar />
                    <div className="flex-1 overflow-hidden">
                      <Dashboard />
                    </div>
                  </div>
                );
              }
              return (
                <div className="flex h-screen bg-slate-50">
                  <Sidebar />
                  <div className="flex-1 overflow-hidden">
                    <ActorDashboard />
                  </div>
                </div>
              );
            }}
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
          <Route path="/admin">
            {() => (
              <div className="flex h-screen bg-slate-50">
                <Sidebar />
                <div className="flex-1 overflow-hidden">
                  <AdminDashboard />
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
                  <TendersTable />
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
          <Route path="/myTask-tender-detail/:tenderId">
            {() => (
              <div className="flex h-screen bg-slate-50">
                <Sidebar />
                <div className="flex-1 overflow-hidden">
                  <MyTaskTenderDetail />
                </div>
              </div>
            )}
          </Route>
          <Route path="/create-tender">
            {() => (
              <div className="flex h-screen bg-slate-50">
                <Sidebar />
                <div className="flex-1 overflow-hidden">
                  <CreateTender />
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
          <Route path="/projects">
            {() => (
              <div className="flex h-screen bg-slate-50">
                <Sidebar />
                <div className="flex-1 overflow-hidden">
                  <div className="h-full overflow-auto p-6">
                    <Projects />
                  </div>
                </div>
              </div>
            )}
          </Route>
          <Route path="/contracts">
            {() => (
              <div className="flex h-screen bg-slate-50">
                <Sidebar />
                <div className="flex-1 overflow-hidden">
                  <Contracts />
                </div>
              </div>
            )}
          </Route>
          <Route path="/invoices">
            {() => (
              <div className="flex h-screen bg-slate-50">
                <Sidebar />
                <div className="flex-1 overflow-hidden">
                  <Invoices />
                </div>
              </div>
            )}
          </Route>
          <Route path="/orders">
            {() => (
              <div className="flex h-screen bg-slate-50">
                <Sidebar />
                <div className="flex-1 overflow-hidden">
                  <Orders />
                </div>
              </div>
            )}
          </Route>
          <Route path="/receptions">
            {() => (
              <div className="flex h-screen bg-slate-50">
                <Sidebar />
                <div className="flex-1 overflow-hidden">
                  <Receptions />
                </div>
              </div>
            )}
          </Route>
          <Route path="/payments">
            {() => (
              <div className="flex h-screen bg-slate-50">
                <Sidebar />
                <div className="flex-1 overflow-hidden">
                  <Payments />
                </div>
              </div>
            )}
          </Route>
          <Route path="/workflow">
            {() => (
              <div className="flex h-screen bg-slate-50">
                <Sidebar />
                <div className="flex-1 overflow-hidden">
                  <WorkflowDashboard />
                </div>
              </div>
            )}
          </Route>
          <Route path="/it-demo">
            {() => (
              <div className="flex h-screen bg-slate-50">
                <Sidebar />
                <div className="flex-1 overflow-hidden">
                  <ITWorkflowDemo />
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
