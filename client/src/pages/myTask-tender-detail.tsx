import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ACTOR_ROLES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import ActorBadge from "@/components/actor-badge";
import PhaseBadge from "@/components/phase-badge";
import DivisionBadge from "@/components/division-badge";
import TenderTimeline from "@/components/tender-timeline";
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText, 
  CalendarDays,
  Euro
} from "lucide-react";

const approvalSchema = z.object({
  comments: z.string().optional(),
  deadline: z.string().optional(),
});

type ApprovalFormData = z.infer<typeof approvalSchema>;

export default function MyTaskTenderDetail() {
  const { tenderId } = useParams<{ tenderId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  const approvalForm = useForm<ApprovalFormData>({
    resolver: zodResolver(approvalSchema),
    defaultValues: {
      comments: "",
      deadline: "",
    },
  });

  const { data: tender, isLoading: tenderLoading } = useQuery({
    queryKey: [`/api/tenders/${tenderId}`],
    enabled: !!tenderId,
  });

  const { data: steps } = useQuery({
    queryKey: ["/api/workflow/steps"],
  });

  const approveMutation = useMutation({
    mutationFn: async (data: ApprovalFormData) => {
      await apiRequest("POST", `/api/tenders/${tenderId}/approve`, data);
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Tâche approuvée avec succès",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/tenders/${tenderId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/tenders/my-tasks"] });
      // Rediriger vers la page des tâches
      window.location.href = "/";
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous êtes déconnecté. Reconnexion...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible d'approuver la tâche",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (data: ApprovalFormData) => {
      await apiRequest("POST", `/api/tenders/${tenderId}/reject`, data);
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Demande de modifications envoyée",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/tenders/${tenderId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/tenders/my-tasks"] });
      // Rediriger vers la page des tâches
      window.location.href = "/";
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous êtes déconnecté. Reconnexion...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de demander des modifications",
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Non définie";
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  };

  const formatShortDate = (date: Date | string | null) => {
    if (!date) return "";
    return new Date(date).toISOString().split('T')[0];
  };

  const currentStep = steps?.find((step: any) => 
    step.phase === tender?.tender.currentPhase && 
    step.stepNumber === tender?.tender.currentStep
  );

  // Vérifier si l'utilisateur est l'acteur responsable de cette étape
  const isCurrentActor = user && tender?.currentActor && user.id === tender.currentActor.id;

  const onApprove = (data: ApprovalFormData) => {
    approveMutation.mutate(data);
  };

  const onReject = (data: ApprovalFormData) => {
    rejectMutation.mutate(data);
  };

  if (tenderLoading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="animate-pulse p-6 space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="space-y-4">
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">Appel d'offres non trouvé</h3>
          <p className="mt-1 text-sm text-slate-500">
            L'appel d'offres demandé n'existe pas ou vous n'avez pas accès.
          </p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas l'acteur responsable, rediriger
  if (!isCurrentActor) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Clock className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">Accès non autorisé</h3>
          <p className="mt-1 text-sm text-slate-500">
            Cette tâche n'est pas assignée à votre rôle ou a déjà été traitée.
          </p>
          <Button
            className="mt-4"
            onClick={() => window.location.href = "/"}
          >
            Retour aux tâches
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = "/"}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux tâches
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Traitement de la tâche
              </h2>
              <p className="text-slate-600 mt-1">{tender.tender.reference} - {tender.tender.title}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <PhaseBadge phase={tender.tender.currentPhase as 1 | 2 | 3} />
            <Badge variant={tender.tender.status === "active" ? "default" : "secondary"}>
              {tender.tender.status === "active" ? "Actif" : "Terminé"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Step Action */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-900">
                  <Clock className="w-5 h-5 mr-2" />
                  Action requise - Étape {tender.tender.currentStep}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    {currentStep?.title || `Étape ${tender.tender.currentStep}`}
                  </h4>
                  <p className="text-blue-800 text-sm mb-3">
                    {currentStep?.description || "Veuillez examiner cet appel d'offres et prendre une décision."}
                  </p>
                  <div className="bg-blue-50 rounded p-3 border border-blue-100">
                    <p className="text-xs text-blue-700">
                      <strong>Validation :</strong> L'appel d'offres passera automatiquement à l'étape suivante du processus.<br/>
                      <strong>Modifications :</strong> L'appel d'offres retournera à l'étape précédente pour corrections.
                    </p>
                  </div>
                </div>
                
                <Form {...approvalForm}>
                  <form className="space-y-4">
                    <FormField
                      control={approvalForm.control}
                      name="comments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Commentaires (optionnel)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Ajouter des commentaires sur votre décision..."
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={approvalForm.control}
                      name="deadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Échéance pour la prochaine étape (optionnel)</FormLabel>
                          <FormControl>
                            <input
                              type="date"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex space-x-3 pt-4">
                      <Button
                        type="button"
                        onClick={approvalForm.handleSubmit(onApprove)}
                        disabled={approveMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 flex-1"
                        size="lg"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        {approveMutation.isPending ? "Validation en cours..." : "Valider et Passer à l'étape suivante"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={approvalForm.handleSubmit(onReject)}
                        disabled={rejectMutation.isPending}
                        className="border-orange-500 text-orange-600 hover:bg-orange-50 flex-1"
                        size="lg"
                      >
                        <XCircle className="w-5 h-5 mr-2" />
                        {rejectMutation.isPending ? "Envoi en cours..." : "Demander des modifications"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Tender Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-500">Référence</label>
                    <p className="text-lg font-semibold text-slate-900">{tender.tender.reference}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Montant</label>
                    <p className="text-lg font-semibold text-slate-900">
                      {formatCurrency(tender.tender.amount)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Division</label>
                    <div className="mt-1">
                      <DivisionBadge 
                        division={tender.tender.division} 
                        department={tender.tender.department}
                        showDepartment={true}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Échéance</label>
                    <p className="text-lg font-semibold text-slate-900">
                      {formatDate(tender.tender.deadline)}
                    </p>
                  </div>
                </div>
                
                {tender.tender.description && (
                  <div>
                    <label className="text-sm font-medium text-slate-500">Description</label>
                    <p className="text-slate-900 mt-1">{tender.tender.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Créé le</span>
                  <span className="text-sm font-medium">{formatDate(tender.tender.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Créé par</span>
                  <span className="text-sm font-medium">{tender.creator?.firstName} {tender.creator?.lastName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Budget</span>
                  <span className="text-sm font-medium">{formatCurrency(tender.tender.amount)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progression</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Phase {tender.tender.currentPhase}/3</span>
                    <PhaseBadge phase={tender.tender.currentPhase as 1 | 2 | 3} size="sm" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${tender.tender.currentPhase >= 1 ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                      <span className="text-sm">Phase 1: Préparation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${tender.tender.currentPhase >= 2 ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                      <span className="text-sm">Phase 2: Exécution</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${tender.tender.currentPhase >= 3 ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                      <span className="text-sm">Phase 3: Paiements</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Historique des étapes</CardTitle>
          </CardHeader>
          <CardContent>
            <TenderTimeline tenderId={tenderId!} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}