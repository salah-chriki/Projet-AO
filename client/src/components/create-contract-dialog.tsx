import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

const createContractSchema = z.object({
  tenderId: z.string().min(1, "L'appel d'offre est requis"),
  contractorName: z.string().min(1, "Le nom du prestataire est requis"),
  amount: z.string().min(1, "Le montant est requis"),
  dateSigned: z.string().optional(),
  status: z.string().default("active"),
});

type CreateContractFormData = z.infer<typeof createContractSchema>;

interface CreateContractDialogProps {
  children?: React.ReactNode;
}

export default function CreateContractDialog({ children }: CreateContractDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateContractFormData>({
    tenderId: "",
    contractorName: "",
    amount: "",
    dateSigned: "",
    status: "active",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tenders = [] } = useQuery({
    queryKey: ["/api/tenders"],
  });

  const createContractMutation = useMutation({
    mutationFn: async (data: CreateContractFormData) => {
      return await apiRequest("/api/contracts", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      toast({
        title: "Contrat créé",
        description: "Le contrat a été créé avec succès.",
      });
      setOpen(false);
      setFormData({
        tenderId: "",
        contractorName: "",
        amount: "",
        dateSigned: "",
        status: "active",
      });
      setErrors({});
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du contrat.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = createContractSchema.parse(formData);
      setErrors({});
      createContractMutation.mutate(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  const handleInputChange = (field: keyof CreateContractFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Créer un nouveau contrat</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tenderId">Appel d'offre *</Label>
            <Select
              value={formData.tenderId}
              onValueChange={(value) => handleInputChange("tenderId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un appel d'offre" />
              </SelectTrigger>
              <SelectContent>
                {tenders.map((tender: any) => (
                  <SelectItem key={tender.id} value={tender.id}>
                    {tender.reference} - {tender.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.tenderId && <p className="text-sm text-red-600">{errors.tenderId}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contractorName">Nom du prestataire *</Label>
            <Input
              id="contractorName"
              value={formData.contractorName}
              onChange={(e) => handleInputChange("contractorName", e.target.value)}
              placeholder="Nom de l'entreprise"
            />
            {errors.contractorName && <p className="text-sm text-red-600">{errors.contractorName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Montant (€) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              placeholder="0.00"
            />
            {errors.amount && <p className="text-sm text-red-600">{errors.amount}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateSigned">Date de signature</Label>
            <Input
              id="dateSigned"
              type="date"
              value={formData.dateSigned}
              onChange={(e) => handleInputChange("dateSigned", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="terminated">Résilié</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={createContractMutation.isPending}
            >
              {createContractMutation.isPending ? "Création..." : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}