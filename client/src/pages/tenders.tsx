import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import CreateTenderDialog from "@/components/create-tender-dialog";
import TenderCard from "@/components/tender-card";

export default function Tenders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("all");

  const { data: tenders, isLoading } = useQuery({
    queryKey: ["/api/tenders"],
  });

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

  const filteredTenders = (tenders || []).filter((tender: any) => {
    const matchesSearch = 
      tender.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPhase = phaseFilter === "all" || tender.currentPhase.toString() === phaseFilter;
    
    return matchesSearch && matchesPhase;
  });

  const getPhaseStats = () => {
    const stats = { all: tenders?.length || 0, "1": 0, "2": 0, "3": 0 };
    tenders?.forEach((tender: any) => {
      stats[tender.currentPhase as keyof typeof stats]++;
    });
    return stats;
  };

  const phaseStats = getPhaseStats();

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Gestion des appels d'offres</h2>
            <p className="text-slate-600 mt-1">Vue d'ensemble de tous les appels d'offres du système</p>
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
