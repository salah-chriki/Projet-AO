import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  LayoutDashboard,
  FileText,
  Users,
  UserCircle,
  LogOut,
  BarChart3,
  File,
  Receipt,
  ClipboardList,
  CheckCircle,
  CreditCard,
  GitBranch,
  Monitor,
  FolderOpen,
  FileCheck
} from "lucide-react";

const navigationItems = [
  {
    name: "Vue d'ensemble",
    href: "/dashboard",
    icon: LayoutDashboard,
    adminOnly: true,
  },
  {
    name: "Workflow (59 étapes)",
    href: "/workflow",
    icon: GitBranch,
    adminOnly: true,
  },
  {
    name: "Démo IT Equipment",
    href: "/it-demo",
    icon: Monitor,
    adminOnly: true,
  },
  {
    name: "Tableau de bord admin",
    href: "/admin",
    icon: BarChart3,
    adminOnly: true,
  },
  {
    name: "Appels d'offres", 
    href: "/tenders",
    icon: FileText,
    adminOnly: true,
  },
  {
    name: "Gestion des acteurs",
    href: "/actors", 
    icon: Users,
    adminOnly: true,
  },
  {
    name: "Projets",
    href: "/projects",
    icon: FolderOpen,
    adminOnly: true,
  },
  {
    name: "Workflow ONSSA",
    href: "/onssa-workflow",
    icon: FileCheck,
    adminOnly: true,
  },
];

const contractItems = [
  {
    name: "Contrats",
    href: "/contracts",
    icon: File,
    adminOnly: true,
  },
  {
    name: "Factures",
    href: "/invoices",
    icon: Receipt,
    adminOnly: true,
  },
  {
    name: "Ordres",
    href: "/orders",
    icon: ClipboardList,
    adminOnly: true,
  },
  {
    name: "Réceptions",
    href: "/receptions",
    icon: CheckCircle,
    adminOnly: true,
  },
  {
    name: "Paiements",
    href: "/payments",
    icon: CreditCard,
    adminOnly: true,
  },
];

const userItems = [
  {
    name: "Mes tâches",
    href: "/my-tasks",
    icon: UserCircle,
    adminOnly: false,
  },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      // Clear all queries from cache
      queryClient.clear();
      // Force reload to ensure complete state reset
      window.location.href = "/login";
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (!user) return null;

  return (
    <div className="w-64 bg-white shadow-lg border-r border-slate-200 flex flex-col h-screen">
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900">Gestion AO</h1>
        <p className="text-sm text-slate-600 mt-1">
          {user.isAdmin ? "Administrateur" : user.role}
        </p>
      </div>

      <nav className="mt-6 flex-1 flex flex-col">
        <div className="flex-1">
          {user?.isAdmin && (
            <>
              <div className="px-6">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Tableau de bord
                </p>
              </div>
              <div className="mt-4 space-y-1">
                {navigationItems.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={`flex items-center px-6 py-3 text-sm font-medium transition-colors cursor-pointer ${
                          isActive
                            ? "text-blue-700 bg-blue-50 border-r-2 border-blue-700"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.name}
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="px-6 mt-8">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Gestion Contractuelle
                </p>
              </div>
              <div className="mt-4 space-y-1">
                {contractItems.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={`flex items-center px-6 py-3 text-sm font-medium transition-colors cursor-pointer ${
                          isActive
                            ? "text-blue-700 bg-blue-50 border-r-2 border-blue-700"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.name}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}

          <div className="px-6 mt-8">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Mon compte
            </p>
          </div>
          <div className="mt-4 space-y-1">
            {userItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`flex items-center px-6 py-3 text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? "text-blue-700 bg-blue-50 border-r-2 border-blue-700" 
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name} {!user.isAdmin && `(${user.role})`}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bouton de déconnexion en bas */}
        <div className="border-t border-slate-200 p-4">
          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            {logoutMutation.isPending ? "Déconnexion..." : "Déconnexion"}
          </button>
        </div>
      </nav>
    </div>
  );
}