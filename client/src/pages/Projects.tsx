import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, DollarSign, User, Building } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema, type Project } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const projectFormSchema = insertProjectSchema.extend({
  budget: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

const statusColors = {
  active: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  on_hold: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels = {
  active: "Actif",
  completed: "Terminé",
  on_hold: "En attente",
  cancelled: "Annulé",
};

const directions = [
  { value: "DAF", label: "Direction des Affaires Financières" },
  { value: "DPPAV", label: "Direction de la Planification et des Projets d'Aménagement et de Viabilisation" },
  { value: "DCPA", label: "Direction de la Culture et de la Promotion Artistique" },
  { value: "DIL", label: "Direction de l'Informatique et de la Logistique" },
  { value: "DERAJ", label: "Direction de l'Environnement et de la Régie Agricole et Jardins" },
  { value: "DCC", label: "Direction de la Communication et de la Coopération" },
  { value: "DCGAI", label: "Direction du Contrôle de Gestion et de l'Audit Interne" },
];

const divisions = [
  { value: "DSI", label: "Division des Systèmes d'Information" },
  { value: "DRHS", label: "Division des Ressources Humaines et Sociales" },
  { value: "DF", label: "Division Financière" },
  { value: "DCSP", label: "Division Culture, Sports et Patrimoine" },
  { value: "DSA", label: "Division des Services Administratifs" },
  { value: "DPV", label: "Division de la Planification et de la Viabilisation" },
];

export default function Projects() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const projectData = {
        ...data,
        budget: data.budget ? parseFloat(data.budget) : undefined,
      };
      return apiRequest("POST", "/api/projects", projectData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Projet créé",
        description: "Le projet a été créé avec succès.",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le projet.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "active",
      budget: "",
      direction: "",
      division: "",
      startDate: "",
      endDate: "",
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    createProjectMutation.mutate(data);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projets</h1>
          <p className="text-muted-foreground">
            Gérez vos projets et associez-les aux appels d'offres
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau projet
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Créer un nouveau projet</DialogTitle>
              <DialogDescription>
                Créez un nouveau projet qui pourra être associé aux appels d'offres.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du projet</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom du projet" {...field} />
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Description du projet"
                          className="resize-none"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="direction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Direction</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une direction" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {directions.map((direction) => (
                              <SelectItem key={direction.value} value={direction.value}>
                                {direction.label}
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
                        <FormLabel>Division</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une division" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {divisions.map((division) => (
                              <SelectItem key={division.value} value={division.value}>
                                {division.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget (optionnel)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || "active"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un statut" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Actif</SelectItem>
                          <SelectItem value="completed">Terminé</SelectItem>
                          <SelectItem value="on_hold">En attente</SelectItem>
                          <SelectItem value="cancelled">Annulé</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={createProjectMutation.isPending}>
                    {createProjectMutation.isPending ? "Création..." : "Créer le projet"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects?.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <Badge className={statusColors[project.status as keyof typeof statusColors]}>
                  {statusLabels[project.status as keyof typeof statusLabels]}
                </Badge>
              </div>
              {project.description && (
                <CardDescription className="line-clamp-2">
                  {project.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {project.direction && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Building className="mr-2 h-4 w-4" />
                    {directions.find(d => d.value === project.direction)?.label || project.direction}
                  </div>
                )}
                {project.budget && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <DollarSign className="mr-2 h-4 w-4" />
                    {parseFloat(project.budget).toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'MAD'
                    })}
                  </div>
                )}
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  Créé le {project.createdAt ? new Date(project.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue'}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects?.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto max-w-md">
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Aucun projet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par créer votre premier projet.
            </p>
            <div className="mt-6">
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau projet
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}