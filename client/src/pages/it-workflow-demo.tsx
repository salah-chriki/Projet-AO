import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Monitor, 
  Printer, 
  Server, 
  HardDrive,
  CheckCircle, 
  Clock, 
  ArrowRight,
  Users,
  FileText,
  Settings,
  DollarSign
} from "lucide-react";

export default function ITWorkflowDemo() {
  const [currentStep, setCurrentStep] = useState(1);
  const queryClient = useQueryClient();

  const createITTenderMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/create-it-tender", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to create IT tender");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenders"] });
    },
  });

  const itEquipmentSpecs = [
    {
      icon: Monitor,
      name: "Ordinateurs Portables",
      quantity: 50,
      specs: "Core i7, 16GB RAM, 512GB SSD",
      estimatedCost: "€35,000"
    },
    {
      icon: Printer,
      name: "Imprimantes Multifonctions",
      quantity: 10,
      specs: "A4/A3, Recto-verso, Réseau",
      estimatedCost: "€8,000"
    },
    {
      icon: Server,
      name: "Serveurs de Données",
      quantity: 5,
      specs: "Dell PowerEdge ou équivalent",
      estimatedCost: "€25,000"
    },
    {
      icon: HardDrive,
      name: "Licences Logicielles",
      quantity: 60,
      specs: "Microsoft Office 365, Antivirus",
      estimatedCost: "€12,000"
    }
  ];

  const workflowPhases = [
    {
      phase: 1,
      title: "Préparation et Publication",
      steps: 23,
      description: "De l'identification des besoins à la publication",
      actors: ["ST", "SM", "CE", "SB"],
      duration: "30 jours"
    },
    {
      phase: 2,
      title: "Exécution et Contrôle",
      steps: 19,
      description: "De la réception des offres à la signature",
      actors: ["SM", "ST", "CE", "SB", "ADMIN"],
      duration: "45 jours"
    },
    {
      phase: 3,
      title: "Traitement des Paiements",
      steps: 17,
      description: "Du contrôle des livraisons au paiement final",
      actors: ["ST", "SM", "SOR", "TP"],
      duration: "20 jours"
    }
  ];

  const getActorColor = (actor: string) => {
    const colors: Record<string, string> = {
      "ST": "bg-blue-100 text-blue-800",
      "SM": "bg-purple-100 text-purple-800",
      "CE": "bg-green-100 text-green-800",
      "SB": "bg-orange-100 text-orange-800",
      "SOR": "bg-red-100 text-red-800",
      "TP": "bg-indigo-100 text-indigo-800",
      "ADMIN": "bg-gray-100 text-gray-800"
    };
    return colors[actor] || "bg-gray-100 text-gray-800";
  };

  const getActorName = (actor: string) => {
    const names: Record<string, string> = {
      "ST": "Service Technique",
      "SM": "Service Marchés",
      "CE": "Contrôle d'État",
      "SB": "Service Budgétaire",
      "SOR": "Service Ordonnancement",
      "TP": "Trésorier Payeur",
      "ADMIN": "Administrateur"
    };
    return names[actor] || actor;
  };

  const progress = (currentStep / 59) * 100;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Démonstration Workflow IT Equipment
          </h1>
          <p className="text-gray-600">
            Acquisition d'équipements informatiques - 59 étapes détaillées
          </p>
        </div>
        <Button 
          onClick={() => createITTenderMutation.mutate()}
          disabled={createITTenderMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {createITTenderMutation.isPending ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Création en cours...
            </>
          ) : (
            <>
              <Monitor className="h-4 w-4 mr-2" />
              Créer l'Appel d'Offres IT
            </>
          )}
        </Button>
      </div>

      {/* Equipment Specifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Spécifications des Équipements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {itEquipmentSpecs.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <item.icon className="h-8 w-8 text-blue-600" />
                  <Badge variant="outline" className="text-green-600">
                    {item.estimatedCost}
                  </Badge>
                </div>
                <h3 className="font-semibold text-sm">{item.name}</h3>
                <p className="text-gray-600 text-xs mt-1">Quantité: {item.quantity}</p>
                <p className="text-gray-500 text-xs mt-2">{item.specs}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-semibold">Budget Total Estimé</span>
              </div>
              <span className="text-xl font-bold text-blue-600">€80,000</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Progression du Workflow
            </div>
            <Badge variant="outline">
              Étape {currentStep}/59
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Début</span>
              <span>{Math.round(progress)}% Terminé</span>
              <span>Fin</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Phases */}
      <Tabs defaultValue="phase1" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="phase1">Phase 1 (23 étapes)</TabsTrigger>
          <TabsTrigger value="phase2">Phase 2 (19 étapes)</TabsTrigger>
          <TabsTrigger value="phase3">Phase 3 (17 étapes)</TabsTrigger>
        </TabsList>

        {workflowPhases.map(phase => (
          <TabsContent key={phase.phase} value={`phase${phase.phase}`}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{phase.title}</h3>
                    <p className="text-sm text-gray-600">{phase.description}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-2">
                      {phase.steps} étapes
                    </Badge>
                    <p className="text-xs text-gray-500">
                      Durée: {phase.duration}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Acteurs Impliqués
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {phase.actors.map(actor => (
                        <Badge key={actor} className={getActorColor(actor)}>
                          {getActorName(actor)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Étapes Clés</h4>
                    {phase.phase === 1 && (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 border rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">Évaluation des besoins IT</p>
                            <p className="text-xs text-gray-600">
                              Analyse des besoins: 50 ordinateurs, 10 imprimantes, 5 serveurs
                            </p>
                          </div>
                          <Badge className={getActorColor("ST")}>ST</Badge>
                        </div>
                        <div className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Clock className="h-5 w-5 text-orange-500" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">Spécifications techniques</p>
                            <p className="text-xs text-gray-600">
                              Élaboration du cahier des charges détaillé (DAO)
                            </p>
                          </div>
                          <Badge className={getActorColor("ST")}>ST</Badge>
                        </div>
                        <div className="flex items-center space-x-3 p-3 border rounded-lg">
                          <ArrowRight className="h-5 w-5 text-blue-500" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">Publication des marchés</p>
                            <p className="text-xs text-gray-600">
                              Publication sur le portail marchespublics.gov.ma
                            </p>
                          </div>
                          <Badge className={getActorColor("SM")}>SM</Badge>
                        </div>
                      </div>
                    )}

                    {phase.phase === 2 && (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 border rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">Réception des offres</p>
                            <p className="text-xs text-gray-600">
                              Ouverture publique: administratif → technique → financier
                            </p>
                          </div>
                          <Badge className={getActorColor("SM")}>SM</Badge>
                        </div>
                        <div className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Clock className="h-5 w-5 text-orange-500" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">Évaluation technique</p>
                            <p className="text-xs text-gray-600">
                              Vérification conformité équipements, tests si nécessaire
                            </p>
                          </div>
                          <Badge className={getActorColor("ST")}>ST</Badge>
                        </div>
                        <div className="flex items-center space-x-3 p-3 border rounded-lg">
                          <ArrowRight className="h-5 w-5 text-blue-500" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">Signature du marché</p>
                            <p className="text-xs text-gray-600">
                              Attribution et signature avec caution définitive
                            </p>
                          </div>
                          <Badge className={getActorColor("SM")}>SM</Badge>
                        </div>
                      </div>
                    )}

                    {phase.phase === 3 && (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 border rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">Réception équipements</p>
                            <p className="text-xs text-gray-600">
                              Tests fonctionnalité, PV de réception provisoire/définitive
                            </p>
                          </div>
                          <Badge className={getActorColor("ST")}>ST</Badge>
                        </div>
                        <div className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Clock className="h-5 w-5 text-orange-500" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">Certification factures</p>
                            <p className="text-xs text-gray-600">
                              Préparation dossier de paiement, vérification administrative
                            </p>
                          </div>
                          <Badge className={getActorColor("SM")}>SM</Badge>
                        </div>
                        <div className="flex items-center space-x-3 p-3 border rounded-lg">
                          <ArrowRight className="h-5 w-5 text-blue-500" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">Paiement final</p>
                            <p className="text-xs text-gray-600">
                              Décaissement effectif des fonds par le Trésorier Payeur
                            </p>
                          </div>
                          <Badge className={getActorColor("TP")}>TP</Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}