import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaturityBadge, MaturityCard, getMaturityDescription } from "@/components/MaturityBadge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Building2, 
  ArrowLeft,
  Download,
  Share2,
  TrendingUp,
  Target,
  FileText,
  CheckCircle,
  Calendar,
  BarChart3,
  Users,
  DollarSign,
  MessageSquare,
  Eye
} from "lucide-react";

interface DiagnosticData {
  id: string;
  title: string;
  status: string;
  overall_score: number;
  governance_score: number;
  finance_score: number;
  communication_score: number;
  impact_score: number;
  transparency_score: number;
  fundraising_score: number;
  maturity_level: string;
  swot_analysis?: any;
  action_plan?: any;
  ai_analysis_summary?: string;
  created_at: string;
  completed_at?: string;
  pdf_report_url?: string;
  organizations: {
    name: string;
    organization_type: string;
  };
}

const categoryConfig = {
  governance: { name: "Governança", icon: Building2, color: "text-blue-600" },
  finance: { name: "Finanças", icon: DollarSign, color: "text-green-600" },
  communication: { name: "Comunicação", icon: MessageSquare, color: "text-purple-600" },
  impact: { name: "Impacto", icon: Target, color: "text-red-600" },
  transparency: { name: "Transparência", icon: Eye, color: "text-orange-600" },
  fundraising: { name: "Captação", icon: Users, color: "text-indigo-600" }
};

const DiagnosticResults = () => {
  const { id } = useParams<{ id: string }>();
  const [diagnostic, setDiagnostic] = useState<DiagnosticData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadDiagnostic(id);
    }
  }, [id]);

  const loadDiagnostic = async (diagnosticId: string) => {
    try {
      const { data, error } = await supabase
        .from('diagnostics')
        .select(`
          *,
          organizations (name, organization_type)
        `)
        .eq('id', diagnosticId)
        .single();

      if (error) throw error;
      setDiagnostic(data);
    } catch (error: any) {
      console.error('Error loading diagnostic:', error);
      toast.error('Erro ao carregar diagnóstico');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (diagnostic?.pdf_report_url) {
      window.open(diagnostic.pdf_report_url, '_blank');
    } else {
      toast.error('Relatório PDF não disponível');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Diagnóstico - ${diagnostic?.organizations.name}`,
          text: `Confira os resultados do diagnóstico organizacional: ${diagnostic?.overall_score.toFixed(1)} pontos (${diagnostic?.maturity_level})`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado para a área de transferência');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando resultados...</p>
        </div>
      </div>
    );
  }

  if (!diagnostic) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Diagnóstico não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-primary">Resultados do Diagnóstico</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
            {diagnostic.pdf_report_url && (
              <Button variant="default" size="sm" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Baixar PDF
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Header Info */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">{diagnostic.organizations.name}</h2>
          <p className="text-muted-foreground mb-4">
            {diagnostic.title} • {new Date(diagnostic.created_at).toLocaleDateString('pt-BR')}
          </p>
          {diagnostic.completed_at && (
            <Badge variant="default" className="mb-4">
              <CheckCircle className="h-4 w-4 mr-2" />
              Concluído em {new Date(diagnostic.completed_at).toLocaleDateString('pt-BR')}
            </Badge>
          )}
        </div>

        {/* Overall Score */}
        <div className="max-w-4xl mx-auto mb-8">
          <MaturityCard 
            level={diagnostic.maturity_level} 
            score={diagnostic.overall_score}
            className="mb-4"
          />
          <p className="text-center text-muted-foreground">
            {getMaturityDescription(diagnostic.maturity_level)}
          </p>
        </div>

        <Tabs defaultValue="scores" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="scores">Pontuações</TabsTrigger>
            <TabsTrigger value="swot">Análise SWOT</TabsTrigger>
            <TabsTrigger value="actions">Plano de Ação</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Scores Tab */}
          <TabsContent value="scores" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Pontuação por Categoria
                </CardTitle>
                <CardDescription>
                  Veja como sua organização se desempenhou em cada área avaliada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(categoryConfig).map(([key, config]) => {
                    const score = diagnostic[`${key}_score` as keyof DiagnosticData] as number || 0;
                    const IconComponent = config.icon;
                    
                    return (
                      <div key={key} className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            <IconComponent className={`h-5 w-5 ${config.color}`} />
                          </div>
                          <div>
                            <h4 className="font-semibold">{config.name}</h4>
                            <div className="text-2xl font-bold text-primary">
                              {score.toFixed(1)}
                            </div>
                          </div>
                        </div>
                        <Progress value={score} className="h-2" />
                        <p className="text-sm text-muted-foreground">
                          {score >= 80 ? 'Excelente' : 
                           score >= 60 ? 'Bom' : 
                           score >= 40 ? 'Regular' : 'Precisa melhorar'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SWOT Tab */}
          <TabsContent value="swot" className="space-y-6">
            {diagnostic.swot_analysis ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <Card className="shadow-card border-green-200">
                  <CardHeader className="bg-green-50">
                    <CardTitle className="text-green-700">Forças</CardTitle>
                    <CardDescription>
                      Pontos fortes identificados na organização
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-2">
                      {diagnostic.swot_analysis.strengths?.map((item: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      )) || <li className="text-muted-foreground">Nenhuma força identificada</li>}
                    </ul>
                  </CardContent>
                </Card>

                {/* Weaknesses */}
                <Card className="shadow-card border-red-200">
                  <CardHeader className="bg-red-50">
                    <CardTitle className="text-red-700">Fraquezas</CardTitle>
                    <CardDescription>
                      Áreas que precisam de atenção e melhoria
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-2">
                      {diagnostic.swot_analysis.weaknesses?.map((item: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      )) || <li className="text-muted-foreground">Nenhuma fraqueza identificada</li>}
                    </ul>
                  </CardContent>
                </Card>

                {/* Opportunities */}
                <Card className="shadow-card border-blue-200">
                  <CardHeader className="bg-blue-50">
                    <CardTitle className="text-blue-700">Oportunidades</CardTitle>
                    <CardDescription>
                      Possibilidades de crescimento e desenvolvimento
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-2">
                      {diagnostic.swot_analysis.opportunities?.map((item: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      )) || <li className="text-muted-foreground">Nenhuma oportunidade identificada</li>}
                    </ul>
                  </CardContent>
                </Card>

                {/* Threats */}
                <Card className="shadow-card border-orange-200">
                  <CardHeader className="bg-orange-50">
                    <CardTitle className="text-orange-700">Ameaças</CardTitle>
                    <CardDescription>
                      Fatores externos que podem impactar a organização
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-2">
                      {diagnostic.swot_analysis.threats?.map((item: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      )) || <li className="text-muted-foreground">Nenhuma ameaça identificada</li>}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="shadow-card">
                <CardContent className="text-center py-12">
                  <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Análise SWOT não disponível</h3>
                  <p className="text-muted-foreground">
                    A análise será gerada quando o diagnóstico for processado pela IA
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-6">
            {diagnostic.action_plan?.actions ? (
              <div className="space-y-4">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Plano de Ação Personalizado
                    </CardTitle>
                    <CardDescription>
                      Ações práticas para melhorar os pontos identificados no diagnóstico
                    </CardDescription>
                  </CardHeader>
                </Card>
                
                {diagnostic.action_plan.actions.map((action: any, index: number) => (
                  <Card key={index} className="shadow-card">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{action.title}</CardTitle>
                          <CardDescription className="mt-2">
                            {action.description}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Badge 
                            variant={
                              action.priority === 'alta' ? 'destructive' :
                              action.priority === 'media' ? 'default' : 'secondary'
                            }
                            className="text-xs"
                          >
                            {action.priority?.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {action.deadline} dias
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Categoria: {categoryConfig[action.category as keyof typeof categoryConfig]?.name || action.category}</span>
                        <span>•</span>
                        <span>Prazo: {action.deadline} dias</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="shadow-card">
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Plano de ação não disponível</h3>
                  <p className="text-muted-foreground">
                    O plano será gerado quando o diagnóstico for processado pela IA
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Resumo da Análise
                </CardTitle>
                <CardDescription>
                  Insights e recomendações baseados na análise dos dados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {diagnostic.ai_analysis_summary ? (
                  <div className="prose max-w-none">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {diagnostic.ai_analysis_summary}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Resumo da análise não disponível
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Próximos Passos</CardTitle>
                <CardDescription>
                  Recomendações para continuar o desenvolvimento organizacional
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Explore a Biblioteca de Recursos</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Acesse modelos, guias e planilhas personalizados para suas necessidades
                      </p>
                      <Button variant="outline" size="sm" onClick={() => navigate('/resources')}>
                        Acessar Recursos
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Refaça o Diagnóstico Periodicamente</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Monitore sua evolução realizando novos diagnósticos a cada 6 meses
                      </p>
                      <Button variant="outline" size="sm" onClick={() => navigate('/diagnostic')}>
                        Novo Diagnóstico
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Share2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Compartilhe seus Resultados</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Use o selo de maturidade em seus materiais institucionais
                      </p>
                      <Button variant="outline" size="sm" onClick={handleShare}>
                        Compartilhar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DiagnosticResults;