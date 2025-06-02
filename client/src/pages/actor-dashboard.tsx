import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, AlertTriangle, FileText, ArrowRight, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import ActorBadge from "@/components/actor-badge";
import DivisionBadge from "@/components/division-badge";
import PhaseBadge from "@/components/phase-badge";
import { ACTOR_ROLES } from "@/lib/constants";

export default function ActorDashboard() {
  const { user } = useAuth();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["/api/tenders/my-tasks"],
  });

  const formatCurrency = (amount: string | null) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(parseFloat(amount));
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Accès non autorisé</h2>
            <p className="text-slate-600">Vous devez être connecté pour accéder à cette page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userRole = user?.role as keyof typeof ACTOR_ROLES;
  const roleInfo = ACTOR_ROLES[userRole];
  const roleTitle = typeof roleInfo === 'object' ? roleInfo.name : (roleInfo || user?.role || 'Utilisateur');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de Bord</h1>
          <div className="flex items-center gap-2 mt-2">
            <ActorBadge role={userRole} />
            <span className="text-slate-600">•</span>
            <span className="text-slate-600">{user?.firstName} {user?.lastName}</span>
          </div>
        </div>
        {/* Create button for ST */}
        {user?.role === 'ST' && (
          <div>
            <Button
              onClick={() => window.location.href = "/create-tender"}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer un appel d'offres
            </Button>
          </div>
        )}
      </div>

      {/* Tasks Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tâches en attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(tasks) ? tasks.length : 0}</div>
            <p className="text-xs text-muted-foreground">
              Appels d'offres nécessitant votre action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Priorité haute</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(tasks) ? tasks.filter((task: any) => {
                const deadline = new Date(task.deadline);
                const today = new Date();
                const diffTime = deadline.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 3;
              }).length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Échéance dans moins de 3 jours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rôle</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{roleTitle}</div>
            <p className="text-xs text-muted-foreground">
              {user?.division} - {user?.department}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Appels d'offres à traiter
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!Array.isArray(tasks) || tasks.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Aucune tâche en attente</h3>
              <p className="text-slate-600">
                Vous n'avez actuellement aucun appel d'offres à traiter.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Division</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Phase</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task: any) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">
                      {task.reference}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={task.title}>
                        {task.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DivisionBadge 
                        division={task.division} 
                        department={task.department}
                        size="sm" 
                      />
                    </TableCell>
                    <TableCell>
                      {formatCurrency(task.amount)}
                    </TableCell>
                    <TableCell>
                      <PhaseBadge phase={task.currentPhase} size="sm" />
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm ${
                        new Date(task.deadline) < new Date() 
                          ? 'text-red-600 font-medium' 
                          : new Date(task.deadline) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                          ? 'text-orange-600 font-medium'
                          : 'text-slate-600'
                      }`}>
                        {formatDate(task.deadline)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link href={`/myTask-tender-detail/${task.id}`}>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <FileText className="w-4 h-4 mr-2" />
                          Traiter
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}