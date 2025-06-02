import { ACTOR_ROLES } from "@/lib/constants";

interface ActorBadgeProps {
  role: keyof typeof ACTOR_ROLES;
  size?: "sm" | "md" | "lg";
}

export default function ActorBadge({ role, size = "md" }: ActorBadgeProps) {
  const actor = ACTOR_ROLES[role];
  
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-xs", 
    lg: "px-3 py-1 text-sm"
  };

  // Si l'acteur n'existe pas, afficher un badge par défaut
  if (!actor) {
    return (
      <span 
        className={`inline-flex items-center rounded-full font-medium text-white bg-gray-500 ${sizeClasses[size]}`}
      >
        {role || "N/A"}
      </span>
    );
  }

  return (
    <span 
      className={`inline-flex items-center rounded-full font-medium text-white ${sizeClasses[size]}`}
      style={{ backgroundColor: `#${actor.color}` }}
    >
      {actor.code}
    </span>
  );
}
