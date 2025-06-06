import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  FileText,
  TrendingUp,
  Calendar
} from "lucide-react";

interface WorkflowStep {
  id: number;
  phase: number;
  stepNumber: number;
  title: string;
  description: string;
  actorRole: string;
  estimatedDuration: number;
  maxDuration: number;
  isInternal: boolean;
}

interface TenderWorkflowStatus {
  id: string;
  reference: string;
  title: string;
  currentPhase: number;
  currentStep: number;
  status: string;
  deadline: string;
  currentActorId: string;
}

export default function WorkflowDashboard() {
  const { data: workflowSteps = [], isLoading: stepsLoading } = useQuery({
    queryKey: ["/api/workflow-steps"],
  });

  const { data: tenders = [], isLoading: tendersLoading } = useQuery({
    queryKey: ["/api/tenders"],
  });

  const { data: workflowStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/workflow/stats"],
  });

  if (stepsLoading || tendersLoading || statsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const phaseSteps = {
    1: workflowSteps.filter((step: WorkflowStep) => step.phase === 1),
    2: workflowSteps.filter((step: WorkflowStep) => step.phase === 2),
    3: workflowSteps.filter((step: WorkflowStep) => step.phase === 3)
  };

  const getPhaseTitle = (phase: number) => {
    switch (phase) {
      case 1: return "Phase 1: Préparation et Publication";
      case 2: return "Phase 2: Exécution et Contrôle";
      case 3: return "Phase 3: Traitement des Paiements";
      default: return `Phase ${phase}`;
    }
  };

  const getPhaseDescription = (phase: number) => {
    switch (phase) {
      case 1: return "23 étapes - De l'identification des besoins à la publication";
      case 2: return "19 étapes - De la réception des offres à la signature";
      case 3: return "17 étapes - Du contrôle des livraisons au paiement final";
      default: return "";
    }
  };

  const getActorName = (role: string) => {
    const actors: Record<string, string> = {
      "ST": "Service Technique",
      "SM": "Service Marchés",
      "CE": "Contrôle d'État",
      "SB": "Service Budgétaire",
      "SOR": "Service Ordonnancement",
      "TP": "Trésorier Payeur",
      "ADMIN": "Administrateur"
    };
    return actors[role] || role;
  };

  const getActorColor = (role: string) => {
    const colors: Record<string, string> = {
      "ST": "bg-blue-100 text-blue-800",
      "SM": "bg-purple-100 text-purple-800",
      "CE": "bg-green-100 text-green-800",
      "SB": "bg-orange-100 text-orange-800",
      "SOR": "bg-red-100 text-red-800",
      "TP": "bg-indigo-100 text-indigo-800",
      "ADMIN": "bg-gray-100 text-gray-800"
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const activeTenders = tenders.filter((t: TenderWorkflowStatus) => t.status === "active");
  const completedTenders = tenders.filter((t: TenderWorkflowStatus) => t.status === "completed");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Workflow</h1>
        <p className="text-gray-600">Supervision du workflow à 59 étapes pour la gestion des appels d'offres</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Étapes</p>
                <p className="text-2xl font-bold">{workflowSteps.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Appels d'Offres Actifs</p>
                <p className="text-2xl font-bold">{activeTenders.length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Terminés</p>
                <p className="text-2xl font-bold">{completedTenders.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Acteurs Impliqués</p>
                <p className="text-2xl font-bold">7</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Phases */}
      <Tabs defaultValue="phase1" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="phase1">Phase 1 (23 étapes)</TabsTrigger>
          <TabsTrigger value="phase2">Phase 2 (19 étapes)</TabsTrigger>
          <TabsTrigger value="phase3">Phase 3 (17 étapes)</TabsTrigger>
        </TabsList>

        {[1, 2, 3].map(phase => (
          <TabsContent key={phase} value={`phase${phase}`}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{getPhaseTitle(phase)}</h3>
                    <p className="text-sm text-gray-600">{getPhaseDescription(phase)}</p>
                  </div>
                  <Badge variant="outline">{phaseSteps[phase as keyof typeof phaseSteps]?.length} étapes</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {phaseSteps[phase as keyof typeof phaseSteps]?.map((step: WorkflowStep) => (
                    <div key={step.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="text-xs">
                            Étape {step.stepNumber}
                          </Badge>
                          <h4 className="font-medium">{step.title}</h4>
                          <Badge className={`text-xs ${getActorColor(step.actorRole)}`}>
                            {getActorName(step.actorRole)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{step.estimatedDuration}j</span>
                        </div>
                        {step.isInternal && (
                          <Badge variant="secondary" className="text-xs">
                            Interne
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Active Tenders Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Appels d'Offres en Cours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeTenders.slice(0, 5).map((tender: TenderWorkflowStatus) => {
              const currentPhase = tender.currentPhase;
              const currentStep = tender.currentStep;
              const totalSteps = workflowSteps.length;
              const progress = ((currentStep - 1) / totalSteps) * 100;

              return (
                <div key={tender.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{tender.reference}</h4>
                      <p className="text-sm text-gray-600">{tender.title}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        Phase {currentPhase} - Étape {currentStep}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.round(progress)}% terminé
                      </p>
                    </div>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}