import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Calendar, DollarSign, User, MessageSquare, CheckCircle, XCircle, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import ActorBadge from "@/components/actor-badge";
import PhaseBadge from "@/components/phase-badge";
import TenderTimeline from "@/components/tender-timeline";
import { ACTOR_ROLES } from "@/lib/constants";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const commentSchema = z.object({
  content: z.string().min(1, "Le commentaire est requis"),
});

type CommentFormData = z.infer<typeof commentSchema>;

const approvalSchema = z.object({
  comments: z.string().optional(),
  deadline: z.string().optional(),
});

type ApprovalFormData = z.infer<typeof approvalSchema>;

export default function TenderDetail() {
  const [location] = useLocation();
  const tenderId = location.split('/').pop();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Non autorisé",
        description: "Vous devez être connecté. Redirection...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: tender, isLoading: tenderLoading } = useQuery({
    queryKey: [`/api/tenders/${tenderId}`],
    enabled: !!tenderId && isAuthenticated,
    retry: false,
  });

  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: [`/api/tenders/${tenderId}/comments`],
    enabled: !!tenderId && isAuthenticated,
    retry: false,
  });

  const { data: steps } = useQuery({
    queryKey: ["/api/workflow/steps"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: documents, isLoading: documentsLoading } = useQuery({
    queryKey: [`/api/tenders/${tenderId}/documents`],
    enabled: !!tenderId && isAuthenticated,
    retry: false,
  });

  const commentForm = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  });

  const approvalForm = useForm<ApprovalFormData>({
    resolver: zodResolver(approvalSchema),
    defaultValues: {
      comments: "",
      deadline: "",
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (data: CommentFormData) => {
      await apiRequest("POST", `/api/tenders/${tenderId}/comments`, data);
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Commentaire ajouté avec succès",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/tenders/${tenderId}/comments`] });
      commentForm.reset();
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
        description: "Impossible d'ajouter le commentaire",
        variant: "destructive",
      });
    },
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
      approvalForm.reset();
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
        description: "Tâche rejetée",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/tenders/${tenderId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/tenders/my-tasks"] });
      approvalForm.reset();
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
        description: "Impossible de rejeter la tâche",
        variant: "destructive",
      });
    },
  });

  if (authLoading || tenderLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Appel d'offres non trouvé</h2>
            <p className="text-slate-600 mb-4">Cet appel d'offres n'existe pas ou vous n'avez pas les permissions pour le voir.</p>
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const formatShortDate = (date: Date | string | null) => {
    if (!date) return "";
    return new Date(date).toISOString().split('T')[0];
  };

  const currentStep = steps?.find((step: any) => 
    step.phase === tender.tender.currentPhase && 
    step.stepNumber === tender.tender.currentStep
  );

  const isCurrentActor = user && tender.currentActor && user.id === tender.currentActor.id;
  
  // Debug logging to understand the data structure
  console.log("Debug - User:", user);
  console.log("Debug - Current Actor:", tender.currentActor);
  console.log("Debug - Is Current Actor:", isCurrentActor);

  const onSubmitComment = (data: CommentFormData) => {
    addCommentMutation.mutate(data);
  };

  const onApprove = (data: ApprovalFormData) => {
    approveMutation.mutate(data);
  };

  const onReject = (data: ApprovalFormData) => {
    rejectMutation.mutate(data);
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {tender.tender.reference}
              </h2>
              <p className="text-slate-600 mt-1">{tender.tender.title}</p>
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

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
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
                    <label className="text-sm font-medium text-slate-500">Phase actuelle</label>
                    <div className="mt-1">
                      <PhaseBadge phase={tender.tender.currentPhase as 1 | 2 | 3} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Étape actuelle</label>
                    <p className="text-lg font-semibold text-slate-900">
                      Étape {tender.tender.currentStep}
                      {currentStep && `: ${currentStep.title}`}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Acteur en attente</label>
                    <div className="mt-1">
                      {tender.currentActor && (
                        <ActorBadge role={tender.currentActor.role as keyof typeof ACTOR_ROLES} />
                      )}
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

            {/* Current Step Actions */}
            {isCurrentActor && tender.tender.status === "active" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Action requise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-blue-900 mb-2">
                      {currentStep?.title}
                    </h4>
                    <p className="text-blue-800 text-sm mb-3">
                      {currentStep?.description}
                    </p>
                    <div className="bg-white rounded p-3 border border-blue-100">
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
                                placeholder="Ajouter des commentaires..."
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
                      
                      <div className="flex space-x-3">
                        <Button
                          type="button"
                          onClick={approvalForm.handleSubmit(onApprove)}
                          disabled={approveMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {approveMutation.isPending ? "Validation en cours..." : "Valider et Passer à l'étape suivante"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={approvalForm.handleSubmit(onReject)}
                          disabled={rejectMutation.isPending}
                          className="border-orange-500 text-orange-600 hover:bg-orange-50"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          {rejectMutation.isPending ? "Envoi en cours..." : "Demander des modifications"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Commentaires
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add Comment Form */}
                <div className="mb-6">
                  <Form {...commentForm}>
                    <form onSubmit={commentForm.handleSubmit(onSubmitComment)} className="space-y-3">
                      <FormField
                        control={commentForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                placeholder="Ajouter un commentaire..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        disabled={addCommentMutation.isPending}
                        size="sm"
                      >
                        {addCommentMutation.isPending ? "Ajout..." : "Ajouter commentaire"}
                      </Button>
                    </form>
                  </Form>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {commentsLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
                          <div className="h-16 bg-slate-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : comments && comments.length > 0 ? (
                    comments.map((comment: any) => (
                      <div key={comment.id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-slate-900">
                              {comment.author?.firstName} {comment.author?.lastName}
                            </span>
                            {comment.author?.role && (
                              <ActorBadge role={comment.author.role as keyof typeof ACTOR_ROLES} size="sm" />
                            )}
                          </div>
                          <span className="text-sm text-slate-500">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-slate-700">{comment.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-500 py-4">
                      Aucun commentaire pour le moment
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informations rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                  <span className="text-slate-600">Créé le</span>
                  <span className="ml-auto font-medium">
                    {formatDate(tender.tender.createdAt)}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <User className="w-4 h-4 mr-2 text-slate-500" />
                  <span className="text-slate-600">Créé par</span>
                  <span className="ml-auto font-medium">
                    {tender.createdBy?.firstName} {tender.createdBy?.lastName}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <DollarSign className="w-4 h-4 mr-2 text-slate-500" />
                  <span className="text-slate-600">Budget</span>
                  <span className="ml-auto font-medium">
                    {formatCurrency(tender.tender.amount)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Progression</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Phase {tender.tender.currentPhase}/3</span>
                    <span className="font-medium">
                      Étape {tender.tender.currentStep}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {[1, 2, 3].map((phase) => (
                      <div key={phase} className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          phase < tender.tender.currentPhase ? 'bg-green-500' :
                          phase === tender.tender.currentPhase ? 'bg-blue-500' :
                          'bg-slate-300'
                        }`}></div>
                        <span className={`text-sm ${
                          phase <= tender.tender.currentPhase ? 'text-slate-900' : 'text-slate-500'
                        }`}>
                          Phase {phase}: {
                            phase === 1 ? 'Préparation' :
                            phase === 2 ? 'Exécution' :
                            'Paiements'
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <TenderTimeline tenderId={tenderId} />
          </div>
        </div>
      </div>
    </div>
  );
}
