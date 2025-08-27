import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MaturityBadge } from "./MaturityBadge";
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  TrendingUp,
  BarChart3,
  Target
} from "lucide-react";

interface DiagnosticCardProps {
  diagnostic: {
    id: string;
    title: string;
    status: string;
    overall_score?: number;
    maturity_level?: string;
    created_at: string;
    completed_at?: string;
    pdf_report_url?: string;
  };
  onView?: (id: string) => void;
  onDownload?: (id: string) => void;
  showActions?: boolean;
}

const statusConfig = {
  em_andamento: {
    label: "Em Andamento",
    variant: "secondary" as const,
    color: "text-yellow-600"
  },
  concluido: {
    label: "Concluído",
    variant: "default" as const,
    color: "text-green-600"
  },
  cancelado: {
    label: "Cancelado",
    variant: "destructive" as const,
    color: "text-red-600"
  }
};

export const DiagnosticCard = ({ 
  diagnostic, 
  onView, 
  onDownload, 
  showActions = true 
}: DiagnosticCardProps) => {
  const statusInfo = statusConfig[diagnostic.status as keyof typeof statusConfig] || statusConfig.em_andamento;

  return (
    <Card className="shadow-card hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{diagnostic.title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Criado em {new Date(diagnostic.created_at).toLocaleDateString('pt-BR')}
              {diagnostic.completed_at && (
                <>
                  {" • Concluído em "}
                  {new Date(diagnostic.completed_at).toLocaleDateString('pt-BR')}
                </>
              )}
            </CardDescription>
          </div>
          <Badge variant={statusInfo.variant} className="ml-2">
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Metrics */}
          {diagnostic.status === 'concluido' && diagnostic.overall_score !== undefined && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-lg">
                    {diagnostic.overall_score.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Pontuação Geral
                  </div>
                </div>
              </div>
              
              {diagnostic.maturity_level && (
                <div className="flex items-center justify-center p-3 bg-muted/50 rounded-lg">
                  <MaturityBadge level={diagnostic.maturity_level} size="sm" />
                </div>
              )}
            </div>
          )}

          {/* Progress for ongoing diagnostics */}
          {diagnostic.status === 'em_andamento' && (
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <BarChart3 className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-yellow-800">
                  Diagnóstico em processo
                </div>
                <div className="text-sm text-yellow-600">
                  Continue onde parou para concluir
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView?.(diagnostic.id)}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                {diagnostic.status === 'concluido' ? 'Ver Resultados' : 'Continuar'}
              </Button>
              
              {diagnostic.status === 'concluido' && diagnostic.pdf_report_url && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onDownload?.(diagnostic.id)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const DiagnosticList = ({ 
  diagnostics, 
  onView, 
  onDownload,
  emptyMessage = "Nenhum diagnóstico encontrado"
}: {
  diagnostics: DiagnosticCardProps['diagnostic'][];
  onView?: (id: string) => void;
  onDownload?: (id: string) => void;
  emptyMessage?: string;
}) => {
  if (diagnostics.length === 0) {
    return (
      <Card className="shadow-card">
        <CardContent className="text-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {emptyMessage}
          </h3>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {diagnostics.map((diagnostic) => (
        <DiagnosticCard
          key={diagnostic.id}
          diagnostic={diagnostic}
          onView={onView}
          onDownload={onDownload}
        />
      ))}
    </div>
  );
};