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
  nextStepStartDate: z.string().min(1, "La date de début est obligatoire"),
  nextStepEndDate: z.string().min(1, "La date de fin est obligatoire"),
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
      nextStepStartDate: "",
      nextStepEndDate: "",
    },
  });

  const { data: tender, isLoading: tenderLoading } = useQuery({
    queryKey: [`/api/tenders/${tenderId}`],
    enabled: !!tenderId,
  });

  const { data: steps } = useQuery({
    queryKey: ["/api/workflow/steps"],
  });

  const { data: documents, isLoading: documentsLoading } = useQuery({
    queryKey: [`/api/tenders/${tenderId}/documents`],
    enabled: !!tenderId,
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

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Top Section - Informations générales et rapides */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Informations générales */}
          <div className="lg:col-span-2">
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
                    <label className="text-sm font-medium text-slate-500">Phase actuelle</label>
                    <div className="mt-1">
                      <PhaseBadge phase={tender.tender.currentPhase as 1 | 2 | 3} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Étape actuelle</label>
                    <p className="text-lg font-semibold text-slate-900">
                      {currentStep?.title || `Étape ${tender.tender.currentStep}`}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Acteur en attente</label>
                    <div className="mt-1">
                      <ActorBadge role={currentStep?.actorRole as any} />
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

          {/* Right Sidebar - Informations rapides et Progression */}
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
                  <span className="text-sm font-medium">{tender.createdBy?.firstName} {tender.createdBy?.lastName}</span>
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
                    <span className="text-sm font-medium">Étape {tender.tender.currentStep}</span>
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

        {/* Bottom Section - Documents et Action requise */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Documents attachés
              </CardTitle>
            </CardHeader>
            <CardContent>
              {documentsLoading ? (
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : documents && documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{doc.originalFileName}</p>
                          <div className="flex items-center space-x-4 text-sm text-slate-500">
                            <span>{doc.documentType}</span>
                            <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
                            <span>{formatDate(doc.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`/api/tenders/${tenderId}/documents/${doc.id}/download`, '_blank')}
                      >
                        Télécharger
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-4">Aucun document attaché</p>
              )}
            </CardContent>
          </Card>

          {/* Action requise - Remplace les commentaires */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900">
                <Clock className="w-5 h-5 mr-2" />
                Action requise
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
                            placeholder="Ajoutez vos commentaires..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={approvalForm.handleSubmit(onApprove)}
                      disabled={approveMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 flex-1"
                      size="sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {approveMutation.isPending ? "Validation..." : "Valider"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={approvalForm.handleSubmit(onReject)}
                      disabled={rejectMutation.isPending}
                      className="border-orange-500 text-orange-600 hover:bg-orange-50 flex-1"
                      size="sm"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {rejectMutation.isPending ? "Envoi..." : "Modifications"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Historique des étapes */}
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