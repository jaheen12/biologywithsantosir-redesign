import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Verify caller is admin using their JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No authorization header')

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user: callerUser }, error: authError } = await supabaseUser.auth.getUser()
    if (authError || !callerUser) throw new Error('Unauthorized')

    const { data: callerProfile } = await supabaseUser
      .from('profiles')
      .select('role')
      .eq('id', callerUser.id)
      .single()

    if (callerProfile?.role !== 'admin') throw new Error('Forbidden: caller is not admin')

    // 2. Parse request body
    const { target_user_id, new_role } = await req.json()
    if (!target_user_id || !new_role) throw new Error('Missing target_user_id or new_role')
    if (!['student', 'admin'].includes(new_role)) throw new Error('Invalid role')

    // 3. Block self-demotion
    if (target_user_id === callerUser.id && new_role === 'student') {
      throw new Error('Cannot demote your own account')
    }

    // 4. Use service role client to update auth.users.app_metadata
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get old role for audit log
    const { data: targetProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', target_user_id)
      .single()

    const old_role = targetProfile?.role ?? 'student'

    // Update app_metadata (controls middleware access)
    await supabaseAdmin.auth.admin.updateUserById(target_user_id, {
      app_metadata: { role: new_role }
    })

    // Update profiles.role (controls app UI)
    await supabaseAdmin
      .from('profiles')
      .update({ role: new_role })
      .eq('id', target_user_id)

    // Write audit log
    await supabaseAdmin
      .from('role_audit_log')
      .insert({
        changed_by: callerUser.id,
        target_user: target_user_id,
        old_role,
        new_role,
      })

    return new Response(
      JSON.stringify({ success: true, old_role, new_role }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
