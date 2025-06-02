import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, Clock, DollarSign, TrendingUp, Users } from "lucide-react";
import CreateTenderDialog from "@/components/create-tender-dialog";
import TenderCard from "@/components/tender-card";
import { ACTOR_ROLES } from "@/lib/constants";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  const { data: tenders, isLoading: tendersLoading } = useQuery({
    queryKey: ["/api/tenders"],
  });

  if (statsLoading || tendersLoading || statsError) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      notation: amount > 1000000 ? "compact" : "standard",
    }).format(amount);
  };

  const recentTenders = tenders?.slice(0, 3) || [];

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Tableau de bord administrateur</h2>
            <p className="text-slate-600 mt-1">Vue d'ensemble du système de gestion des appels d'offres</p>
          </div>
          <CreateTenderDialog />
        </div>
      </div>

      <div className="p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total AO</p>
                  <p className="text-2xl font-bold text-slate-900">{stats?.totalTenders || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">AO finalisés</p>
                  <p className="text-2xl font-bold text-slate-900">{stats?.completedTenders || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">En cours</p>
                  <p className="text-2xl font-bold text-slate-900">{stats?.activeTenders || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Budget total</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(parseFloat(stats?.totalBudget || "0"))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Phase Distribution and Actor Workload */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Phase Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Répartition par phase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.phaseDistribution?.map((phase: any) => (
                  <div key={phase.phase} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        phase.phase === 1 ? 'bg-blue-500' :
                        phase.phase === 2 ? 'bg-orange-500' :
                        'bg-green-500'
                      }`}></div>
                      <span className="text-sm font-medium text-slate-700">
                        Phase {phase.phase}: {
                          phase.phase === 1 ? 'Préparation' :
                          phase.phase === 2 ? 'Exécution' :
                          'Paiements'
                        }
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{phase.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actor Workload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Charge de travail par acteur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.workload?.map((item: any) => {
                  if (!item.role) return null;
                  const actor = ACTOR_ROLES[item.role as keyof typeof ACTOR_ROLES];
                  const maxCount = Math.max(...(stats?.workload?.map((w: any) => w.count) || [1]));
                  const percentage = (item.count / maxCount) * 100;
                  
                  return (
                    <div key={item.role} className="flex items-center justify-between">
                      <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: `#${actor.color}` }}
                      >
                        {actor.code}
                      </span>
                      <div className="flex-1 mx-3 bg-slate-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            backgroundColor: `#${actor.color}`,
                            width: `${percentage}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-slate-900">{item.count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tenders */}
        <Card>
          <CardHeader>
            <CardTitle>Appels d'offres récents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {recentTenders.map((tender: any) => (
                <TenderCard
                  key={tender.id}
                  tender={tender}
                  onViewDetails={(id) => {
                    // Navigate to tender detail
                    window.location.href = `/tenders/${id}`;
                  }}
                />
              ))}
            </div>
            {recentTenders.length === 0 && (
              <p className="text-center text-slate-500 py-8">
                Aucun appel d'offres récent
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
