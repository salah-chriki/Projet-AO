import { Badge } from "@/components/ui/badge";
import { DIVISIONS } from "@/lib/divisions";

interface DivisionBadgeProps {
  division: string;
  size?: "sm" | "md" | "lg";
}

export default function DivisionBadge({ 
  division, 
  size = "md"
}: DivisionBadgeProps) {
  const divisionInfo = DIVISIONS[division as keyof typeof DIVISIONS];
  
  if (!divisionInfo) {
    return (
      <Badge variant="outline" className={size === "sm" ? "text-xs px-2 py-0.5" : ""}>
        {division}
      </Badge>
    );
  }

  return (
    <Badge 
      variant="secondary" 
      className={`${size === "sm" ? "text-xs px-2 py-0.5" : ""} bg-blue-100 text-blue-800 border-blue-200`}
    >
      {division}
    </Badge>
  );
}