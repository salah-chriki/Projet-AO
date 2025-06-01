import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import TaskItem from "@/components/task-item";
import ActorBadge from "@/components/actor-badge";
import { ACTOR_ROLES } from "@/lib/constants";

export default function ActorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["/api/tenders/my-tasks"],
  });

  const approveMutation = useMutation({
    mutationFn: async (tenderId: string) => {
      await apiRequest("POST", `/api/tenders/${tenderId}/approve`, {
        comments: "Approuvé",
      });
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Tâche approuvée avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tenders/my-tasks"] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'approuver la tâche",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (tenderId: string) => {
      await apiRequest("POST", `/api/tenders/${tenderId}/reject`, {
        comments: "Rejeté - Nécessite des corrections",
      });
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Tâche rejetée",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tenders/my-tasks"] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de rejeter la tâche",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const pendingTasks = tasks || [];
  const urgentTasks = pendingTasks.filter(
    (task: any) => task.deadline && new Date(task.deadline) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  );

  const actorRole = user.role as keyof typeof ACTOR_ROLES;
  const actorInfo = ACTOR_ROLES[actorRole];

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Mes tâches - {actorInfo.name} ({actorInfo.code})
            </h2>
            <p className="text-slate-600 mt-1">Appels d'offres nécessitant votre intervention</p>
          </div>
          <div className="flex items-center space-x-3">
            <ActorBadge role={actorRole} size="lg" />
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Clock className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Tâches en attente</p>
                  <p className="text-2xl font-bold text-slate-900">{pendingTasks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Échéances proches</p>
                  <p className="text-2xl font-bold text-slate-900">{urgentTasks.length}</p>
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
                  <p className="text-sm font-medium text-slate-600">Rôle actuel</p>
                  <p className="text-lg font-bold text-slate-900">{actorInfo.code}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tâches en attente</CardTitle>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200">
                  Tous ({pendingTasks.length})
                </button>
                <button className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200">
                  Urgents ({urgentTasks.length})
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTasks.map((task: any) => (
                <TaskItem
                  key={task.id}
                  tender={task}
                  onApprove={(id) => approveMutation.mutate(id)}
                  onReject={(id) => rejectMutation.mutate(id)}
                  onViewDetails={(id) => {
                    // Navigate to tender detail
                    window.location.href = `/tenders/${id}`;
                  }}
                />
              ))}
              {pendingTasks.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <p className="text-slate-500">Aucune tâche en attente</p>
                  <p className="text-sm text-slate-400">
                    Toutes vos tâches sont à jour !
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
