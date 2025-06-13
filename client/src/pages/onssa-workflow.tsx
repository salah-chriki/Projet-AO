
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileCheck, 
  Users, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  AlertCircle,
  Building,
  DollarSign,
  FileText,
  Workflow
} from "lucide-react";

interface ONSSAPhase {
  id: number;
  name: string;
  description: string;
  steps: number[];
  color: string;
  icon: any;
}

export default function ONSSAWorkflow() {
  const [selectedPhase, setSelectedPhase] = useState<number>(1);
  const queryClient = useQueryClient();

  const createONSSATenderMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/create-onssa-tender", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to create ONSSA tender");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenders"] });
    },
  });

  const onssaPhases: ONSSAPhase[] = [
    {
      id: 1,
      name: "Tender Initiation",
      description: "Create and receive DAO",
      steps: [1, 2],
      color: "bg-blue-500",
      icon: FileText
    },
    {
      id: 2,
      name: "Tender Review",
      description: "Review, validate and submit DAO",
      steps: [3, 4, 5, 6, 7, 8],
      color: "bg-green-500",
      icon: FileCheck
    },
    {
      id: 3,
      name: "Contract Award",
      description: "Commission bidding and contract signing",
      steps: [9, 10, 11, 12, 13, 14],
      color: "bg-purple-500",
      icon: Users
    },
    {
      id: 4,
      name: "Contract Engagement",
      description: "Contract approval and financial engagement",
      steps: [15, 16, 17],
      color: "bg-yellow-500",
      icon: Building
    },
    {
      id: 5,
      name: "Payment Dossier",
      description: "Prepare and review payment documentation",
      steps: [18, 19, 20, 21, 22, 23],
      color: "bg-orange-500",
      icon: FileText
    },
    {
      id: 6,
      name: "Payment Validation",
      description: "TP validation and signature",
      steps: [24, 25, 26, 27, 28, 29],
      color: "bg-red-500",
      icon: CheckCircle
    },
    {
      id: 7,
      name: "Execution Notification",
      description: "Notify execution start",
      steps: [30, 31],
      color: "bg-indigo-500",
      icon: AlertCircle
    },
    {
      id: 8,
      name: "Service Management",
      description: "Manage service suspension/resumption",
      steps: [32, 33],
      color: "bg-pink-500",
      icon: Workflow
    },
    {
      id: 9,
      name: "Service Reception",
      description: "Review and validate deliverables",
      steps: [34, 35, 36, 37, 38, 39],
      color: "bg-teal-500",
      icon: FileCheck
    },
    {
      id: 10,
      name: "Invoicing",
      description: "Invoice processing and financial closure",
      steps: [40, 41, 42, 43, 44, 45],
      color: "bg-gray-500",
      icon: DollarSign
    }
  ];

  const onssaSteps = [
    { step: 1, title: "ST: Create DAO", actor: "ST", phase: 1 },
    { step: 2, title: "SM: Receive DAO", actor: "SM", phase: 1 },
    { step: 3, title: "SM: Forward DAO to CE", actor: "SM", phase: 2 },
    { step: 4, title: "CE: Review DAO", actor: "CE", phase: 2 },
    { step: 5, title: "CE: Log remarks", actor: "CE", phase: 2 },
    { step: 6, title: "SM: Update DAO", actor: "SM", phase: 2 },
    { step: 7, title: "CE: Validate DAO", actor: "CE", phase: 2 },
    { step: 8, title: "SM: Submit to Commission", actor: "SM", phase: 2 },
    { step: 9, title: "SM: Transmit to Commission", actor: "SM", phase: 3 },
    { step: 10, title: "Commission: Manage bidding", actor: "COMMISSION", phase: 3 },
    { step: 11, title: "Commission: Select Prestataire", actor: "COMMISSION", phase: 3 },
    { step: 12, title: "SM: Draft contract", actor: "SM", phase: 3 },
    { step: 13, title: "Direction: Sign contract", actor: "DIRECTION", phase: 3 },
    { step: 14, title: "SM: Inform Prestataire", actor: "SM", phase: 3 },
    { step: 15, title: "SM: Transmit to Prestataire", actor: "SM", phase: 4 },
    { step: 16, title: "Prestataire: Approve contract", actor: "PRESTATAIRE", phase: 4 },
    { step: 17, title: "SB: Engage contract", actor: "SB", phase: 4 },
    { step: 18, title: "SM: Prepare payment dossier", actor: "SM", phase: 5 },
    { step: 19, title: "SM: Transmit to SOR", actor: "SM", phase: 5 },
    { step: 20, title: "SOR: Review dossier", actor: "SOR", phase: 5 },
    { step: 21, title: "SOR: Log remarks", actor: "SOR", phase: 5 },
    { step: 22, title: "SM: Update dossier", actor: "SM", phase: 5 },
    { step: 23, title: "SOR: Establish OP/OV", actor: "SOR", phase: 5 },
    { step: 24, title: "SOR: Transmit OP/OV to TP", actor: "SOR", phase: 6 },
    { step: 25, title: "TP: Review OP/OV", actor: "TP", phase: 6 },
    { step: 26, title: "TP: Log remarks", actor: "TP", phase: 6 },
    { step: 27, title: "SM: Update via SOR", actor: "SM", phase: 6 },
    { step: 28, title: "TP: Validate and sign", actor: "TP", phase: 6 },
    { step: 29, title: "SM: Add ordonnateur signature", actor: "SM", phase: 6 },
    { step: 30, title: "SM: Notify ST of OS activation", actor: "SM", phase: 7 },
    { step: 31, title: "ST: Monitor project kickoff", actor: "ST", phase: 7 },
    { step: 32, title: "ST: Request suspension/resume", actor: "ST", phase: 8 },
    { step: 33, title: "SM: Transmit to Prestataire", actor: "SM", phase: 8 },
    { step: 34, title: "SM: Designate reception commission", actor: "SM", phase: 9 },
    { step: 35, title: "SM: Log deliverables", actor: "SM", phase: 9 },
    { step: 36, title: "ST: Review deliverables", actor: "ST", phase: 9 },
    { step: 37, title: "ST: Log remarks", actor: "ST", phase: 9 },
    { step: 38, title: "Prestataire: Address remarks", actor: "PRESTATAIRE", phase: 9 },
    { step: 39, title: "ST: Finalize reception", actor: "ST", phase: 9 },
    { step: 40, title: "Prestataire: Submit invoice", actor: "PRESTATAIRE", phase: 10 },
    { step: 41, title: "ST: Certify invoice", actor: "ST", phase: 10 },
    { step: 42, title: "ST: Establish note de calcul", actor: "ST", phase: 10 },
    { step: 43, title: "SM: Notify Prestataire", actor: "SM", phase: 10 },
    { step: 44, title: "SM: Receive definitive deposit", actor: "SM", phase: 10 },
    { step: 45, title: "SB: Confirm financial closure", actor: "SB", phase: 10 }
  ];

  const getActorBadgeColor = (actor: string) => {
    const colors = {
      'ST': 'bg-blue-100 text-blue-800',
      'SM': 'bg-green-100 text-green-800',
      'CE': 'bg-purple-100 text-purple-800',
      'SB': 'bg-yellow-100 text-yellow-800',
      'SOR': 'bg-orange-100 text-orange-800',
      'TP': 'bg-red-100 text-red-800',
      'COMMISSION': 'bg-indigo-100 text-indigo-800',
      'DIRECTION': 'bg-pink-100 text-pink-800',
      'PRESTATAIRE': 'bg-gray-100 text-gray-800'
    };
    return colors[actor as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const selectedPhaseData = onssaPhases.find(p => p.id === selectedPhase);
  const selectedPhaseSteps = onssaSteps.filter(s => s.phase === selectedPhase);
  const totalProgress = (selectedPhase / 10) * 100;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Workflow ONSSA - Gestion des Appels d'Offres
          </h1>
          <p className="text-gray-600">
            Processus en 10 phases et 45 étapes pour la gestion des marchés ONSSA
          </p>
        </div>
        <Button 
          onClick={() => createONSSATenderMutation.mutate()}
          disabled={createONSSATenderMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {createONSSATenderMutation.isPending ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Création en cours...
            </>
          ) : (
            <>
              <FileCheck className="h-4 w-4 mr-2" />
              Créer Appel d'Offres ONSSA
            </>
          )}
        </Button>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Workflow className="h-5 w-5 mr-2" />
            Vue d'Ensemble du Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progression générale</span>
                <span>{selectedPhase}/10 phases</span>
              </div>
              <Progress value={totalProgress} className="h-2 mt-2" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">10</p>
                <p className="text-sm text-gray-600">Phases</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">45</p>
                <p className="text-sm text-gray-600">Étapes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">9</p>
                <p className="text-sm text-gray-600">Acteurs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">~60</p>
                <p className="text-sm text-gray-600">Jours</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">480K€</p>
                <p className="text-sm text-gray-600">Budget</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {onssaPhases.map((phase) => {
          const Icon = phase.icon;
          return (
            <Card 
              key={phase.id}
              className={`cursor-pointer transition-all ${
                selectedPhase === phase.id 
                  ? 'ring-2 ring-blue-500 shadow-md' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedPhase(phase.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${phase.color} text-white`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      Phase {phase.id}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {phase.steps.length} étapes
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                  {phase.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Phase Details */}
      {selectedPhaseData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <selectedPhaseData.icon className="h-5 w-5 mr-2" />
              Phase {selectedPhaseData.id}: {selectedPhaseData.name}
            </CardTitle>
            <p className="text-gray-600">{selectedPhaseData.description}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedPhaseSteps.map((step, index) => (
                <div 
                  key={step.step}
                  className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {step.step}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {step.title}
                    </h4>
                  </div>
                  
                  <Badge className={getActorBadgeColor(step.actor)}>
                    {step.actor}
                  </Badge>
                  
                  {index < selectedPhaseSteps.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actor Roles */}
      <Card>
        <CardHeader>
          <CardTitle>Rôles des Acteurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Services Techniques</h4>
              <div className="space-y-1">
                <Badge className="bg-blue-100 text-blue-800">ST - Service Technique</Badge>
                <p className="text-xs text-gray-600">Spécifications techniques, réception</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Services Administratifs</h4>
              <div className="space-y-1">
                <Badge className="bg-green-100 text-green-800">SM - Service Marchés</Badge>
                <Badge className="bg-purple-100 text-purple-800">CE - Contrôle d'État</Badge>
                <p className="text-xs text-gray-600">Gestion administrative et contrôle</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Services Financiers</h4>
              <div className="space-y-1">
                <Badge className="bg-yellow-100 text-yellow-800">SB - Service Budgétaire</Badge>
                <Badge className="bg-orange-100 text-orange-800">SOR - Service Ordonnancement</Badge>
                <Badge className="bg-red-100 text-red-800">TP - Trésorier Payeur</Badge>
                <p className="text-xs text-gray-600">Gestion financière et paiements</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
