import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PhaseBadge from "./phase-badge";
import { Clock, AlertTriangle } from "lucide-react";
import type { Tender } from "@shared/schema";

interface TaskItemProps {
  tender: Tender;
  onApprove: (tenderId: string) => void;
  onReject: (tenderId: string) => void;
  onViewDetails: (tenderId: string) => void;
}

export default function TaskItem({ tender, onApprove, onReject, onViewDetails }: TaskItemProps) {
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

  const isUrgent = tender.deadline && new Date(tender.deadline) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h4 className="font-semibold text-slate-900">
                {tender.reference} - {tender.title}
              </h4>
              <PhaseBadge phase={tender.currentPhase as 1 | 2 | 3} size="sm" />
              {isUrgent && (
                <Badge variant="destructive" className="flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Urgent
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-600 mb-3">
              <strong>Étape {tender.currentStep}:</strong> Action requise
            </p>
            <div className="flex items-center text-sm text-slate-500 space-x-4">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Échéance: {formatDate(tender.deadline)}
              </div>
              <span>•</span>
              <span>Montant: {formatCurrency(tender.amount)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <Button 
              size="sm"
              onClick={() => onApprove(tender.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              Approuver
            </Button>
            <Button 
              size="sm"
              variant="destructive"
              onClick={() => onReject(tender.id)}
            >
              Rejeter
            </Button>
            <Button 
              size="sm"
              variant="outline"
              onClick={() => onViewDetails(tender.id)}
            >
              Détails
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
