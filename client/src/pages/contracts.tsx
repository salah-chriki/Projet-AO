import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Eye, Edit, FileText } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
// import CreateContractDialog from "@/components/create-contract-dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Contract {
  id: string;
  tenderId: string;
  contractorId?: string;
  contractorName?: string;
  dateSigned?: string;
  amount: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function ContractsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ["/api/contracts"],
  });

  const updateContractMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Contract> }) => {
      const response = await fetch(`/api/contracts/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to update contract");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
    },
  });

  const filteredContracts = contracts.filter((contract: Contract) =>
    contract.contractorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.amount.includes(searchTerm) ||
    contract.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Actif", variant: "default" as const },
      completed: { label: "Terminé", variant: "secondary" as const },
      terminated: { label: "Résilié", variant: "destructive" as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "default" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleStatusChange = (contractId: string, newStatus: string) => {
    updateContractMutation.mutate({
      id: contractId,
      updates: { status: newStatus },
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement des contrats...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Contrats</h1>
          <p className="text-gray-600">Gérez les contrats signés et leur suivi</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Contrat
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Liste des Contrats ({filteredContracts.length})</CardTitle>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher par prestataire, montant..."
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
                  <th className="text-left py-3 px-4 font-medium">Prestataire</th>
                  <th className="text-left py-3 px-4 font-medium">Montant</th>
                  <th className="text-left py-3 px-4 font-medium">Date Signature</th>
                  <th className="text-left py-3 px-4 font-medium">Statut</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.map((contract: Contract) => (
                  <tr key={contract.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{contract.contractorName || "Non défini"}</div>
                        <div className="text-sm text-gray-500">ID: {contract.id.slice(0, 8)}...</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        }).format(Number(contract.amount))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {contract.dateSigned ? (
                        <div className="text-sm">
                          {format(new Date(contract.dateSigned), "dd MMM yyyy", { locale: fr })}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Non signé</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(contract.status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredContracts.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun contrat trouvé</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? "Aucun contrat ne correspond à votre recherche." : "Commencez par créer votre premier contrat."}
                </p>
                {!searchTerm && (
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un contrat
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