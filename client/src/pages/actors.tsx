import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import CreateActorDialog from "@/components/create-actor-dialog";
import ActorBadge from "@/components/actor-badge";
import { ACTOR_ROLES } from "@/lib/constants";

export default function Actors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("DELETE", `/api/users/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Utilisateur supprimé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-96 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  const filteredUsers = (users || []).filter((user: any) => {
    const matchesSearch = 
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleStats = () => {
    const stats: Record<string, number> = {};
    Object.keys(ACTOR_ROLES).forEach(role => stats[role] = 0);
    
    users?.forEach((user: any) => {
      if (stats[user.role] !== undefined) {
        stats[user.role]++;
      }
    });
    
    return stats;
  };

  const roleStats = getRoleStats();

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const formatLastLogin = (date: Date | null) => {
    if (!date) return "Jamais";
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Gestion des acteurs</h2>
            <p className="text-slate-600 mt-1">Créer, modifier et gérer les utilisateurs du système</p>
          </div>
          <CreateActorDialog />
        </div>
      </div>

      <div className="p-6">
        {/* Actor Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {Object.entries(ACTOR_ROLES).map(([key, role]) => (
            <Card key={key}>
              <CardContent className="p-4 text-center">
                <div 
                  className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center"
                  style={{ backgroundColor: `#${role.color}` }}
                >
                  <span className="text-white text-sm font-bold">{role.code}</span>
                </div>
                <p className="text-sm font-medium text-slate-900">{roleStats[key] || 0}</p>
                <p className="text-xs text-slate-500">{role.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actors Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Liste des acteurs</CardTitle>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Rechercher un acteur..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64"
                  />
                  <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Tous les rôles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les rôles</SelectItem>
                    {Object.entries(ACTOR_ROLES).map(([key, role]) => (
                      <SelectItem key={key} value={key}>
                        {role.code} - {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Dernière connexion</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user: any) => {
                  const role = ACTOR_ROLES[user.role as keyof typeof ACTOR_ROLES];
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                            style={{ backgroundColor: `#${role.color}` }}
                          >
                            <span className="text-white text-sm font-bold">
                              {getInitials(user.firstName, user.lastName)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-slate-500">
                              {user.isAdmin ? "Administrateur" : role.name}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <ActorBadge role={user.role as keyof typeof ACTOR_ROLES} />
                      </TableCell>
                      <TableCell>
                        <div className="text-slate-900">{user.email || "N/A"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-slate-900">{formatLastLogin(user.updatedAt)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => deleteUserMutation.mutate(user.id)}
                            disabled={deleteUserMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-500">Aucun acteur trouvé</p>
                <p className="text-sm text-slate-400 mt-2">
                  {searchQuery || roleFilter !== "all" 
                    ? "Essayez de modifier vos critères de recherche"
                    : "Commencez par créer un nouvel acteur"
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
