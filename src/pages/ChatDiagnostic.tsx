import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Building2, 
  ArrowLeft, 
  Send,
  Bot,
  User,
  CheckCircle,
  MessageCircle
} from "lucide-react";

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  options?: string[];
  questionKey?: string;
  moduleId?: string;
}

interface DialogicsModule {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
  questions: DialogicsQuestion[];
}

interface DialogicsQuestion {
  key: string;
  text: string;
  type: 'text' | 'select' | 'multiselect' | 'number';
  options?: string[];
  weight: number;
  followUp?: string;
}

const modules: DialogicsModule[] = [
  {
    id: "identificacao",
    name: "Identificação Básica",
    description: "Vamos conhecer sua organização",
    maxPoints: 7,
    questions: [
      {
        key: "org_name",
        text: "Qual é o nome completo da sua organização?",
        type: "text",
        weight: 1,
      },
      {
        key: "org_mission",
        text: "Em poucas palavras, qual é a missão ou propósito da organização?",
        type: "text",
        weight: 1,
      },
      {
        key: "org_segment",
        text: "Em quais segmentos sua organização atua?",
        type: "multiselect",
        options: ["Saúde", "Educação", "Cultura", "Meio ambiente", "Direitos", "Esporte", "Assistência social", "Outro"],
        weight: 2,
      },
      {
        key: "org_digital_presence",
        text: "Sua organização tem presença digital?",
        type: "select",
        options: ["Sim, site e redes sociais", "Apenas redes sociais", "Apenas site", "Não tem presença digital"],
        weight: 2,
      },
      {
        key: "org_legal_representative",
        text: "Você é o representante legal da organização?",
        type: "select",
        options: ["Sim", "Não, sou colaborador", "Não, sou voluntário", "Não, sou conselheiro"],
        weight: 1,
      }
    ]
  },
  {
    id: "legal",
    name: "Legal & Regulatória",
    description: "Situação jurídica e conformidade",
    maxPoints: 35,
    questions: [
      {
        key: "legal_cnpj",
        text: "A organização possui CNPJ ativo?",
        type: "select",
        options: ["Sim", "Não"],
        weight: 5,
      },
      {
        key: "legal_statute",
        text: "A organização possui estatuto social?",
        type: "select",
        options: ["Sim, atualizado", "Sim, mas desatualizado", "Não possui"],
        weight: 5,
      },
      {
        key: "legal_certificates",
        text: "A OSC mantém todas as licenças e certidões necessárias em dia?",
        type: "select",
        options: ["Sim", "Parcialmente", "Não"],
        weight: 5,
      },
      {
        key: "legal_fiscal_situation",
        text: "Como está a situação fiscal e tributária?",
        type: "select",
        options: ["Regular, sem pendências", "Parcialmente regular", "Com pendências relevantes"],
        weight: 5,
      },
      {
        key: "legal_transparency",
        text: "A organização publica relatórios?",
        type: "select",
        options: ["Sim, financeiros e de atividades", "Apenas financeiros", "Apenas de atividades", "Não publica"],
        weight: 4,
      },
      {
        key: "legal_lgpd",
        text: "A organização atende à LGPD no tratamento de dados?",
        type: "select",
        options: ["Sim, plenamente", "Parcialmente", "Não"],
        weight: 4,
      },
      {
        key: "legal_juridical_security",
        text: "Como a OSC garante sua segurança jurídica?",
        type: "select",
        options: ["Advogado permanente", "Consultas preventivas", "Atua apenas reativamente", "Não possui suporte jurídico"],
        weight: 3,
      },
      {
        key: "legal_accounting_security",
        text: "Como a OSC garante sua segurança contábil e fiscal?",
        type: "select",
        options: ["Contador/assessoria permanente", "Consultas preventivas", "Atua apenas reativamente", "Não possui suporte"],
        weight: 4,
      }
    ]
  },
  {
    id: "modelo_negocio",
    name: "Modelo de Negócio & Impacto",
    description: "Atividades e impacto social",
    maxPoints: 21,
    questions: [
      {
        key: "business_activities",
        text: "Quais são as principais atividades realizadas pela OSC?",
        type: "text",
        weight: 3,
      },
      {
        key: "business_direct_impact",
        text: "Aproximadamente quantas pessoas são impactadas diretamente?",
        type: "number",
        weight: 3,
      },
      {
        key: "business_beneficiaries",
        text: "Qual o perfil dos beneficiários atendidos?",
        type: "multiselect",
        options: ["Crianças/adolescentes", "Jovens", "Adultos", "Idosos", "Mulheres", "Pessoas com deficiência", "Comunidades tradicionais", "Outro"],
        weight: 2,
      },
      {
        key: "business_problems",
        text: "Quais os principais problemas que a OSC busca resolver?",
        type: "text",
        weight: 3,
      },
      {
        key: "business_stakeholders",
        text: "Com quais públicos a OSC se relaciona?",
        type: "multiselect",
        options: ["Beneficiários", "Doadores PF", "Doadores PJ", "Setor público", "Investidores", "Imprensa", "Voluntários", "Parceiros OSC"],
        weight: 2,
      },
      {
        key: "business_partnerships",
        text: "A OSC possui parcerias com:",
        type: "multiselect",
        options: ["Setor Público", "Setor Privado", "Outras OSCs", "Não possui"],
        weight: 4,
      },
      {
        key: "business_social_benefits",
        text: "Benefícios oferecidos à sociedade em geral:",
        type: "multiselect",
        options: ["Redução de desigualdades", "Inovação social", "Proteção ambiental", "Direitos garantidos", "Equilíbrio socioeconômico", "Outro"],
        weight: 4,
      }
    ]
  },
  {
    id: "gestao_governanca",
    name: "Gestão & Governança",
    description: "Planejamento e estrutura organizacional",
    maxPoints: 35,
    questions: [
      {
        key: "governance_strategic_planning",
        text: "A OSC realiza planejamento estratégico?",
        type: "select",
        options: ["Sim, todos conhecem", "Sim, mas parcialmente divulgado", "Sim, mas pouco conhecido", "Não realiza"],
        weight: 6,
      },
      {
        key: "governance_planning_construction",
        text: "Como o planejamento é construído?",
        type: "select",
        options: ["Apenas pelas lideranças", "De forma coletiva, com colaboradores/voluntários"],
        weight: 4,
      },
      {
        key: "governance_mission_vision",
        text: "A OSC possui missão, visão e valores definidos?",
        type: "select",
        options: ["Sim, todos conhecem", "Sim, mas parcialmente divulgados", "Sim, mas não conhecidos", "Não possui"],
        weight: 5,
      },
      {
        key: "governance_leadership",
        text: "Como você descreveria a liderança da OSC?",
        type: "multiselect",
        options: ["Participativa", "Autoritária", "Democrática", "Técnica", "Carismática", "Outro"],
        weight: 4,
      },
      {
        key: "governance_culture",
        text: "Como você descreveria a cultura organizacional?",
        type: "multiselect",
        options: ["Inovadora", "Colaborativa", "Conservadora", "Ágil", "Assistencialista", "De diversidade e equidade", "Outro"],
        weight: 4,
      },
      {
        key: "governance_team_participation",
        text: "A equipe participa da criação de soluções?",
        type: "select",
        options: ["Sempre", "Frequentemente", "Raramente", "Nunca"],
        weight: 3,
      },
      {
        key: "governance_decision_communication",
        text: "Como as decisões são compartilhadas com a equipe?",
        type: "multiselect",
        options: ["Reuniões", "Comunicados digitais", "Relatórios impressos", "Não são compartilhadas", "Outro"],
        weight: 3,
      },
      {
        key: "governance_processes",
        text: "A OSC possui processos internos documentados?",
        type: "select",
        options: ["Sim, todos documentados", "Parcialmente documentados", "Poucos documentados", "Não possui"],
        weight: 6,
      }
    ]
  },
  {
    id: "sustentabilidade",
    name: "Sustentabilidade Financeira & Comunicação",
    description: "Recursos financeiros e comunicação",
    maxPoints: 14,
    questions: [
      {
        key: "sustainability_funding_sources",
        text: "Quais são as principais fontes de recursos da OSC?",
        type: "multiselect",
        options: ["Doações individuais", "Editais públicos", "Editais privados", "Venda de produtos/serviços", "Eventos", "Parcerias", "Outro"],
        weight: 4,
      },
      {
        key: "sustainability_financial_planning",
        text: "A OSC realiza planejamento financeiro?",
        type: "select",
        options: ["Sim, anual detalhado", "Sim, básico", "Parcialmente", "Não realiza"],
        weight: 3,
      },
      {
        key: "sustainability_communication_strategy",
        text: "A organização possui estratégia de comunicação definida?",
        type: "select",
        options: ["Sim, formal e estruturada", "Sim, informal", "Parcialmente", "Não possui"],
        weight: 3,
      },
      {
        key: "sustainability_social_media",
        text: "Como está a presença da OSC nas redes sociais?",
        type: "select",
        options: ["Muito ativa e engajada", "Ativa regularmente", "Pouco ativa", "Não tem presença"],
        weight: 2,
      },
      {
        key: "sustainability_stakeholder_communication",
        text: "Há comunicação regular com stakeholders?",
        type: "select",
        options: ["Sim, sistemática", "Sim, eventual", "Raramente", "Não há"],
        weight: 2,
      }
    ]
  },
  {
    id: "performance",
    name: "Performance & Monitoramento",
    description: "Medição de resultados e monitoramento",
    maxPoints: 14,
    questions: [
      {
        key: "performance_indicators",
        text: "Existem indicadores para medir o impacto?",
        type: "select",
        options: ["Sim, bem definidos", "Sim, básicos", "Poucos indicadores", "Não existem"],
        weight: 4,
      },
      {
        key: "performance_monitoring",
        text: "Há monitoramento regular das atividades?",
        type: "select",
        options: ["Sim, sistemático", "Sim, eventual", "Raramente", "Não há"],
        weight: 3,
      },
      {
        key: "performance_evaluation",
        text: "São realizadas avaliações de impacto?",
        type: "select",
        options: ["Sim, regularmente", "Sim, eventualmente", "Raramente", "Nunca"],
        weight: 4,
      },
      {
        key: "performance_beneficiary_feedback",
        text: "A OSC coleta feedback dos beneficiários?",
        type: "select",
        options: ["Sim, sistematicamente", "Sim, eventualmente", "Raramente", "Não coleta"],
        weight: 3,
      }
    ]
  },
  {
    id: "futuro",
    name: "Futuro & Escalabilidade",
    description: "Inovação e crescimento sustentável",
    maxPoints: 14,
    questions: [
      {
        key: "future_innovation",
        text: "A OSC desenvolve projetos inovadores?",
        type: "select",
        options: ["Sim, constantemente", "Sim, eventualmente", "Raramente", "Não desenvolve"],
        weight: 4,
      },
      {
        key: "future_scalability",
        text: "A OSC tem capacidade de expandir suas atividades?",
        type: "select",
        options: ["Sim, alta capacidade", "Sim, média capacidade", "Baixa capacidade", "Não tem capacidade"],
        weight: 4,
      },
      {
        key: "future_sustainability_plan",
        text: "Existe um plano de sustentabilidade de longo prazo?",
        type: "select",
        options: ["Sim, bem estruturado", "Sim, básico", "Em desenvolvimento", "Não existe"],
        weight: 3,
      },
      {
        key: "future_partnerships_growth",
        text: "A OSC busca ativamente novas parcerias?",
        type: "select",
        options: ["Sim, constantemente", "Sim, eventualmente", "Raramente", "Não busca"],
        weight: 3,
      }
    ]
  }
];

const ChatDiagnostic = () => {
  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [currentModule, setCurrentModule] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
      
      // Initialize chat
      initializeChat();
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeChat = () => {
    const welcomeMessage: Message = {
      id: "welcome",
      type: "bot", 
      content: "Olá! Eu sou a IA da Cuidatoria, sua consultora especializada em organizações da sociedade civil. 🌟\n\nVou te ajudar a fazer um diagnóstico completo da maturidade organizacional da sua OSC. Será uma conversa bem tranquila, dividida em 7 módulos. Vamos começar?",
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    
    setTimeout(() => {
      askNextQuestion();
    }, 2000);
  };

  const askNextQuestion = () => {
    if (currentModule >= modules.length) {
      completeChat();
      return;
    }

    const module = modules[currentModule];
    const question = module.questions[currentQuestionIndex];

    if (!question) {
      // Move to next module
      setCurrentModule(prev => prev + 1);
      setCurrentQuestionIndex(0);
      setTimeout(() => {
        askNextQuestion();
      }, 1000);
      return;
    }

    // Module introduction message
    if (currentQuestionIndex === 0) {
      const moduleIntroMessage: Message = {
        id: `module-${currentModule}`,
        type: "bot",
        content: `📋 **${module.name}**\n\n${module.description}\n\nVamos começar!`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, moduleIntroMessage]);
      
      setTimeout(() => {
        askCurrentQuestion();
      }, 1500);
    } else {
      askCurrentQuestion();
    }
  };

  const askCurrentQuestion = () => {
    const module = modules[currentModule];
    const question = module.questions[currentQuestionIndex];

    if (!question) return;

    const questionMessage: Message = {
      id: `question-${currentModule}-${currentQuestionIndex}`,
      type: "bot",
      content: question.text,
      timestamp: new Date(),
      options: question.type === 'select' || question.type === 'multiselect' ? question.options : undefined,
      questionKey: question.key,
      moduleId: module.id
    };

    setMessages(prev => [...prev, questionMessage]);
    setIsWaitingForResponse(true);
  };

  const handleOptionClick = (option: string, questionKey: string) => {
    const userMessage: Message = {
      id: `response-${Date.now()}`,
      type: "user",
      content: option,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    saveResponse(questionKey, option);
    processNextQuestion();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() || !isWaitingForResponse) return;

    const lastBotMessage = [...messages].reverse().find(m => m.type === 'bot' && m.questionKey);
    if (!lastBotMessage?.questionKey) return;

    const userMessage: Message = {
      id: `response-${Date.now()}`,
      type: "user",
      content: currentInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    saveResponse(lastBotMessage.questionKey, currentInput);
    setCurrentInput("");
    processNextQuestion();
  };

  const saveResponse = (questionKey: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionKey]: value
    }));
  };

  const processNextQuestion = () => {
    setIsWaitingForResponse(false);
    setCurrentQuestionIndex(prev => prev + 1);
    
    setTimeout(() => {
      askNextQuestion();
    }, 1000);
  };

  const completeChat = () => {
    const completionMessage: Message = {
      id: "completion",
      type: "bot",
      content: "🎉 **Parabéns!** Você completou todo o diagnóstico!\n\nAgora vou processar suas respostas e gerar um relatório completo com sua classificação de maturidade organizacional, pontos fortes, áreas de melhoria e recomendações personalizadas.\n\nIsso pode levar alguns minutos. Vou te avisar quando estiver pronto!",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, completionMessage]);
    setIsCompleted(true);
    
    setTimeout(() => {
      submitDiagnostic();
    }, 2000);
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
          title: `Diagnóstico via Chat - ${new Date().toLocaleDateString('pt-BR')}`,
          status: 'em_andamento'
        })
        .select()
        .single();

      if (diagnosticError) throw diagnosticError;

      // Save responses
      const diagnosticResponses = [];
      for (const module of modules) {
        for (const question of module.questions) {
          if (responses[question.key] !== undefined) {
            diagnosticResponses.push({
              diagnostic_id: diagnostic.id,
              category: module.id,
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

  const progress = ((currentModule * 100) + ((currentQuestionIndex / modules[currentModule]?.questions.length || 1) * 100)) / modules.length;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-primary">Chat Diagnóstico</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">{organization.name}</Badge>
            <div className="text-sm text-muted-foreground">
              {Math.round(progress)}% concluído
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="h-[70vh] flex flex-col shadow-card">
          {/* Messages Area */}
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground'
                  }`}>
                    {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`rounded-lg p-4 ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                    
                    {/* Render options for bot messages */}
                    {message.type === 'bot' && message.options && isWaitingForResponse && (
                      <div className="mt-3 space-y-2">
                        {message.options.map((option) => (
                          <Button
                            key={option}
                            variant="outline"
                            size="sm"
                            className="block w-full text-left justify-start"
                            onClick={() => handleOptionClick(option, message.questionKey!)}
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isSubmitting && (
              <div className="flex justify-start">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span className="text-sm">Processando diagnóstico...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input Area */}
          {isWaitingForResponse && !isCompleted && (
            <div className="border-t p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="Digite sua resposta..."
                  className="flex-1"
                  disabled={isSubmitting}
                />
                <Button type="submit" size="icon" disabled={!currentInput.trim() || isSubmitting}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ChatDiagnostic;