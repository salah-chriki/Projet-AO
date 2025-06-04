import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Eye, Edit, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Reception {
  id: string;
  contractId: string;
  type: string;
  date: string;
  status: string;
  comments?: string;
  receivedById: string;
  createdAt: string;
}

export default function ReceptionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: receptions = [], isLoading } = useQuery({
    queryKey: ["/api/receptions"],
  });

  const updateReceptionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Reception> }) => {
      const response = await fetch(`/api/receptions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update reception");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/receptions"] });
    },
  });

  const filteredReceptions = receptions.filter((reception: Reception) =>
    reception.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reception.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reception.comments?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      Provisional: { label: "Provisoire", variant: "default" as const },
      Final: { label: "Définitive", variant: "secondary" as const },
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || { label: type, variant: "default" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "En attente", variant: "default" as const },
      approved: { label: "Approuvée", variant: "secondary" as const },
      rejected: { label: "Rejetée", variant: "destructive" as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "default" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleStatusChange = (receptionId: string, newStatus: string) => {
    updateReceptionMutation.mutate({
      id: receptionId,
      updates: { status: newStatus },
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement des réceptions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Réceptions</h1>
          <p className="text-gray-600">Gérez les réceptions provisoires et définitives</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Réception
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Liste des Réceptions ({filteredReceptions.length})</CardTitle>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher par type, statut..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Type</th>
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Commentaires</th>
                  <th className="text-left py-3 px-4 font-medium">Statut</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceptions.map((reception: Reception) => (
                  <tr key={reception.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        {getTypeBadge(reception.type)}
                        <div className="text-sm text-gray-500 mt-1">ID: {reception.id.slice(0, 8)}...</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        {format(new Date(reception.date), "dd MMM yyyy", { locale: fr })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm max-w-xs truncate">
                        {reception.comments || "Aucun commentaire"}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(reception.status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {reception.status === "pending" && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleStatusChange(reception.id, "approved")}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleStatusChange(reception.id, "rejected")}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredReceptions.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réception trouvée</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? "Aucune réception ne correspond à votre recherche." : "Commencez par créer votre première réception."}
                </p>
                {!searchTerm && (
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer une réception
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}