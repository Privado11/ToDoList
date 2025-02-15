import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'


interface UserProfile {
  id: string;
  full_name: string;
  email: string;
}

interface EmailTemplate {
  template_id: string;
  personalizations: [{
    to: [{ email: string }];
    dynamic_template_data: {
      sender_name: string
      see_request: string;
    };
  }];
  from: {
    email: string;
    name: string;
  };
}


const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

const APP_BASE_URL = Deno.env.get('APP_BASE_URL') || 'http://localhost:5173';
const SENDGRID_TEMPLATE_ID = 'd-8e62885db6824fee8c12a8d604124630';
const FROM_EMAIL = 'info@piranhaplanner.online';
const FROM_NAME = 'Piranha Planner';


class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}


function initializeSupabase(): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing required Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseKey);
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateRequestBody(body: unknown): ShareTaskRequest {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Invalid request body');
  }

  const {sender_id, recipient_id } = body as Record<string, unknown>;


  if (!sender_id || typeof sender_id !== 'string') {
    throw new ValidationError('Invalid sender_id');
  }
  if (!recipient_id || typeof recipient_id !== 'string') {
    throw new ValidationError('Invalid recipient_id');
  }


  return { sender_id, recipient_id };
}


async function getUserProfileById(
  supabase: SupabaseClient,
  userId: string
): Promise<UserProfile> {
  const { data: userData, error: authError } = await supabase
      .auth
      .admin
      .getUserById(userId);

    if (authError || !userData) {
      throw new DatabaseError(`Failed to fetch user profile: ${authError?.message}`);
    }

  return {
    id: userData.id,
    full_name: userData.raw_user_meta_data?.full_name || 'Unknown User',
    email: userData.email || ''
  };
}

async function getUserProfileByEmail(
  supabase: SupabaseClient,
  email: string
): Promise<UserProfile | null> {
  const { data: authData, error: authError } = await supabase
    .auth
    .admin
    .listUsers();

  if (authError) {
    throw new DatabaseError(`Failed to search users: ${authError.message}`);
  }

  const user = authData.users.find(u => u.email === email);
  
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    full_name: user.user_metadata?.full_name || 'Unknown User',
    email: user.email || ''
  };
}

async function createPendingFriends(
  supabase: SupabaseClient,
  taskId: string,
  senderId: string,
  recipientId: string
): Promise<string> {
  const friendId = crypto.randomUUID();
  
  const { error } = await supabase
    .from('friends')
    .insert({
      id: friendId,
      user_id: senderId,
      friend_id: recipientId,
      status: 'pending',
      created_at: new Date().toISOString()
    });

  if (error) {
    if (error.code === '23505') {
      throw new ValidationError('This user has a pending friend request');
    }
    console.error('Error sending friend request:', error);
    throw new DatabaseError(`Failed to sending friend request: ${error.message}`);
  }

  return friendId;
}

async function generateEmailPayload(
  params: {
    recipientEmail: string;
    senderName: string;
    invitationToken: string;
  }
): Promise<EmailTemplate> {
  return {
    template_id: SENDGRID_TEMPLATE_ID,
    personalizations: [{
      to: [{ email: params.recipientEmail }],
      dynamic_template_data: {
        sender_name: params.senderName,
        task_title: params.taskTitle,
        view_invitacion: `${APP_BASE_URL}/invitation/${params.invitationToken}`,
      }
    }],
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME
    }
  };
}


async function sendEmail(emailPayload: EmailTemplate): Promise<void> {
  const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
  if (!SENDGRID_API_KEY) {
    throw new Error('Missing SendGrid API key');
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailPayload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('SendGrid API error:', errorText);
    throw new Error(`Failed to send email: ${errorText}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: CORS_HEADERS }
    );
  }

  try {
    const supabase = initializeSupabase();
    const body = await req.json();
    const validatedData = validateRequestBody(body);

   
    const [sender, task] = await Promise.all([
      getUserProfileById(supabase, validatedData.sender_id),
      getTaskDetails(supabase, validatedData.task_id)
    ]);

    
    let recipient_id: UserProfile | null;
    if (validatedData.is_email) {
      recipient_id = await getUserProfileByEmail(supabase, validatedData.recipient_id);
      
      if (!recipient_id) {
        throw new ValidationError('User not found with this email');
      }
    } else {
      recipient_id = await getUserProfileById(supabase, validatedData.recipient_id);
    }

    const invitationToken = await createPendingSharedTask(
      supabase,
      validatedData.task_id,
      validatedData.sender_id,
      recipient_id.id
    );


    const emailPayload = await generateEmailPayload({
      recipientEmail: recipient_id.email,
      senderName: sender.full_name,
      taskTitle: task.title,
      taskDescription: task.description,
      invitationToken
    });

    await sendEmail(emailPayload);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Invitation sent successfully',
        invitation_token: invitationToken
      }),
      { status: 200, headers: CORS_HEADERS }
    );

  } catch (error) {
    console.error('Error processing request:', error);

    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };

    const status = error instanceof ValidationError ? 400 : 500;

    return new Response(
      JSON.stringify(errorResponse),
      { status, headers: CORS_HEADERS }
    );
  }
});

export const config = {
  path: '/friend-request'
};