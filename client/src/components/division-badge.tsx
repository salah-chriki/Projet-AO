import { Badge } from "@/components/ui/badge";
import { DIVISIONS } from "@/lib/divisions";

interface DivisionBadgeProps {
  division: string;
  department?: string;
  size?: "sm" | "md" | "lg";
  showDepartment?: boolean;
}

export default function DivisionBadge({ 
  division, 
  department, 
  size = "md", 
  showDepartment = true 
}: DivisionBadgeProps) {
  const divisionInfo = DIVISIONS[division as keyof typeof DIVISIONS];
  
  if (!divisionInfo) {
    return (
      <Badge variant="outline" className={size === "sm" ? "text-xs px-2 py-0.5" : ""}>
        {division}
      </Badge>
    );
  }

  const departmentInfo = department && divisionInfo.departments[department];

  return (
    <div className="flex flex-col gap-1">
      <Badge 
        variant="secondary" 
        className={`${size === "sm" ? "text-xs px-2 py-0.5" : ""} bg-blue-100 text-blue-800 border-blue-200`}
      >
        {division}
      </Badge>
      {showDepartment && department && (
        <Badge 
          variant="outline" 
          className={`${size === "sm" ? "text-xs px-2 py-0.5" : ""} text-slate-600`}
        >
          {department}
        </Badge>
      )}
    </div>
  );
}