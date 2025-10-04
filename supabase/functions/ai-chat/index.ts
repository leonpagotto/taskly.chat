// Supabase Edge Function for AI Chat Proxy
// Handles AI requests with subscription-based rate limiting and model selection

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limits per subscription tier (requests per hour)
const RATE_LIMITS = {
  free: 50,        // 50 requests/hour for free users
  basic: 200,      // 200 requests/hour for basic paid
  pro: 1000,       // 1000 requests/hour for pro users
  enterprise: null // unlimited for enterprise
}

// Model selection based on tier
const MODEL_CONFIG = {
  free: 'gemini-2.0-flash-exp',          // Gemini 2.0 Flash for free
  basic: 'gemini-2.0-flash-exp',         // Gemini 2.0 Flash for basic
  pro: 'gemini-2.0-flash-exp',           // Gemini 2.0 Flash for pro
  enterprise: 'gemini-2.5-flash-preview-05-20' // Gemini 2.5 Flash for enterprise
}

interface ChatRequest {
  messages: Array<{
    role: 'user' | 'model'
    parts: Array<{ text: string }>
  }>
  systemInstruction?: string
  generationConfig?: any
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get auth token from header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verify user token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's subscription tier
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('tier, status')
      .eq('user_id', user.id)
      .single()

    const tier = (subscription?.status === 'active' || subscription?.status === 'trialing') 
      ? subscription.tier 
      : 'free'

    // Check rate limits
    if (RATE_LIMITS[tier as keyof typeof RATE_LIMITS] !== null) {
      const limit = RATE_LIMITS[tier as keyof typeof RATE_LIMITS] as number
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

      // Count requests in last hour
      const { count } = await supabase
        .from('ai_usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', hourAgo)

      if (count !== null && count >= limit) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded',
            message: `You've reached your hourly limit of ${limit} AI requests. Upgrade your plan for more access.`,
            tier,
            limit,
            used: count
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Parse request body
    const chatRequest: ChatRequest = await req.json()

    // Get Google AI API key from environment
    const googleApiKey = Deno.env.get('GOOGLE_AI_API_KEY')
    if (!googleApiKey) {
      throw new Error('Google AI API key not configured')
    }

    // Select model based on tier
    const model = MODEL_CONFIG[tier as keyof typeof MODEL_CONFIG] || MODEL_CONFIG.free

    // Call Google AI API
    const googleAiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${googleApiKey}`
    
    const aiResponse = await fetch(googleAiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: chatRequest.messages,
        systemInstruction: chatRequest.systemInstruction ? {
          parts: [{ text: chatRequest.systemInstruction }]
        } : undefined,
        generationConfig: chatRequest.generationConfig || {
          temperature: 1,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
        ],
      }),
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      throw new Error(`Google AI API error: ${aiResponse.status} - ${errorText}`)
    }

    const aiData = await aiResponse.json()

    // Log usage
    await supabase.from('ai_usage_logs').insert({
      user_id: user.id,
      model,
      tier,
      tokens_used: aiData.usageMetadata?.totalTokenCount || 0,
      created_at: new Date().toISOString()
    })

    // Return response with metadata
    return new Response(
      JSON.stringify({
        ...aiData,
        metadata: {
          model,
          tier,
          rateLimit: RATE_LIMITS[tier as keyof typeof RATE_LIMITS]
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('AI Chat Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
