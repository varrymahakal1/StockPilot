const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { email, organization_id } = JSON.parse(event.body || '{}');

  if (!email || !organization_id) {
    return { statusCode: 400, body: 'Missing email or organization_id' };
  }

  // Note: Netlify exposes env vars from the site settings here
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing keys:', { url: !!supabaseUrl, key: !!serviceRoleKey });
    return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error: Missing Service Key' }) };
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Send standard Supabase Invite email
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        organization_id: organization_id,
        role: 'employee'
      }
    });

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Invitation sent', data }),
    };
  } catch (error) {
    console.error('Invite Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
