import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY')!;
const whatsappApiKey = Deno.env.get('WHATSAPP_API_KEY')!;

const resend = new Resend(resendApiKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { diagnosticId } = await req.json();

    console.log(`Sending notifications for diagnostic: ${diagnosticId}`);

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

    const organization = diagnostic.organizations;
    
    // Send email notification
    try {
      const emailResult = await resend.emails.send({
        from: 'Dialogics <noreply@dialogics.com.br>',
        to: [organization.email],
        subject: '🎉 Seu Diagnóstico Organizacional está pronto!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin-bottom: 10px;">Dialogics</h1>
              <h2 style="color: #64748b;">Diagnóstico Concluído!</h2>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3>Olá, ${organization.name}!</h3>
              <p>Seu diagnóstico organizacional foi processado com sucesso. Aqui estão os resultados:</p>
            </div>
            
            <div style="background: white; border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <div style="text-align: center;">
                <div style="font-size: 48px; font-weight: bold; color: #2563eb; margin-bottom: 10px;">
                  ${diagnostic.overall_score?.toFixed(1) || '0.0'}
                </div>
                <div style="color: #64748b; margin-bottom: 15px;">Pontuação Final</div>
                <div style="display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; text-transform: uppercase; background: #2563eb; color: white;">
                  ${diagnostic.maturity_level?.toUpperCase() || 'BRONZE'}
                </div>
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 30px;">
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #2563eb;">${diagnostic.governance_score?.toFixed(1) || '0.0'}</div>
                <div style="color: #64748b; font-size: 14px;">Governança</div>
              </div>
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #2563eb;">${diagnostic.finance_score?.toFixed(1) || '0.0'}</div>
                <div style="color: #64748b; font-size: 14px;">Finanças</div>
              </div>
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #2563eb;">${diagnostic.communication_score?.toFixed(1) || '0.0'}</div>
                <div style="color: #64748b; font-size: 14px;">Comunicação</div>
              </div>
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #2563eb;">${diagnostic.impact_score?.toFixed(1) || '0.0'}</div>
                <div style="color: #64748b; font-size: 14px;">Impacto</div>
              </div>
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #2563eb;">${diagnostic.transparency_score?.toFixed(1) || '0.0'}</div>
                <div style="color: #64748b; font-size: 14px;">Transparência</div>
              </div>
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #2563eb;">${diagnostic.fundraising_score?.toFixed(1) || '0.0'}</div>
                <div style="color: #64748b; font-size: 14px;">Captação</div>
              </div>
            </div>
            
            <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <h4 style="color: #2563eb; margin-bottom: 15px;">Próximos Passos:</h4>
              <p>• Acesse seu dashboard para ver o relatório completo</p>
              <p>• Baixe o PDF com análise SWOT e plano de ação</p>
              <p>• Explore nossa biblioteca de recursos personalizados</p>
              <p>• Compartilhe seu selo de maturidade</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://dialogics.com.br/dashboard" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Acessar Dashboard
              </a>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">
              <p>Este é um e-mail automático. Para dúvidas, entre em contato conosco.</p>
              <p>© 2024 Dialogics - Diagnóstico Organizacional</p>
            </div>
          </div>
        `
      });

      console.log('Email sent:', emailResult);
    } catch (emailError) {
      console.error('Email error:', emailError);
    }

    // Send WhatsApp notification (if phone number available)
    if (organization.whatsapp) {
      try {
        const whatsappMessage = `
🎉 *Diagnóstico Concluído - ${organization.name}*

Sua pontuação: *${diagnostic.overall_score?.toFixed(1) || '0.0'}*
Nível: *${diagnostic.maturity_level?.toUpperCase() || 'BRONZE'}*

📊 *Pontuações por área:*
• Governança: ${diagnostic.governance_score?.toFixed(1) || '0.0'}
• Finanças: ${diagnostic.finance_score?.toFixed(1) || '0.0'} 
• Comunicação: ${diagnostic.communication_score?.toFixed(1) || '0.0'}
• Impacto: ${diagnostic.impact_score?.toFixed(1) || '0.0'}
• Transparência: ${diagnostic.transparency_score?.toFixed(1) || '0.0'}
• Captação: ${diagnostic.fundraising_score?.toFixed(1) || '0.0'}

📋 Acesse seu dashboard para:
• Ver relatório completo
• Baixar PDF com análise SWOT
• Explorar recursos personalizados
• Obter seu selo digital

🔗 https://dialogics.com.br/dashboard

_Parabéns pelo diagnóstico! Sua organização está no caminho certo para o crescimento._
        `;

        // WhatsApp API call (API Coft)
        const whatsappResponse = await fetch('https://api.coft.com.br/whatsapp/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${whatsappApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: organization.whatsapp,
            message: whatsappMessage
          })
        });

        if (whatsappResponse.ok) {
          console.log('WhatsApp message sent successfully');
        } else {
          console.error('WhatsApp API error:', await whatsappResponse.text());
        }
      } catch (whatsappError) {
        console.error('WhatsApp error:', whatsappError);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      emailSent: true,
      whatsappSent: !!organization.whatsapp 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error sending notifications:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});