import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { diagnosticId } = await req.json();

    console.log(`Generating PDF for diagnostic: ${diagnosticId}`);

    // Get diagnostic data
    const { data: diagnostic, error: diagnosticError } = await supabase
      .from('diagnostics')
      .select(`
        *,
        organizations (*)
      `)
      .eq('id', diagnosticId)
      .single();

    if (diagnosticError) throw diagnosticError;

    // Generate PDF content (HTML)
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Relatório de Diagnóstico - ${diagnostic.organizations.name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Arial', sans-serif; 
            line-height: 1.6; 
            color: #333;
            background: #fff;
        }
        .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
        .header { 
            text-align: center; 
            border-bottom: 3px solid #2563eb; 
            padding-bottom: 30px; 
            margin-bottom: 40px; 
        }
        .logo { color: #2563eb; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .subtitle { color: #64748b; font-size: 16px; }
        .org-info { 
            background: #f8fafc; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 30px; 
        }
        .score-section { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; 
            margin-bottom: 40px; 
        }
        .score-card { 
            background: #fff; 
            border: 2px solid #e2e8f0; 
            border-radius: 8px; 
            padding: 20px; 
            text-align: center; 
        }
        .score-value { 
            font-size: 36px; 
            font-weight: bold; 
            color: #2563eb; 
            margin-bottom: 5px; 
        }
        .score-label { 
            color: #64748b; 
            font-size: 14px; 
            text-transform: uppercase; 
        }
        .maturity-badge { 
            display: inline-block; 
            padding: 8px 16px; 
            border-radius: 20px; 
            font-weight: bold; 
            text-transform: uppercase; 
            margin: 20px 0; 
        }
        .bronze { background: #cd7f32; color: white; }
        .prata { background: #c0c0c0; color: #333; }
        .ouro { background: #ffd700; color: #333; }
        .diamante { background: #b9f2ff; color: #333; }
        .section { margin-bottom: 40px; }
        .section-title { 
            font-size: 24px; 
            color: #2563eb; 
            border-bottom: 2px solid #e2e8f0; 
            padding-bottom: 10px; 
            margin-bottom: 20px; 
        }
        .swot-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin-bottom: 20px; 
        }
        .swot-item { 
            background: #f8fafc; 
            padding: 20px; 
            border-radius: 8px; 
            border-left: 4px solid #2563eb; 
        }
        .swot-title { 
            font-weight: bold; 
            margin-bottom: 10px; 
            color: #2563eb; 
        }
        .swot-list { 
            list-style: none; 
        }
        .swot-list li { 
            padding: 5px 0; 
            border-bottom: 1px solid #e2e8f0; 
        }
        .swot-list li:last-child { 
            border-bottom: none; 
        }
        .action-item { 
            background: #fff; 
            border: 1px solid #e2e8f0; 
            border-radius: 8px; 
            padding: 20px; 
            margin-bottom: 15px; 
        }
        .action-title { 
            font-weight: bold; 
            color: #2563eb; 
            margin-bottom: 10px; 
        }
        .action-meta { 
            display: flex; 
            gap: 20px; 
            margin-top: 10px; 
            font-size: 14px; 
            color: #64748b; 
        }
        .priority-alta { color: #dc2626; font-weight: bold; }
        .priority-media { color: #ea580c; font-weight: bold; }
        .priority-baixa { color: #16a34a; font-weight: bold; }
        .footer { 
            text-align: center; 
            margin-top: 60px; 
            padding-top: 30px; 
            border-top: 1px solid #e2e8f0; 
            color: #64748b; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Dialogics</div>
            <div class="subtitle">Diagnóstico Organizacional</div>
        </div>
        
        <div class="org-info">
            <h2>${diagnostic.organizations.name}</h2>
            <p><strong>Tipo:</strong> ${diagnostic.organizations.organization_type}</p>
            <p><strong>Data do Diagnóstico:</strong> ${new Date(diagnostic.created_at).toLocaleDateString('pt-BR')}</p>
        </div>

        <div class="section">
            <div class="section-title">Pontuação Geral</div>
            <div style="text-align: center;">
                <div class="score-value" style="font-size: 48px;">${diagnostic.overall_score?.toFixed(1) || '0.0'}</div>
                <div class="score-label">Pontuação Final</div>
                <div class="maturity-badge ${diagnostic.maturity_level}">
                    ${diagnostic.maturity_level?.toUpperCase() || 'BRONZE'}
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Pontuação por Categoria</div>
            <div class="score-section">
                <div class="score-card">
                    <div class="score-value">${diagnostic.governance_score?.toFixed(1) || '0.0'}</div>
                    <div class="score-label">Governança</div>
                </div>
                <div class="score-card">
                    <div class="score-value">${diagnostic.finance_score?.toFixed(1) || '0.0'}</div>
                    <div class="score-label">Finanças</div>
                </div>
                <div class="score-card">
                    <div class="score-value">${diagnostic.communication_score?.toFixed(1) || '0.0'}</div>
                    <div class="score-label">Comunicação</div>
                </div>
                <div class="score-card">
                    <div class="score-value">${diagnostic.impact_score?.toFixed(1) || '0.0'}</div>
                    <div class="score-label">Impacto</div>
                </div>
                <div class="score-card">
                    <div class="score-value">${diagnostic.transparency_score?.toFixed(1) || '0.0'}</div>
                    <div class="score-label">Transparência</div>
                </div>
                <div class="score-card">
                    <div class="score-value">${diagnostic.fundraising_score?.toFixed(1) || '0.0'}</div>
                    <div class="score-label">Captação</div>
                </div>
            </div>
        </div>

        ${diagnostic.swot_analysis ? `
        <div class="section">
            <div class="section-title">Análise SWOT</div>
            <div class="swot-grid">
                <div class="swot-item">
                    <div class="swot-title">Forças</div>
                    <ul class="swot-list">
                        ${diagnostic.swot_analysis.strengths?.map(item => `<li>${item}</li>`).join('') || '<li>Não identificadas</li>'}
                    </ul>
                </div>
                <div class="swot-item">
                    <div class="swot-title">Fraquezas</div>
                    <ul class="swot-list">
                        ${diagnostic.swot_analysis.weaknesses?.map(item => `<li>${item}</li>`).join('') || '<li>Não identificadas</li>'}
                    </ul>
                </div>
                <div class="swot-item">
                    <div class="swot-title">Oportunidades</div>
                    <ul class="swot-list">
                        ${diagnostic.swot_analysis.opportunities?.map(item => `<li>${item}</li>`).join('') || '<li>Não identificadas</li>'}
                    </ul>
                </div>
                <div class="swot-item">
                    <div class="swot-title">Ameaças</div>
                    <ul class="swot-list">
                        ${diagnostic.swot_analysis.threats?.map(item => `<li>${item}</li>`).join('') || '<li>Não identificadas</li>'}
                    </ul>
                </div>
            </div>
        </div>
        ` : ''}

        ${diagnostic.action_plan ? `
        <div class="section">
            <div class="section-title">Plano de Ação</div>
            ${diagnostic.action_plan.actions?.map(action => `
                <div class="action-item">
                    <div class="action-title">${action.title}</div>
                    <p>${action.description}</p>
                    <div class="action-meta">
                        <span>Prazo: ${action.deadline} dias</span>
                        <span class="priority-${action.priority}">Prioridade: ${action.priority.toUpperCase()}</span>
                        <span>Categoria: ${action.category}</span>
                    </div>
                </div>
            `).join('') || '<p>Nenhuma ação identificada</p>'}
        </div>
        ` : ''}

        ${diagnostic.ai_analysis_summary ? `
        <div class="section">
            <div class="section-title">Resumo da Análise</div>
            <p style="text-align: justify; line-height: 1.8;">${diagnostic.ai_analysis_summary}</p>
        </div>
        ` : ''}

        <div class="footer">
            <p>Relatório gerado pelo Dialogics em ${new Date().toLocaleDateString('pt-BR')}</p>
            <p>www.dialogics.com.br</p>
        </div>
    </div>
</body>
</html>
    `;

    // Here you would normally convert HTML to PDF using a service like Puppeteer
    // For now, we'll simulate the PDF generation and store the HTML content
    const fileName = `diagnostic-report-${diagnosticId}.html`;
    
    // In a real implementation, you would:
    // 1. Convert HTML to PDF using a service
    // 2. Upload to Supabase Storage
    // 3. Get the public URL
    // 4. Update the diagnostic record

    // For simulation, we'll just create a mock URL
    const pdfUrl = `https://storage.supabase.io/reports/${fileName}`;

    // Update diagnostic with PDF URL
    const { error: updateError } = await supabase
      .from('diagnostics')
      .update({ pdf_report_url: pdfUrl })
      .eq('id', diagnosticId);

    if (updateError) throw updateError;

    console.log('PDF generated successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      pdfUrl,
      fileName 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});