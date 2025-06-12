import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Download, 
  Database, 
  FileJson, 
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3
} from "lucide-react";

export default function DataExport() {
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [lastExport, setLastExport] = useState<any>(null);

  // Query to get export preview data
  const { data: exportData, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/export/data'],
    enabled: false // Only fetch when manually triggered
  });

  // Mutation for downloading files
  const downloadMutation = useMutation({
    mutationFn: async (format: 'json' | 'csv') => {
      const response = await fetch(`/api/export/download/${format}`, {
        method: 'GET',
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      if (format === 'json') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `tender_system_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        return { success: true, format: 'json' };
      } else {
        const result = await response.json();
        return result;
      }
    },
    onSuccess: (data) => {
      setLastExport({ ...data, timestamp: new Date().toISOString() });
    }
  });

  const handlePreviewExport = () => {
    refetch();
  };

  const handleDownload = () => {
    downloadMutation.mutate(exportFormat);
  };

  const getDataSummary = () => {
    if (!exportData?.data) return null;
    
    const data = exportData.data;
    return [
      { label: "Utilisateurs", count: data.users?.length || 0, icon: "👥" },
      { label: "Appels d'offres", count: data.tenders?.length || 0, icon: "📄" },
      { label: "Contrats", count: data.contracts?.length || 0, icon: "📋" },
      { label: "Factures", count: data.invoices?.length || 0, icon: "🧾" },
      { label: "Commandes", count: data.orders?.length || 0, icon: "📦" },
      { label: "Réceptions", count: data.receptions?.length || 0, icon: "✅" },
      { label: "Paiements", count: data.payments?.length || 0, icon: "💰" },
    ];
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Export des Données
          </h1>
          <p className="text-gray-600">
            Exportez toutes les données du système de gestion des appels d'offres
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-blue-600" />
          <Badge variant="outline">
            Base de données PostgreSQL
          </Badge>
        </div>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Options d'Export
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={exportFormat} onValueChange={(value) => setExportFormat(value as 'json' | 'csv')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="json" className="flex items-center space-x-2">
                <FileJson className="h-4 w-4" />
                <span>JSON (Complet)</span>
              </TabsTrigger>
              <TabsTrigger value="csv" className="flex items-center space-x-2">
                <FileSpreadsheet className="h-4 w-4" />
                <span>CSV (Par table)</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="json" className="mt-4">
              <Alert>
                <FileJson className="h-4 w-4" />
                <AlertDescription>
                  Format JSON complet incluant toutes les données avec structure relationnelle préservée.
                  Idéal pour les sauvegardes complètes et la migration de données.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="csv" className="mt-4">
              <Alert>
                <FileSpreadsheet className="h-4 w-4" />
                <AlertDescription>
                  Export CSV séparé par table, compatible avec Excel et autres outils d'analyse.
                  Parfait pour l'analyse de données et les rapports.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>

          <div className="flex space-x-3 mt-6">
            <Button 
              onClick={handlePreviewExport}
              disabled={isLoading}
              variant="outline"
              className="flex items-center space-x-2"
            >
              {isLoading ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <BarChart3 className="h-4 w-4" />
              )}
              <span>Aperçu des Données</span>
            </Button>

            <Button 
              onClick={handleDownload}
              disabled={downloadMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
            >
              {downloadMutation.isPending ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span>Télécharger Export {exportFormat.toUpperCase()}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Preview */}
      {exportData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Aperçu des Données
              </div>
              <Badge variant="outline">
                {exportData.data?.metadata?.totalRecords || 0} enregistrements
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {getDataSummary()?.map((item, index) => (
                <div key={index} className="text-center p-4 border rounded-lg hover:bg-gray-50">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="text-2xl font-bold text-blue-600">{item.count}</div>
                  <div className="text-sm text-gray-600">{item.label}</div>
                </div>
              ))}
            </div>

            {exportData.summary && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Résumé de l'Export</h4>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {exportData.summary}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Export Status */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erreur lors de l'export: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {lastExport && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Export {lastExport.format?.toUpperCase()} réussi le {new Date(lastExport.timestamp).toLocaleString('fr-FR')}
            {lastExport.path && ` - Fichiers sauvegardés dans: ${lastExport.path}`}
          </AlertDescription>
        </Alert>
      )}

      {downloadMutation.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erreur lors du téléchargement: {downloadMutation.error.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}