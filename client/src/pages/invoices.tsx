import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Eye, Download, FileText, Upload } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Invoice {
  id: string;
  contractId: string;
  fileName?: string;
  originalFileName?: string;
  status: string;
  amount?: string;
  submissionDate: string;
  approvedDate?: string;
  createdAt: string;
}

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["/api/invoices"],
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Invoice> }) => {
      return await apiRequest(`/api/invoices/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
    },
  });

  const filteredInvoices = invoices.filter((invoice: Invoice) =>
    invoice.originalFileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (invoice.amount && invoice.amount.includes(searchTerm))
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "En attente", variant: "default" as const },
      approved: { label: "Approuvée", variant: "secondary" as const },
      rejected: { label: "Rejetée", variant: "destructive" as const },
      paid: { label: "Payée", variant: "secondary" as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "default" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleStatusChange = (invoiceId: string, newStatus: string) => {
    updateInvoiceMutation.mutate({
      id: invoiceId,
      updates: { 
        status: newStatus,
        approvedDate: newStatus === "approved" ? new Date().toISOString() : undefined
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement des factures...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Factures</h1>
          <p className="text-gray-600">Suivez et validez les factures des prestataires</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Facture
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Liste des Factures ({filteredInvoices.length})</CardTitle>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher par nom, statut..."
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
                  <th className="text-left py-3 px-4 font-medium">Fichier</th>
                  <th className="text-left py-3 px-4 font-medium">Montant</th>
                  <th className="text-left py-3 px-4 font-medium">Date Soumission</th>
                  <th className="text-left py-3 px-4 font-medium">Statut</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice: Invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{invoice.originalFileName || "Sans nom"}</div>
                          <div className="text-sm text-gray-500">ID: {invoice.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {invoice.amount ? (
                        <div className="font-medium">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR'
                          }).format(Number(invoice.amount))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Non défini</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        {format(new Date(invoice.submissionDate), "dd MMM yyyy", { locale: fr })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {invoice.fileName && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        {invoice.status === "pending" && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleStatusChange(invoice.id, "approved")}
                              className="text-green-600 hover:text-green-700"
                            >
                              Approuver
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleStatusChange(invoice.id, "rejected")}
                              className="text-red-600 hover:text-red-700"
                            >
                              Rejeter
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredInvoices.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune facture trouvée</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? "Aucune facture ne correspond à votre recherche." : "Les factures soumises apparaîtront ici."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}