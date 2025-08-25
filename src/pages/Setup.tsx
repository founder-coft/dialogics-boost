import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Building2, ArrowLeft } from "lucide-react";

const Setup = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    cnpj: "",
    organization_type: "",
    website: "",
    description: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    foundation_year: "",
    employees_count: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        setFormData(prev => ({ ...prev, email: session.user.email || "" }));
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        setFormData(prev => ({ ...prev, email: session.user.email || "" }));
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const organizationData = {
        ...formData,
        foundation_year: formData.foundation_year ? parseInt(formData.foundation_year) : null,
        employees_count: formData.employees_count ? parseInt(formData.employees_count) : null,
        organization_type: formData.organization_type as "ong" | "associacao" | "fundacao" | "cooperativa" | "outra",
      };

      const { error } = await supabase
        .from('organizations')
        .insert(organizationData);

      if (error) {
        if (error.code === '23505') {
          toast.error("Esta organização já está cadastrada com este e-mail.");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Organização cadastrada com sucesso! Redirecionando para o dashboard...");
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (error: any) {
      console.error('Error creating organization:', error);
      toast.error("Erro ao cadastrar organização. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!user) {
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
              <h1 className="text-xl font-bold text-primary">Dialogics</h1>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {user.email}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Configure sua Organização</h2>
          <p className="text-muted-foreground">
            Vamos conhecer melhor sua organização para personalizar seu diagnóstico
          </p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Informações da Organização</CardTitle>
            <CardDescription>
              Preencha os dados básicos da sua organização. Quanto mais informações você fornecer, 
              mais preciso será seu diagnóstico.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Informações Básicas</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Organização *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Nome completo da ONG"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="organization_type">Tipo de Organização *</Label>
                    <Select 
                      value={formData.organization_type} 
                      onValueChange={(value) => handleInputChange("organization_type", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ong">ONG</SelectItem>
                        <SelectItem value="associacao">Associação</SelectItem>
                        <SelectItem value="fundacao">Fundação</SelectItem>
                        <SelectItem value="cooperativa">Cooperativa</SelectItem>
                        <SelectItem value="outra">Outra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição das Atividades</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Descreva brevemente as principais atividades da organização"
                    rows={3}
                  />
                </div>
              </div>

              {/* Contato */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Informações de Contato</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={formData.whatsapp}
                      onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      placeholder="https://www.exemplo.org"
                    />
                  </div>
                </div>
              </div>

              {/* Dados Organizacionais */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Dados Organizacionais</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      value={formData.cnpj}
                      onChange={(e) => handleInputChange("cnpj", e.target.value)}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="foundation_year">Ano de Fundação</Label>
                    <Input
                      id="foundation_year"
                      type="number"
                      value={formData.foundation_year}
                      onChange={(e) => handleInputChange("foundation_year", e.target.value)}
                      placeholder="2020"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employees_count">Número de Colaboradores</Label>
                  <Input
                    id="employees_count"
                    type="number"
                    value={formData.employees_count}
                    onChange={(e) => handleInputChange("employees_count", e.target.value)}
                    placeholder="Incluindo voluntários e funcionários"
                    min="0"
                  />
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Endereço</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço Completo</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Rua, número, complemento"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="São Paulo"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="zip_code">CEP</Label>
                    <Input
                      id="zip_code"
                      value={formData.zip_code}
                      onChange={(e) => handleInputChange("zip_code", e.target.value)}
                      placeholder="00000-000"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button type="submit" variant="hero" className="flex-1" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar e Continuar
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Setup;