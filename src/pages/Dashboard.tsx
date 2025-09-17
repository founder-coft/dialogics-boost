import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Building2, 
  Plus, 
  FileText, 
  TrendingUp, 
  Award,
  LogOut,
  ChevronRight,
  MessageCircle
} from "lucide-react";

interface Organization {
  id: string;
  name: string;
  email: string;
  organization_type: string;
  created_at: string;
}

interface Diagnostic {
  id: string;
  title: string;
  status: string;
  overall_score: number;
  maturity_level: string;
  created_at: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadOrganizationData(session.user.email!);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadOrganizationData(session.user.email!);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadOrganizationData = async (email: string) => {
    try {
      // Check if organization exists
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (orgError && orgError.code !== 'PGRST116') {
        throw orgError;
      }

      setOrganization(orgData);

      // Load diagnostics if organization exists
      if (orgData) {
        const { data: diagnosticsData, error: diagnosticsError } = await supabase
          .from('diagnostics')
          .select('*')
          .eq('organization_id', orgData.id)
          .order('created_at', { ascending: false });

        if (diagnosticsError) {
          throw diagnosticsError;
        }

        setDiagnostics(diagnosticsData || []);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados da organização');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getMaturityBadgeVariant = (level: string) => {
    switch (level) {
      case 'bronze': return 'secondary';
      case 'prata': return 'default';
      case 'ouro': return 'secondary';
      case 'diamante': return 'default';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'concluido': return 'default';
      case 'em_andamento': return 'secondary';
      case 'cancelado': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
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
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-primary">Dialogics</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!organization ? (
          // Organization setup
          <div className="max-w-2xl mx-auto text-center">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-center">
                  <Building2 className="h-6 w-6" />
                  Configure sua Organização
                </CardTitle>
                <CardDescription>
                  Para começar, precisamos de algumas informações sobre sua organização
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="hero" size="lg" onClick={() => navigate("/setup")}>
                  <Plus className="mr-2 h-5 w-5" />
                  Cadastrar Organização
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Dashboard content
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">
                Bem-vindo, {organization.name}!
              </h2>
              <p className="text-muted-foreground">
                Acompanhe e gerencie seus diagnósticos organizacionais
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Diagnósticos Realizados
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{diagnostics.length}</div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Última Pontuação
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {diagnostics.length > 0 
                      ? diagnostics[0].overall_score?.toFixed(1) || '--'
                      : '--'
                    }
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Nível Atual
                  </CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">
                    {diagnostics.length > 0 
                      ? diagnostics[0].maturity_level || 'Não avaliado'
                      : 'Não avaliado'
                    }
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" onClick={() => navigate("/diagnostic")}>
                <Plus className="mr-2 h-5 w-5" />
                Diagnóstico Tradicional
              </Button>
              <Button variant="hero" size="lg" onClick={() => navigate("/chat-diagnostic")}>
                <MessageCircle className="mr-2 h-5 w-5" />
                Chat com IA da Cuidatoria
              </Button>
              <Button variant="professional" size="lg" onClick={() => navigate("/resources")}>
                <FileText className="mr-2 h-5 w-5" />
                Biblioteca de Recursos
              </Button>
            </div>

            {/* Recent Diagnostics */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Diagnósticos Recentes</CardTitle>
                <CardDescription>
                  Acompanhe o histórico dos seus diagnósticos organizacionais
                </CardDescription>
              </CardHeader>
              <CardContent>
                {diagnostics.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Nenhum diagnóstico realizado ainda.
                    </p>
                    <Button variant="minimal" className="mt-4" onClick={() => navigate("/diagnostic")}>
                      Realizar primeiro diagnóstico
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {diagnostics.slice(0, 5).map((diagnostic) => (
                      <div key={diagnostic.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <h4 className="font-medium">{diagnostic.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Criado em {new Date(diagnostic.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusBadgeVariant(diagnostic.status)}>
                            {diagnostic.status.replace('_', ' ')}
                          </Badge>
                          {diagnostic.maturity_level && (
                            <Badge variant={getMaturityBadgeVariant(diagnostic.maturity_level)}>
                              {diagnostic.maturity_level}
                            </Badge>
                          )}
                          <Button variant="ghost" size="sm">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;