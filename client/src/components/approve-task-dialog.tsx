import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, Calendar } from "lucide-react";
import type { Tender } from "@shared/schema";

interface ApproveTaskDialogProps {
  tender: Tender;
  children?: React.ReactNode;
}

export default function ApproveTaskDialog({ tender, children }: ApproveTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState("");
  const [nextStepStartDate, setNextStepStartDate] = useState("");
  const [nextStepEndDate, setNextStepEndDate] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/tenders/${tender.id}/approve`, {
        method: "POST",
        body: JSON.stringify({
          comments,
          nextStepStartDate: nextStepStartDate || null,
          nextStepEndDate: nextStepEndDate || null,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to approve tender");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Appel d'offres approuvé",
        description: "L'appel d'offres a été approuvé avec succès et transmis à l'étape suivante.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tenders/my-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tenders"] });
      setOpen(false);
      setComments("");
      setNextStepStartDate("");
      setNextStepEndDate("");
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'approuver l'appel d'offres.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    approveMutation.mutate();
  };

  // Set default dates: start date = today, end date = 7 days from now
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-4 h-4 mr-1" />
            Approuver
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            Approuver l'appel d'offres
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-slate-700">
              Référence: {tender.reference}
            </Label>
            <p className="text-sm text-slate-600 mt-1">{tender.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="flex items-center text-sm font-medium">
                <Calendar className="w-4 h-4 mr-1" />
                Date début prochaine étape
              </Label>
              <Input
                id="startDate"
                type="date"
                value={nextStepStartDate || today}
                onChange={(e) => setNextStepStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="flex items-center text-sm font-medium">
                <Calendar className="w-4 h-4 mr-1" />
                Date finalisation prochaine étape
              </Label>
              <Input
                id="endDate"
                type="date"
                value={nextStepEndDate || nextWeek}
                onChange={(e) => setNextStepEndDate(e.target.value)}
                className="mt-1"
                min={nextStepStartDate || today}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="comments" className="text-sm font-medium">
              Commentaires (optionnel)
            </Label>
            <Textarea
              id="comments"
              placeholder="Ajoutez vos remarques ou observations..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700"
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? "Approbation..." : "Approuver"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}