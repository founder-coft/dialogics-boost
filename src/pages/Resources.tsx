import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Building2, 
  ArrowLeft,
  Search,
  Filter,
  Download,
  ExternalLink,
  FileText,
  BookOpen,
  Calculator,
  Users,
  TrendingUp,
  Eye,
  Target,
  MessageSquare,
  DollarSign
} from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  resource_type: string;
  file_url?: string;
  download_url?: string;
  tags: string[];
  target_weaknesses: string[];
}

const categoryIcons = {
  governance: Building2,
  finance: DollarSign,
  communication: MessageSquare,
  impact: Target,
  transparency: Eye,
  fundraising: Users
};

const resourceTypeIcons = {
  template: FileText,
  guide: BookOpen,
  spreadsheet: Calculator,
  manual: BookOpen,
  checklist: FileText
};

const Resources = () => {
  const [user, setUser] = useState<any>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      await loadResources();
    };

    checkAuth();
  }, [navigate]);

  const loadResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('is_active', true)
        .order('title');

      if (error) throw error;
      setResources(data || []);
      setFilteredResources(data || []);
    } catch (error: any) {
      console.error('Error loading resources:', error);
      toast.error('Erro ao carregar recursos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = resources;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    // Filter by type
    if (selectedType && selectedType !== "all") {
      filtered = filtered.filter(resource => resource.resource_type === selectedType);
    }

    setFilteredResources(filtered);
  }, [resources, searchTerm, selectedCategory, selectedType]);

  const handleDownload = async (resource: Resource) => {
    if (resource.download_url) {
      window.open(resource.download_url, '_blank');
    } else if (resource.file_url) {
      window.open(resource.file_url, '_blank');
    } else {
      toast.error('Link de download não disponível');
    }
  };

  const getCategoryIcon = (category: string) => {
    const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || FileText;
    return IconComponent;
  };

  const getResourceTypeIcon = (type: string) => {
    const IconComponent = resourceTypeIcons[type as keyof typeof resourceTypeIcons] || FileText;
    return IconComponent;
  };

  const getCategoryName = (category: string) => {
    const names = {
      governance: 'Governança',
      finance: 'Finanças',
      communication: 'Comunicação',
      impact: 'Impacto',
      transparency: 'Transparência',
      fundraising: 'Captação de Recursos'
    };
    return names[category as keyof typeof names] || category;
  };

  const getResourceTypeName = (type: string) => {
    const names = {
      template: 'Modelo',
      guide: 'Guia',
      spreadsheet: 'Planilha',
      manual: 'Manual',
      checklist: 'Checklist'
    };
    return names[type as keyof typeof names] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando recursos...</p>
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
              <BookOpen className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-primary">Biblioteca de Recursos</h1>
            </div>
          </div>
          <Badge variant="secondary">{filteredResources.length} recursos</Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Recursos para Fortalecer sua Organização</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Acesse modelos, guias, planilhas e manuais personalizados para melhorar os pontos identificados no seu diagnóstico
          </p>
        </div>

        {/* Filters */}
        <Card className="shadow-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Pesquisar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar recursos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    <SelectItem value="governance">Governança</SelectItem>
                    <SelectItem value="finance">Finanças</SelectItem>
                    <SelectItem value="communication">Comunicação</SelectItem>
                    <SelectItem value="impact">Impacto</SelectItem>
                    <SelectItem value="transparency">Transparência</SelectItem>
                    <SelectItem value="fundraising">Captação de Recursos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="template">Modelos</SelectItem>
                    <SelectItem value="guide">Guias</SelectItem>
                    <SelectItem value="spreadsheet">Planilhas</SelectItem>
                    <SelectItem value="manual">Manuais</SelectItem>
                    <SelectItem value="checklist">Checklists</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setSelectedType("all");
                  }}
                  className="w-full"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resources Grid */}
        {filteredResources.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="text-center py-12">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum recurso encontrado</h3>
              <p className="text-muted-foreground">
                Tente ajustar os filtros ou termos de pesquisa
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => {
              const CategoryIcon = getCategoryIcon(resource.category);
              const TypeIcon = getResourceTypeIcon(resource.resource_type);

              return (
                <Card key={resource.id} className="shadow-card hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <TypeIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <Badge variant="outline" className="mb-2">
                            <CategoryIcon className="h-3 w-3 mr-1" />
                            {getCategoryName(resource.category)}
                          </Badge>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {getResourceTypeName(resource.resource_type)}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {resource.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {resource.tags && resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {resource.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {resource.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{resource.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleDownload(resource)}
                        className="flex-1"
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </Button>
                      {resource.file_url && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(resource.file_url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;