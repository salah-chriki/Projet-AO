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
import { Search, Eye, Calendar, DollarSign, Filter } from "lucide-react";
import CreateTenderDialog from "@/components/create-tender-dialog";
import PhaseBadge from "@/components/phase-badge";
import ActorBadge from "@/components/actor-badge";
import TenderCard from "@/components/tender-card";
import { useLocation } from "wouter";
import { ACTOR_ROLES } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { DIRECTIONS } from "@/lib/directions";

export default function Tenders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [directionFilter, setDirectionFilter] = useState("all");
  const [divisionFilter, setDivisionFilter] = useState("all");
  const { user } = useAuth();

  const { data: tenders, isLoading } = useQuery({
    queryKey: ["/api/tenders", { direction: directionFilter, division: divisionFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (directionFilter !== "all") params.append("direction", directionFilter);
      if (divisionFilter !== "all") params.append("division", divisionFilter);
      
      const response = await fetch(`/api/tenders?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch tenders");
      return response.json();
    },
  });

  // Get available divisions for selected direction
  const getAvailableDivisions = () => {
    if (directionFilter === "all") return [];
    
    const directionStructure = {
      "DAF": ["DSI", "DRHS", "DF"],
      "DPPAV": ["DCSP", "DSA", "DPV"],
      "DCPA": ["DCPVOV", "DPPA", "DSSPAAA"],
      "DIL": ["DIC", "DL", "DPIV"],
      "DERAJ": ["DERSP", "DNQSPS", "DR"],
      "DCC": ["DCC"],
      "DCGAI": ["DCGAI"]
    };
    
    return directionStructure[directionFilter as keyof typeof directionStructure] || [];
  };

  // Reset division filter when direction changes
  const handleDirectionChange = (value: string) => {
    setDirectionFilter(value);
    setDivisionFilter("all");
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredTenders = Array.isArray(tenders) ? tenders.filter((tender: any) => {
    const matchesSearch = 
      tender.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPhase = phaseFilter === "all" || tender.currentPhase?.toString() === phaseFilter;
    
    return matchesSearch && matchesPhase;
  }) : [];

  const getPhaseStats = () => {
    const stats = { all: Array.isArray(tenders) ? tenders.length : 0, "1": 0, "2": 0, "3": 0 };
    if (Array.isArray(tenders)) {
      tenders.forEach((tender: any) => {
        if (tender.currentPhase && stats[tender.currentPhase as keyof typeof stats] !== undefined) {
          stats[tender.currentPhase as keyof typeof stats]++;
        }
      });
    }
    return stats;
  };

  const phaseStats = getPhaseStats();

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {(user as any)?.role === "SM" ? "Contrôle des appels d'offres" : "Gestion des appels d'offres"}
            </h2>
            <p className="text-slate-600 mt-1">
              {(user as any)?.role === "SM" 
                ? "Appels d'offres nécessitant votre contrôle - Filtrez par direction et division"
                : "Vue d'ensemble de tous les appels d'offres du système"
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64"
              />
              <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
            </div>
            <Select value={phaseFilter} onValueChange={setPhaseFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Toutes les phases" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les phases</SelectItem>
                <SelectItem value="1">Phase 1: Préparation</SelectItem>
                <SelectItem value="2">Phase 2: Exécution</SelectItem>
                <SelectItem value="3">Phase 3: Paiements</SelectItem>
              </SelectContent>
            </Select>

            {/* Direction and Division filters for SM actors */}
            {(user as any)?.role === "SM" && (
              <>
                <Select value={directionFilter} onValueChange={handleDirectionChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Toutes les directions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les directions</SelectItem>
                    <SelectItem value="DAF">DAF</SelectItem>
                    <SelectItem value="DPPAV">DPPAV</SelectItem>
                    <SelectItem value="DCPA">DCPA</SelectItem>
                    <SelectItem value="DIL">DIL</SelectItem>
                    <SelectItem value="DERAJ">DERAJ</SelectItem>
                    <SelectItem value="DCC">DCC</SelectItem>
                    <SelectItem value="DCGAI">DCGAI</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={divisionFilter} 
                  onValueChange={setDivisionFilter}
                  disabled={directionFilter === "all"}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Toutes les divisions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les divisions</SelectItem>
                    {getAvailableDivisions().map((division) => (
                      <SelectItem key={division} value={division}>
                        {division}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            <CreateTenderDialog />
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant={phaseFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setPhaseFilter("all")}
            >
              Tous ({phaseStats.all})
            </Button>
            <Button 
              variant={phaseFilter === "1" ? "default" : "outline"}
              size="sm"
              onClick={() => setPhaseFilter("1")}
            >
              En préparation ({phaseStats["1"]})
            </Button>
            <Button 
              variant={phaseFilter === "2" ? "default" : "outline"}
              size="sm"
              onClick={() => setPhaseFilter("2")}
            >
              En exécution ({phaseStats["2"]})
            </Button>
            <Button 
              variant={phaseFilter === "3" ? "default" : "outline"}
              size="sm"
              onClick={() => setPhaseFilter("3")}
            >
              En paiement ({phaseStats["3"]})
            </Button>
          </div>
        </div>

        {/* Tenders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTenders.map((tender: any) => (
            <TenderCard
              key={tender.id}
              tender={tender}
              onViewDetails={(id) => {
                // Navigate to tender detail
                window.location.href = `/tenders/${id}`;
              }}
            />
          ))}
        </div>

        {filteredTenders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">Aucun appel d'offres trouvé</p>
            <p className="text-slate-400 text-sm mt-2">
              {searchQuery || phaseFilter !== "all" 
                ? "Essayez de modifier vos critères de recherche"
                : "Commencez par créer un nouvel appel d'offres"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
