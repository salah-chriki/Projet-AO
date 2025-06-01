import { PHASES } from "@/lib/constants";

interface PhaseBadgeProps {
  phase: 1 | 2 | 3;
  size?: "sm" | "md" | "lg";
}

export default function PhaseBadge({ phase, size = "md" }: PhaseBadgeProps) {
  const phaseInfo = PHASES[phase];
  
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm"
  };

  return (
    <span 
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]}`}
      style={{ 
        backgroundColor: `#${phaseInfo.bgColor}`, 
        color: `#${phaseInfo.textColor}` 
      }}
    >
      {phaseInfo.name}
    </span>
  );
}
