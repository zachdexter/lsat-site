import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabaseServer';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Use service role to check if user exists
    const supabase = createServerSupabaseClient();
    
    // Check if a user with this email exists using admin API
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error checking email:', error);
      // If we can't check, assume it doesn't exist to allow signup
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    const emailLower = email.toLowerCase().trim();
    const emailExists = users?.some(user => user.email?.toLowerCase() === emailLower) || false;

    return NextResponse.json({ exists: emailExists });
  } catch (error) {
    console.error('Error in check-email route:', error);
    // On error, assume email doesn't exist to allow signup
    return NextResponse.json({ exists: false }, { status: 200 });
  }
}
