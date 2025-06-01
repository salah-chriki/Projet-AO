import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  FileText,
  Users,
  UserCircle,
  LogOut,
} from "lucide-react";

const navigationItems = [
  {
    name: "Vue d'ensemble",
    href: "/dashboard",
    icon: LayoutDashboard,
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

  if (!user) return null;

  return (
    <div className="w-64 bg-white shadow-lg border-r border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900">Gestion AO</h1>
        <p className="text-sm text-slate-600 mt-1">
          {user.isAdmin ? "Administrateur" : user.role}
        </p>
      </div>
      
      <nav className="mt-6">
        {user.isAdmin && (
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
                    <a
                      className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? "text-blue-700 bg-blue-50 border-r-2 border-blue-700"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </a>
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
                <a
                  className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-blue-700 bg-blue-50 border-r-2 border-blue-700" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name} {!user.isAdmin && `(${user.role})`}
                </a>
              </Link>
            );
          })}
          <a
            href="/api/logout"
            className="flex items-center px-6 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Déconnexion
          </a>
        </div>
      </nav>
    </div>
  );
}
