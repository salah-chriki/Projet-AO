import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ActorBadge from "./actor-badge";
import PhaseBadge from "./phase-badge";
import { ACTOR_ROLES } from "@/lib/constants";
import type { Tender } from "@shared/schema";

interface TenderCardProps {
  tender: Tender & { currentActor?: { role: string } };
  onViewDetails: (tenderId: string) => void;
}

export default function TenderCard({ tender, onViewDetails }: TenderCardProps) {
  const formatCurrency = (amount: string | null) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(parseFloat(amount));
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("fr-FR").format(new Date(date));
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">{tender.reference}</h3>
            <p className="text-sm text-slate-600 line-clamp-2">{tender.title}</p>
          </div>
          <PhaseBadge phase={tender.currentPhase as 1 | 2 | 3} />
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Direction:</span>
            <span className="font-medium text-slate-900">
              {tender.direction || "N/A"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Division:</span>
            <span className="font-medium text-slate-900">
              {tender.division || "N/A"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Montant:</span>
            <span className="font-medium text-slate-900">
              {formatCurrency(tender.amount)}
            </span>
          </div>
          {tender.prestataire && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Prestataire:</span>
              <span className="font-medium text-slate-900 text-right">
                {tender.prestataire}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Acteur actuel:</span>
            {tender.currentActor && (
              <ActorBadge role={tender.currentActor.role as keyof typeof ACTOR_ROLES} />
            )}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Échéance:</span>
            <span className="font-medium text-slate-900">
              {formatDate(tender.deadline)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Étape {tender.currentStep} - {tender.status}
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onViewDetails(tender.id)}
            className="text-blue-600 hover:text-blue-700"
          >
            Voir détails
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
