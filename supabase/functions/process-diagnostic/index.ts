import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const geminiApiKey = Deno.env.get('GEMINI_API_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { diagnosticId } = await req.json();

    console.log(`Processing diagnostic: ${diagnosticId}`);

    // Get diagnostic responses
    const { data: responses, error: responsesError } = await supabase
      .from('diagnostic_responses')
      .select('*')
      .eq('diagnostic_id', diagnosticId);

    if (responsesError) throw responsesError;

    // Calculate scores by category
    const categoryScores: Record<string, number> = {};
    const categories = ['governance', 'finance', 'communication', 'impact', 'transparency', 'fundraising'];
    
    for (const category of categories) {
      const categoryResponses = responses.filter(r => r.category === category);
      if (categoryResponses.length > 0) {
        const weightedSum = categoryResponses.reduce((sum, r) => sum + (r.answer_value * r.weight), 0);
        const totalWeight = categoryResponses.reduce((sum, r) => sum + r.weight, 0);
        categoryScores[category] = (weightedSum / totalWeight) * 20; // Scale to 0-100
      }
    }

    const overallScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0) / Object.keys(categoryScores).length;

    // Determine maturity level
    let maturityLevel = 'bronze';
    if (overallScore >= 85) maturityLevel = 'diamante';
    else if (overallScore >= 70) maturityLevel = 'ouro';
    else if (overallScore >= 55) maturityLevel = 'prata';

    // Prepare AI analysis prompt
    const prompt = `
Analise os seguintes resultados de diagnóstico organizacional de uma ONG:

Pontuações por categoria (0-100):
${Object.entries(categoryScores).map(([cat, score]) => `- ${cat}: ${score.toFixed(1)}`).join('\n')}

Pontuação geral: ${overallScore.toFixed(1)}
Nível de maturidade: ${maturityLevel}

Respostas detalhadas:
${responses.map(r => `${r.category} - ${r.question_text}: ${r.answer_value}/5`).join('\n')}

Por favor, forneça:

1. ANÁLISE SWOT (formato JSON):
{
  "strengths": ["força 1", "força 2", ...],
  "weaknesses": ["fraqueza 1", "fraqueza 2", ...],
  "opportunities": ["oportunidade 1", "oportunidade 2", ...],
  "threats": ["ameaça 1", "ameaça 2", ...]
}

2. PLANO DE AÇÃO (formato JSON):
{
  "actions": [
    {
      "title": "Título da ação",
      "description": "Descrição detalhada",
      "priority": "alta|media|baixa",
      "deadline": "prazo em dias",
      "category": "categoria relacionada"
    }
  ]
}

3. RESUMO DA ANÁLISE (texto corrido de 2-3 parágrafos sobre os principais achados e recomendações)

Responda APENAS com JSON válido no formato:
{
  "swot": { ... },
  "actionPlan": { ... },
  "summary": "texto do resumo"
}
    `;

    // Call Gemini API
    console.log('Calling Gemini API...');
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + geminiApiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const aiText = geminiData.candidates[0].content.parts[0].text;
    
    console.log('AI Response:', aiText);

    // Parse AI response
    let aiAnalysis;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback analysis
      aiAnalysis = {
        swot: {
          strengths: ["Organização comprometida com sua missão"],
          weaknesses: ["Necessita melhorias em alguns processos"],
          opportunities: ["Potencial de crescimento e impacto"],
          threats: ["Desafios do setor social"]
        },
        actionPlan: {
          actions: [
            {
              title: "Revisar processos internos",
              description: "Avaliar e otimizar processos organizacionais",
              priority: "alta",
              deadline: "60",
              category: "governance"
            }
          ]
        },
        summary: "A organização demonstra potencial significativo, com oportunidades claras de melhoria em áreas específicas identificadas no diagnóstico."
      };
    }

    // Update diagnostic with results
    const { error: updateError } = await supabase
      .from('diagnostics')
      .update({
        overall_score: overallScore,
        governance_score: categoryScores.governance || 0,
        finance_score: categoryScores.finance || 0,
        communication_score: categoryScores.communication || 0,
        impact_score: categoryScores.impact || 0,
        transparency_score: categoryScores.transparency || 0,
        fundraising_score: categoryScores.fundraising || 0,
        maturity_level: maturityLevel,
        swot_analysis: aiAnalysis.swot,
        action_plan: aiAnalysis.actionPlan,
        ai_analysis_summary: aiAnalysis.summary,
        status: 'concluido',
        completed_at: new Date().toISOString()
      })
      .eq('id', diagnosticId);

    if (updateError) throw updateError;

    console.log('Diagnostic processed successfully');

    // Trigger PDF generation and notifications in background
    Promise.all([
      supabase.functions.invoke('generate-pdf-report', {
        body: { diagnosticId }
      }),
      supabase.functions.invoke('send-notifications', {
        body: { diagnosticId }
      })
    ]).catch(error => {
      console.error('Background tasks error:', error);
    });

    return new Response(JSON.stringify({ 
      success: true, 
      diagnosticId,
      overallScore,
      maturityLevel 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing diagnostic:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});