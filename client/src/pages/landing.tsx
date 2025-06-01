import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, BarChart3, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Système de Gestion des Appels d'Offres
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Plateforme complète pour la gestion des marchés publics français
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = "/api/login"}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Se connecter
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader className="text-center">
              <FileText className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <CardTitle className="text-lg">Gestion des AO</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Suivi complet du cycle de vie des appels d'offres en 3 phases
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="w-12 h-12 mx-auto text-green-600 mb-4" />
              <CardTitle className="text-lg">Workflow Multi-Acteurs</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Collaboration entre ST, SM, CE, SB, SOR et TP
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto text-purple-600 mb-4" />
              <CardTitle className="text-lg">Tableau de Bord</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Statistiques en temps réel et suivi des performances
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 mx-auto text-orange-600 mb-4" />
              <CardTitle className="text-lg">Contrôle d'Accès</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Accès sécurisé basé sur les rôles et permissions
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Processus en 3 Phases
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Préparation</h3>
              <p className="text-slate-600">
                Élaboration du dossier, validation par le contrôle d'État, publication
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Exécution</h3>
              <p className="text-slate-600">
                Suivi des prestations, contrôle qualité, réception des travaux
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Paiements</h3>
              <p className="text-slate-600">
                Traitement des factures, validation budgétaire, paiement final
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
