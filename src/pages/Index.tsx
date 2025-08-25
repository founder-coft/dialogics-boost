import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-dialogics.jpg";
import { 
  Building2, 
  TrendingUp, 
  Shield, 
  Award,
  FileText,
  Users,
  ChevronRight,
  CheckCircle,
  BarChart3,
  Target,
  Lightbulb
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Diagnóstico Completo",
      description: "Análise de 6 áreas: Governança, Finanças, Comunicação, Captação, Impacto e Transparência"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Plano de Ação Personalizado",
      description: "Receba um checklist detalhado com ações práticas para fortalecer sua organização"
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Selo de Maturidade",
      description: "Conquiste selos Bronze, Prata, Ouro ou Diamante para usar em seus materiais"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Relatórios Profissionais",
      description: "PDFs completos com gráficos, análise SWOT e benchmarking para apresentações"
    },
    {
      icon: <Lightbulb className="h-6 w-6" />,
      title: "Biblioteca de Recursos",
      description: "Acesso a planilhas, templates e guias personalizados para suas necessidades"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Acompanhamento da Evolução",
      description: "Compare seu progresso ao longo do tempo e veja o impacto das melhorias"
    }
  ];

  const benefits = [
    "Análise com Inteligência Artificial Gemini 1.5 Flash",
    "Benchmarking com outras organizações do setor",
    "Entrega automática via WhatsApp e e-mail",
    "Histórico completo de diagnósticos",
    "Suporte contínuo com dicas semanais",
    "Interface simples e intuitiva"
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-primary">Dialogics</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="minimal" onClick={() => navigate("/auth")}>
              Entrar
            </Button>
            <Button variant="hero" onClick={() => navigate("/auth")}>
              Começar Diagnóstico
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  <Award className="h-3 w-3 mr-1" />
                  Plataforma Líder em Diagnóstico Organizacional
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  Fortaleça sua{" "}
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    ONG
                  </span>{" "}
                  com diagnósticos inteligentes
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Descubra pontos fortes e oportunidades de melhoria da sua organização. 
                  Receba planos de ação personalizados e eleve sua ONG ao próximo nível de maturidade.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="xl" onClick={() => navigate("/auth")}>
                  Iniciar Diagnóstico Gratuito
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="secondary-outline" size="xl">
                  <Users className="mr-2 h-5 w-5" />
                  Ver Exemplo
                </Button>
              </div>

              <div className="flex items-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-secondary" />
                  100% Gratuito
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-secondary" />
                  Resultado em 15min
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-secondary" />
                  Relatório em PDF
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-2xl blur-2xl opacity-20"></div>
              <img 
                src={heroImage} 
                alt="Plataforma Dialogics para diagnóstico organizacional"
                className="relative rounded-2xl shadow-elegant w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Tudo que sua ONG precisa para evoluir
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              O Dialogics oferece uma solução completa de diagnóstico organizacional 
              com inteligência artificial e recursos práticos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-card hover:shadow-glow transition-all duration-300 border-0">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="outline" className="w-fit">
                  <Shield className="h-3 w-3 mr-1" />
                  Tecnologia Avançada
                </Badge>
                <h2 className="text-3xl font-bold">
                  Por que escolher o Dialogics?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Nossa plataforma combina inteligência artificial com conhecimento especializado 
                  para oferecer diagnósticos precisos e acionáveis.
                </p>
              </div>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-secondary flex-shrink-0" />
                    <span className="text-base">{benefit}</span>
                  </div>
                ))}
              </div>

              <Button variant="impact" size="lg">
                Começar Agora
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <Card className="shadow-elegant border-0 bg-gradient-to-br from-primary-light to-secondary-light/30">
              <CardHeader>
                <CardTitle className="text-center">Níveis de Maturidade</CardTitle>
                <CardDescription className="text-center">
                  Conquiste selos de reconhecimento para sua organização
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-background/80 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Award className="h-4 w-4 text-yellow-700" />
                    </div>
                    <span className="font-medium">Bronze</span>
                  </div>
                  <Badge variant="secondary">0-40 pontos</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-background/80 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Award className="h-4 w-4 text-gray-700" />
                    </div>
                    <span className="font-medium">Prata</span>
                  </div>
                  <Badge variant="secondary">41-60 pontos</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-background/80 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Award className="h-4 w-4 text-yellow-600" />
                    </div>
                    <span className="font-medium">Ouro</span>
                  </div>
                  <Badge variant="secondary">61-80 pontos</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-background/80 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Award className="h-4 w-4 text-blue-700" />
                    </div>
                    <span className="font-medium">Diamante</span>
                  </div>
                  <Badge variant="secondary">81-100 pontos</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Pronto para fortalecer sua organização?
            </h2>
            <p className="text-xl text-white/90 leading-relaxed">
              Junte-se a centenas de ONGs que já transformaram sua gestão com o Dialogics. 
              Comece seu diagnóstico gratuito agora e receba seu relatório personalizado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary" 
                size="xl" 
                className="bg-white text-primary hover:bg-white/90"
                onClick={() => navigate("/auth")}
              >
                <Building2 className="mr-2 h-5 w-5" />
                Iniciar Diagnóstico
              </Button>
              <Button variant="secondary-outline" size="xl" className="border-white text-white hover:bg-white/10">
                <FileText className="mr-2 h-5 w-5" />
                Ver Demonstração
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-primary">Dialogics</span>
            </div>
            <p className="text-muted-foreground">
              Fortalecendo organizações do terceiro setor através de diagnósticos inteligentes
            </p>
            <div className="flex justify-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Sobre</a>
              <a href="#" className="hover:text-primary transition-colors">Contato</a>
              <a href="#" className="hover:text-primary transition-colors">Suporte</a>
              <a href="#" className="hover:text-primary transition-colors">Privacidade</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;