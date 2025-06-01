import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ActorBadge from "./actor-badge";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { ACTOR_ROLES } from "@/lib/constants";

interface TenderTimelineProps {
  tenderId: string;
}

export default function TenderTimeline({ tenderId }: TenderTimelineProps) {
  const { data: timeline, isLoading } = useQuery<any[]>({
    queryKey: [`/api/tenders/${tenderId}/timeline`],
    enabled: !!tenderId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique des étapes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "created":
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-orange-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "created":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-orange-100 text-orange-800 border-orange-200";
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "approved":
        return "Approuvé";
      case "rejected":
        return "Rejeté";
      case "created":
        return "Créé";
      case "pending":
        return "En attente";
      case "completed":
        return "Terminé";
      default:
        return action;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Historique des étapes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {timeline && Array.isArray(timeline) && timeline.length > 0 ? (
          <div className="space-y-6">
            {timeline.map((entry: any, index: number) => (
              <div key={entry.id} className="relative">
                {/* Timeline line */}
                {index < timeline.length - 1 && (
                  <div className="absolute left-4 top-8 w-0.5 h-16 bg-slate-200"></div>
                )}
                
                <div className="flex items-start space-x-4">
                  {/* Timeline icon */}
                  <div className="flex-shrink-0 w-8 h-8 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center">
                    {getActionIcon(entry.action)}
                  </div>
                  
                  {/* Timeline content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 mb-1">
                          {entry.stepTitle}
                        </h4>
                        <p className="text-sm text-slate-600 mb-2">
                          {entry.stepDescription}
                        </p>
                        {entry.comments && (
                          <p className="text-sm italic text-slate-500 mb-2">
                            "{entry.comments}"
                          </p>
                        )}
                        <div className="flex items-center space-x-3 text-sm text-slate-500">
                          <span>{formatDate(entry.createdAt)}</span>
                          {entry.completedAt && (
                            <span>• Complété le {formatDate(entry.completedAt)}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge className={`${getActionColor(entry.action)} border`}>
                          {getActionLabel(entry.action)}
                        </Badge>
                        {entry.actorRole && (
                          <ActorBadge 
                            role={entry.actorRole as keyof typeof ACTOR_ROLES} 
                            size="sm" 
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500">Aucun historique disponible</p>
            <p className="text-sm text-slate-400">
              L'historique des étapes apparaîtra au fur et à mesure du traitement
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}