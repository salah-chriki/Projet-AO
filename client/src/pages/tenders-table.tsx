import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye, Calendar, DollarSign } from "lucide-react";
import CreateTenderDialog from "@/components/create-tender-dialog";
import PhaseBadge from "@/components/phase-badge";
import ActorBadge from "@/components/actor-badge";
import { useLocation } from "wouter";
import { ACTOR_ROLES } from "@/lib/constants";

export default function TendersTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [, setLocation] = useLocation();

  const { data: tenders, isLoading } = useQuery({
    queryKey: ["/api/tenders"],
  });

  const handleViewTender = (tenderId: string) => {
    setLocation(`/tenders/${tenderId}`);
  };

  const filteredTenders = (tenders || []).filter((tender: any) => {
    const matchesSearch = tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tender.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPhase = phaseFilter === "all" || tender.currentPhase.toString() === phaseFilter;
    return matchesSearch && matchesPhase;
  }) || [];

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(parseFloat(amount));
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  const getPhaseStats = () => {
    const stats = { all: (tenders || []).length, "1": 0, "2": 0, "3": 0 };
    (tenders || []).forEach((tender: any) => {
      stats[tender.currentPhase as keyof typeof stats]++;
    });
    return stats;
  };

  const phaseStats = getPhaseStats();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Appels d'offres</h2>
            <p className="text-slate-600 mt-1">Gestion des procédures d'appels d'offres</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Input
                type="text"
                placeholder="Rechercher par titre ou référence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64"
              />
              <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
            </div>
            <Select value={phaseFilter} onValueChange={setPhaseFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par phase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les phases</SelectItem>
                <SelectItem value="1">Phase 1 - Préparation</SelectItem>
                <SelectItem value="2">Phase 2 - Exécution</SelectItem>
                <SelectItem value="3">Phase 3 - Paiements</SelectItem>
              </SelectContent>
            </Select>
            <CreateTenderDialog>
              <Button>
                Nouvel appel d'offres
              </Button>
            </CreateTenderDialog>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total</p>
                <p className="text-2xl font-bold text-slate-900">{phaseStats.all}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Phase 1</p>
                <p className="text-2xl font-bold text-emerald-600">{phaseStats["1"]}</p>
              </div>
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-emerald-600 rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Phase 2</p>
                <p className="text-2xl font-bold text-orange-600">{phaseStats["2"]}</p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-orange-600 rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Phase 3</p>
                <p className="text-2xl font-bold text-purple-600">{phaseStats["3"]}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tenders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des appels d'offres ({filteredTenders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTenders.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Référence</TableHead>
                      <TableHead>Titre</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead>Division</TableHead>
                      <TableHead>Phase</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Acteur actuel</TableHead>
                      <TableHead>Créé le</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTenders.map((tender: any) => (
                      <TableRow key={tender.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium">
                          <span className="font-mono text-sm">{tender.reference}</span>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="font-medium text-slate-900 truncate">
                              {tender.title}
                            </p>
                            <p className="text-sm text-slate-500 truncate">
                              {tender.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium text-slate-700">
                            {tender.direction || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium text-slate-700">
                            {tender.division || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <PhaseBadge phase={tender.currentPhase as 1 | 2 | 3} size="sm" />
                        </TableCell>
                        <TableCell>
                          <Badge variant={tender.status === "active" ? "default" : "secondary"}>
                            {tender.status === "active" ? "Actif" : "Terminé"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center font-medium">
                            <DollarSign className="w-4 h-4 mr-1 text-slate-400" />
                            {formatCurrency(tender.amount)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {tender.currentActor?.role ? (
                            <ActorBadge role={tender.currentActor.role as keyof typeof ACTOR_ROLES} size="sm" />
                          ) : (
                            <span className="text-sm text-slate-400">Non assigné</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-slate-600">
                            <Calendar className="w-4 h-4 mr-1 text-slate-400" />
                            {formatDate(tender.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewTender(tender.id)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Voir détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-500 text-lg">Aucun appel d'offres trouvé</p>
                <p className="text-slate-400 text-sm mt-2">
                  {searchQuery || phaseFilter !== "all" 
                    ? "Essayez de modifier vos critères de recherche"
                    : "Commencez par créer votre premier appel d'offres"
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}