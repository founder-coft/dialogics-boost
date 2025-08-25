-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for organization types
CREATE TYPE organization_type AS ENUM ('ong', 'associacao', 'fundacao', 'cooperativa', 'outra');

-- Create enum for diagnostic status
CREATE TYPE diagnostic_status AS ENUM ('em_andamento', 'concluido', 'cancelado');

-- Create enum for maturity levels
CREATE TYPE maturity_level AS ENUM ('bronze', 'prata', 'ouro', 'diamante');

-- Organizations table
CREATE TABLE public.organizations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    whatsapp TEXT,
    cnpj TEXT,
    organization_type organization_type NOT NULL,
    website TEXT,
    description TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    foundation_year INTEGER,
    employees_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Diagnostics table
CREATE TABLE public.diagnostics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Diagnóstico Organizacional',
    status diagnostic_status NOT NULL DEFAULT 'em_andamento',
    overall_score DECIMAL(5,2),
    maturity_level maturity_level,
    governance_score DECIMAL(5,2),
    finance_score DECIMAL(5,2),
    communication_score DECIMAL(5,2),
    fundraising_score DECIMAL(5,2),
    impact_score DECIMAL(5,2),
    transparency_score DECIMAL(5,2),
    ai_analysis_summary TEXT,
    action_plan JSONB,
    swot_analysis JSONB,
    pdf_report_url TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Diagnostic responses table
CREATE TABLE public.diagnostic_responses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    diagnostic_id UUID NOT NULL REFERENCES public.diagnostics(id) ON DELETE CASCADE,
    question_key TEXT NOT NULL,
    question_text TEXT NOT NULL,
    answer_value INTEGER,
    answer_text TEXT,
    category TEXT NOT NULL,
    weight DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Profiles for admin users
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'admin',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Resource library table
CREATE TABLE public.resources (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    resource_type TEXT NOT NULL, -- 'planilha', 'documento', 'guia', 'template'
    file_url TEXT,
    download_url TEXT,
    tags TEXT[],
    target_weaknesses TEXT[], -- Which diagnostic weaknesses this addresses
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Organizations can view their own data" 
ON public.organizations 
FOR SELECT 
USING (email = auth.jwt()->>'email');

CREATE POLICY "Organizations can update their own data" 
ON public.organizations 
FOR UPDATE 
USING (email = auth.jwt()->>'email');

CREATE POLICY "Anyone can create organization" 
ON public.organizations 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for diagnostics
CREATE POLICY "Organizations can view their own diagnostics" 
ON public.diagnostics 
FOR SELECT 
USING (
  organization_id IN (
    SELECT id FROM public.organizations WHERE email = auth.jwt()->>'email'
  )
);

CREATE POLICY "Organizations can create their own diagnostics" 
ON public.diagnostics 
FOR INSERT 
WITH CHECK (
  organization_id IN (
    SELECT id FROM public.organizations WHERE email = auth.jwt()->>'email'
  )
);

CREATE POLICY "Organizations can update their own diagnostics" 
ON public.diagnostics 
FOR UPDATE 
USING (
  organization_id IN (
    SELECT id FROM public.organizations WHERE email = auth.jwt()->>'email'
  )
);

-- RLS Policies for diagnostic responses
CREATE POLICY "Organizations can view their own responses" 
ON public.diagnostic_responses 
FOR SELECT 
USING (
  diagnostic_id IN (
    SELECT d.id FROM public.diagnostics d
    JOIN public.organizations o ON d.organization_id = o.id
    WHERE o.email = auth.jwt()->>'email'
  )
);

CREATE POLICY "Organizations can create their own responses" 
ON public.diagnostic_responses 
FOR INSERT 
WITH CHECK (
  diagnostic_id IN (
    SELECT d.id FROM public.diagnostics d
    JOIN public.organizations o ON d.organization_id = o.id
    WHERE o.email = auth.jwt()->>'email'
  )
);

-- RLS Policies for profiles (admin only)
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for resources (public read, admin write)
CREATE POLICY "Everyone can view active resources" 
ON public.resources 
FOR SELECT 
USING (is_active = true);

-- Admin policies will be added later when admin system is implemented

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_diagnostics_updated_at
    BEFORE UPDATE ON public.diagnostics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
    BEFORE UPDATE ON public.resources
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_organizations_email ON public.organizations(email);
CREATE INDEX idx_diagnostics_organization_id ON public.diagnostics(organization_id);
CREATE INDEX idx_diagnostics_status ON public.diagnostics(status);
CREATE INDEX idx_diagnostic_responses_diagnostic_id ON public.diagnostic_responses(diagnostic_id);
CREATE INDEX idx_diagnostic_responses_category ON public.diagnostic_responses(category);
CREATE INDEX idx_resources_category ON public.resources(category);
CREATE INDEX idx_resources_active ON public.resources(is_active);

-- Insert sample resources
INSERT INTO public.resources (title, description, category, resource_type, tags, target_weaknesses) VALUES
('Planilha de Fluxo de Caixa', 'Modelo completo para controle financeiro mensal', 'financeiro', 'planilha', ARRAY['financeiro', 'controle', 'fluxo-caixa'], ARRAY['finance_score']),
('Guia de Governança para ONGs', 'Manual completo sobre estrutura organizacional', 'governanca', 'guia', ARRAY['governanca', 'estrutura', 'conselho'], ARRAY['governance_score']),
('Template de Relatório de Atividades', 'Modelo para relatórios anuais de transparência', 'transparencia', 'template', ARRAY['transparencia', 'relatorio', 'atividades'], ARRAY['transparency_score']),
('Kit de Captação de Recursos', 'Materiais completos para fundraising', 'captacao', 'documento', ARRAY['captacao', 'fundraising', 'doadores'], ARRAY['fundraising_score']);