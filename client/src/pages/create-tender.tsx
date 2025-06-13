import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { DIRECTIONS, DIVISIONS, getDirectionFromDivision, getDivisionsForDirection } from "@/lib/directions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  X,
  Plus
} from "lucide-react";

const createTenderSchema = z.object({
  reference: z.string().min(1, "La référence est obligatoire"),
  title: z.string().min(1, "Le titre est obligatoire"),
  description: z.string().min(1, "La description est obligatoire"),
  amount: z.string().min(1, "Le montant est obligatoire"),
  projectId: z.string().optional(),
  direction: z.string().min(1, "La direction est obligatoire"),
  division: z.string().min(1, "La division est obligatoire"),
  deadline: z.string().min(1, "L'échéance est obligatoire"),
});

type CreateTenderFormData = z.infer<typeof createTenderSchema>;

interface DocumentFile {
  file: File;
  type: string;
}

export default function CreateTender() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<DocumentFile[]>([]);

  // Fetch projects for selection
  const { data: projects } = useQuery({
    queryKey: ["/api/projects"],
  });

  const form = useForm<CreateTenderFormData>({
    resolver: zodResolver(createTenderSchema),
    defaultValues: {
      reference: "",
      title: "",
      description: "",
      amount: "",
      direction: "",
      division: "",
      deadline: "",
    },
  });

  // Watch both division and direction changes for dynamic filtering
  const watchedDivision = form.watch("division");
  const watchedDirection = form.watch("direction");
  
  useEffect(() => {
    if (watchedDivision) {
      const autoDirection = getDirectionFromDivision(watchedDivision as any);
      form.setValue("direction", autoDirection);
    }
  }, [watchedDivision, form]);

  // Get filtered divisions based on selected direction
  const getFilteredDivisions = () => {
    if (!watchedDirection) return Object.entries(DIVISIONS);
    return Object.entries(DIVISIONS).filter(([code]) => {
      const divisionDirection = getDirectionFromDivision(code as keyof typeof DIVISIONS);
      return divisionDirection === watchedDirection;
    });
  };

  // Get filtered directions based on selected division
  const getFilteredDirections = () => {
    if (!watchedDivision) return Object.entries(DIRECTIONS);
    const divisionDirection = getDirectionFromDivision(watchedDivision as keyof typeof DIVISIONS);
    return Object.entries(DIRECTIONS).filter(([code]) => code === divisionDirection);
  };

  const createMutation = useMutation({
    mutationFn: async (data: CreateTenderFormData) => {
      const formData = new FormData();
      
      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      // Add documents
      documents.forEach((doc, index) => {
        formData.append('documents', doc.file);
        formData.append(`documentTypes[${index}]`, doc.type);
      });
      
      const response = await fetch('/api/tenders', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Appel d'offres créé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tenders/my-tasks"] });
      // Redirect to tasks
      window.location.href = "/";
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'appel d'offres",
        variant: "destructive",
      });
      console.error("Error creating tender:", error);
    },
  });

  const onSubmit = (data: CreateTenderFormData) => {
    createMutation.mutate(data);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newDocuments = Array.from(files).map(file => ({
        file,
        type: 'DAO' // Default type
      }));
      setDocuments(prev => [...prev, ...newDocuments]);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const updateDocumentType = (index: number, type: string) => {
    setDocuments(prev => prev.map((doc, i) => i === index ? { ...doc, type } : doc));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const documentTypes = [
    { value: 'DAO', label: 'Dossier d\'Appel d\'Offres' },
    { value: 'plans', label: 'Plans techniques' },
    { value: 'specifications', label: 'Spécifications' },
    { value: 'cahier_charges', label: 'Cahier des charges' },
    { value: 'budget', label: 'Budget prévisionnel' },
    { value: 'other', label: 'Autre document' }
  ];

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = "/"}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux tâches
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Créer un nouvel appel d'offres
              </h2>
              <p className="text-slate-600 mt-1">Élaboration du Dossier d'Appel d'Offres (DAO)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="reference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Référence *</FormLabel>
                        <FormControl>
                          <Input placeholder="AO-2024-XXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Montant estimé (€) *</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="150000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre de l'appel d'offres *</FormLabel>
                      <FormControl>
                        <Input placeholder="Travaux de réhabilitation..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description détaillée *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Description complète des travaux, prestations ou fournitures..."
                          rows={5}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Projet associé (optionnel)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un projet" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Aucun projet</SelectItem>
                          {projects?.map((project: any) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="direction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Direction *</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Clear division when direction changes
                            form.setValue("division", "");
                          }} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une direction" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(DIRECTIONS).map(([code, info]) => (
                              <SelectItem key={code} value={code}>
                                {info.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="division"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Division *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={!watchedDirection}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={watchedDirection ? "Sélectionner une division" : "Choisir d'abord une direction"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getFilteredDivisions().map(([code, info]) => (
                              <SelectItem key={code} value={code}>
                                {info.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Échéance initiale *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Documents attachés
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-slate-400" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-slate-900">
                        Cliquez pour ajouter des documents
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        PDF, DOC, DOCX, XLS, XLSX (max 10MB par fichier)
                      </span>
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Document List */}
                {documents.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-slate-900">Documents sélectionnés :</h4>
                    {documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-slate-500" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">{doc.file.name}</p>
                            <p className="text-xs text-slate-500">{formatFileSize(doc.file.size)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Select 
                            value={doc.type} 
                            onValueChange={(value) => updateDocumentType(index, value)}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {documentTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeDocument(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.href = "/"}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createMutation.isPending ? "Création en cours..." : "Créer l'appel d'offres"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}