import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Building2, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle,
  FileText,
  Users,
  DollarSign,
  MessageSquare,
  Target,
  Eye
} from "lucide-react";

interface Question {
  key: string;
  text: string;
  weight: number;
}

interface Category {
  id: string;
  name: string;
  icon: any;
  description: string;
  questions: Question[];
}

const categories: Category[] = [
  {
    id: "governance",
    name: "Governança",
    icon: Building2,
    description: "Estrutura organizacional, estatuto e gestão",
    questions: [
      { key: "governance_statute", text: "A organização possui estatuto atualizado e registrado?", weight: 1.5 },
      { key: "governance_board", text: "Existe um conselho administrativo ativo e participativo?", weight: 1.3 },
      { key: "governance_meetings", text: "São realizadas reuniões periódicas com atas documentadas?", weight: 1.0 },
      { key: "governance_policies", text: "A organização possui políticas internas claras?", weight: 1.2 },
      { key: "governance_compliance", text: "Há cumprimento das obrigações legais e regulamentares?", weight: 1.4 }
    ]
  },
  {
    id: "finance",
    name: "Finanças",
    icon: DollarSign,
    description: "Gestão financeira, captação e prestação de contas",
    questions: [
      { key: "finance_accounting", text: "A organização mantém contabilidade formal atualizada?", weight: 1.5 },
      { key: "finance_budget", text: "Existe planejamento orçamentário anual?", weight: 1.3 },
      { key: "finance_controls", text: "Há controles internos para movimentação financeira?", weight: 1.4 },
      { key: "finance_fundraising", text: "A organização possui estratégias de captação de recursos?", weight: 1.2 },
      { key: "finance_reporting", text: "São produzidos relatórios financeiros periódicos?", weight: 1.3 }
    ]
  },
  {
    id: "communication",
    name: "Comunicação",
    icon: MessageSquare,
    description: "Comunicação externa, marketing e relacionamento",
    questions: [
      { key: "communication_website", text: "A organização possui site ou página oficial atualizada?", weight: 1.2 },
      { key: "communication_social", text: "Há presença ativa nas redes sociais?", weight: 1.0 },
      { key: "communication_materials", text: "Existem materiais de comunicação profissionais?", weight: 1.1 },
      { key: "communication_strategy", text: "A organização possui estratégia de comunicação definida?", weight: 1.3 },
      { key: "communication_stakeholders", text: "Há comunicação regular com stakeholders?", weight: 1.2 }
    ]
  },
  {
    id: "impact",
    name: "Impacto",
    icon: Target,
    description: "Medição de resultados e impacto social",
    questions: [
      { key: "impact_mission", text: "A missão e objetivos estão claramente definidos?", weight: 1.4 },
      { key: "impact_indicators", text: "Existem indicadores para medir o impacto?", weight: 1.3 },
      { key: "impact_monitoring", text: "Há monitoramento regular das atividades?", weight: 1.2 },
      { key: "impact_beneficiaries", text: "O perfil dos beneficiários é bem definido?", weight: 1.1 },
      { key: "impact_evaluation", text: "São realizadas avaliações de impacto?", weight: 1.5 }
    ]
  },
  {
    id: "transparency",
    name: "Transparência",
    icon: Eye,
    description: "Prestação de contas e transparência das ações",
    questions: [
      { key: "transparency_reports", text: "A organização publica relatórios de atividades?", weight: 1.3 },
      { key: "transparency_financial", text: "As informações financeiras são transparentes?", weight: 1.4 },
      { key: "transparency_governance", text: "A estrutura de governança é pública?", weight: 1.2 },
      { key: "transparency_projects", text: "Os projetos e resultados são divulgados?", weight: 1.1 },
      { key: "transparency_stakeholders", text: "Há canais para feedback dos stakeholders?", weight: 1.2 }
    ]
  },
  {
    id: "fundraising",
    name: "Captação de Recursos",
    icon: Users,
    description: "Estratégias e processos de captação",
    questions: [
      { key: "fundraising_strategy", text: "Existe uma estratégia estruturada de captação?", weight: 1.4 },
      { key: "fundraising_diversification", text: "As fontes de recursos são diversificadas?", weight: 1.3 },
      { key: "fundraising_projects", text: "Há elaboração profissional de projetos?", weight: 1.2 },
      { key: "fundraising_relationships", text: "Existe relacionamento com doadores/financiadores?", weight: 1.3 },
      { key: "fundraising_sustainability", text: "A captação garante sustentabilidade financeira?", weight: 1.5 }
    ]
  }
];

const Diagnostic = () => {
  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [currentCategory, setCurrentCategory] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [diagnosticId, setDiagnosticId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      
      // Load organization
      const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('email', session.user.email!)
        .maybeSingle();
      
      if (!orgData) {
        navigate("/setup");
        return;
      }
      setOrganization(orgData);
    };

    checkAuth();
  }, [navigate]);

  const progress = ((currentCategory + 1) / categories.length) * 100;
  const currentCategoryData = categories[currentCategory];

  const handleResponse = (questionKey: string, value: number) => {
    setResponses(prev => ({
      ...prev,
      [questionKey]: value
    }));
  };

  const canProceed = () => {
    return currentCategoryData.questions.every(q => 
      responses[q.key] !== undefined
    );
  };

  const nextCategory = () => {
    if (currentCategory < categories.length - 1) {
      setCurrentCategory(prev => prev + 1);
    }
  };

  const previousCategory = () => {
    if (currentCategory > 0) {
      setCurrentCategory(prev => prev - 1);
    }
  };

  const submitDiagnostic = async () => {
    if (!organization || !user) return;

    setIsSubmitting(true);
    try {
      // Create diagnostic
      const { data: diagnostic, error: diagnosticError } = await supabase
        .from('diagnostics')
        .insert({
          organization_id: organization.id,
          title: `Diagnóstico ${new Date().toLocaleDateString('pt-BR')}`,
          status: 'em_andamento'
        })
        .select()
        .single();

      if (diagnosticError) throw diagnosticError;
      setDiagnosticId(diagnostic.id);

      // Save responses
      const diagnosticResponses = [];
      for (const category of categories) {
        for (const question of category.questions) {
          if (responses[question.key] !== undefined) {
            diagnosticResponses.push({
              diagnostic_id: diagnostic.id,
              category: category.id,
              question_key: question.key,
              question_text: question.text,
              answer_value: responses[question.key],
              weight: question.weight
            });
          }
        }
      }

      const { error: responsesError } = await supabase
        .from('diagnostic_responses')
        .insert(diagnosticResponses);

      if (responsesError) throw responsesError;

      // Process with AI
      const { data: aiResult, error: aiError } = await supabase.functions.invoke('process-diagnostic', {
        body: { diagnosticId: diagnostic.id }
      });

      if (aiError) {
        console.error('AI processing error:', aiError);
        toast.error('Erro no processamento da IA, mas diagnóstico foi salvo');
      } else {
        toast.success('Diagnóstico processado com sucesso!');
      }

      navigate('/dashboard');

    } catch (error: any) {
      console.error('Error submitting diagnostic:', error);
      toast.error('Erro ao enviar diagnóstico');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || !organization) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando...</p>
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
              <Building2 className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-primary">Diagnóstico Organizacional</h1>
            </div>
          </div>
          <Badge variant="secondary">{organization.name}</Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">
              {currentCategory + 1} de {categories.length} categorias
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% concluído
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Current Category */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-card">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <currentCategoryData.icon className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">{currentCategoryData.name}</CardTitle>
              <CardDescription className="text-base">
                {currentCategoryData.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentCategoryData.questions.map((question, index) => (
                <div key={question.key} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">
                      {index + 1}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-medium mb-3">{question.text}</p>
                      <RadioGroup
                        value={responses[question.key]?.toString() || ""}
                        onValueChange={(value) => handleResponse(question.key, parseInt(value))}
                        className="grid grid-cols-1 sm:grid-cols-5 gap-2"
                      >
                        {[
                          { value: "1", label: "Não" },
                          { value: "2", label: "Parcialmente" },
                          { value: "3", label: "Em parte" },
                          { value: "4", label: "Quase sempre" },
                          { value: "5", label: "Sim" }
                        ].map((option) => (
                          <div key={option.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <RadioGroupItem value={option.value} id={`${question.key}-${option.value}`} />
                            <Label 
                              htmlFor={`${question.key}-${option.value}`}
                              className="flex-1 cursor-pointer text-sm"
                            >
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={previousCategory}
              disabled={currentCategory === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            <div className="flex items-center gap-2">
              {categories.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index < currentCategory
                      ? "bg-primary"
                      : index === currentCategory
                      ? "bg-primary/60"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {currentCategory === categories.length - 1 ? (
              <Button
                onClick={submitDiagnostic}
                disabled={!canProceed() || isSubmitting}
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Finalizar Diagnóstico
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={nextCategory}
                disabled={!canProceed()}
              >
                Próxima
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diagnostic;