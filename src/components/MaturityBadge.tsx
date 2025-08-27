import { Badge } from "@/components/ui/badge";
import { Award, Medal, Crown, Diamond } from "lucide-react";

interface MaturityBadgeProps {
  level: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

const maturityConfig = {
  bronze: {
    label: "Bronze",
    icon: Award,
    variant: "secondary" as const,
    gradient: "from-amber-600 to-amber-800",
    bgColor: "bg-amber-100",
    textColor: "text-amber-800",
    description: "Nível inicial - Fundamentos estabelecidos"
  },
  prata: {
    label: "Prata",
    icon: Medal,
    variant: "default" as const,
    gradient: "from-gray-400 to-gray-600",
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
    description: "Nível intermediário - Boas práticas implementadas"
  },
  ouro: {
    label: "Ouro",
    icon: Crown,
    variant: "secondary" as const,
    gradient: "from-yellow-400 to-yellow-600",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    description: "Nível avançado - Excelência operacional"
  },
  diamante: {
    label: "Diamante",
    icon: Diamond,
    variant: "default" as const,
    gradient: "from-blue-400 to-purple-600",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
    description: "Nível máximo - Referência em gestão"
  }
};

export const MaturityBadge = ({ 
  level, 
  size = "md", 
  showIcon = true, 
  className = "" 
}: MaturityBadgeProps) => {
  const config = maturityConfig[level as keyof typeof maturityConfig] || maturityConfig.bronze;
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  return (
    <Badge 
      variant={config.variant}
      className={`${sizeClasses[size]} ${config.bgColor} ${config.textColor} border-none font-semibold uppercase tracking-wide ${className}`}
    >
      {showIcon && <IconComponent className={`${iconSizes[size]} mr-1`} />}
      {config.label}
    </Badge>
  );
};

export const MaturityCard = ({ 
  level, 
  score, 
  className = "" 
}: { 
  level: string; 
  score?: number; 
  className?: string; 
}) => {
  const config = maturityConfig[level as keyof typeof maturityConfig] || maturityConfig.bronze;
  const IconComponent = config.icon;

  return (
    <div className={`bg-gradient-to-br ${config.gradient} p-6 rounded-xl text-white shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <IconComponent className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{config.label}</h3>
            <p className="text-white/80 text-sm">{config.description}</p>
          </div>
        </div>
        {score !== undefined && (
          <div className="text-right">
            <div className="text-2xl font-bold">{score.toFixed(1)}</div>
            <div className="text-white/80 text-sm">Pontuação</div>
          </div>
        )}
      </div>
    </div>
  );
};

export const getMaturityLevel = (score: number): string => {
  if (score >= 85) return 'diamante';
  if (score >= 70) return 'ouro';
  if (score >= 55) return 'prata';
  return 'bronze';
};

export const getMaturityDescription = (level: string): string => {
  const config = maturityConfig[level as keyof typeof maturityConfig];
  return config?.description || "Nível não identificado";
};