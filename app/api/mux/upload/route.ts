import { NextRequest, NextResponse } from 'next/server';
import { mux } from '../../../../lib/mux';
import { createServerSupabaseClient } from '../../../../lib/supabaseServer';

// This endpoint creates a Mux Direct Upload URL
// The admin will upload directly from the browser to Mux
export async function POST(req: NextRequest) {
  try {
    // Check if Mux credentials are configured
    if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
      console.error('Mux credentials not configured');
      return NextResponse.json(
        { error: 'Mux credentials not configured. Please check MUX_TOKEN_ID and MUX_TOKEN_SECRET environment variables.' },
        { status: 500 }
      );
    }

    // Verify admin authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify the token and check if user is admin
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const user = await response.json();
    if (!user || !user.id) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    // Check if user is admin
    const supabase = createServerSupabaseClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get request body
    const { title, section } = await req.json();

    if (!title || !section) {
      return NextResponse.json({ error: 'Title and section are required' }, { status: 400 });
    }

    // Create video record first to get the ID (needed for passthrough)
    const { data: video, error: dbError } = await supabase
      .from('videos')
      .insert({
        title,
        section,
        status: 'processing',
        created_by: user.id,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error creating video record:', dbError);
      return NextResponse.json(
        { error: 'Failed to create video record', details: dbError.message },
        { status: 500 }
      );
    }

    // Create a Mux Direct Upload with passthrough containing videoId
    let upload;
    try {
      upload = await mux.video.uploads.create({
        cors_origin: '*', // Allow uploads from any origin (you can restrict this in production)
        new_asset_settings: {
          playback_policies: ['public'], // Public playback (no signed URLs needed)
          passthrough: JSON.stringify({ videoId: video.id }), // Link to our video record
        },
      });
    } catch (muxError) {
      console.error('Mux API error details:', {
        error: muxError,
        message: muxError instanceof Error ? muxError.message : 'Unknown',
        stack: muxError instanceof Error ? muxError.stack : undefined,
      });
      // Clean up: delete the video record if Mux upload creation fails
      await supabase.from('videos').delete().eq('id', video.id);
      return NextResponse.json(
        { 
          error: 'Mux API error', 
          details: muxError instanceof Error ? muxError.message : 'Unknown error' 
        },
        { status: 500 }
      );
    }

    // Update video record with mux_upload_id and asset_id if available
    const { error: updateError } = await supabase
      .from('videos')
      .update({
        mux_upload_id: upload.id,
        mux_asset_id: upload.asset_id || null,
      })
      .eq('id', video.id);

    if (updateError) {
      // Note: Upload was created, but we couldn't update the record. The webhook will handle it.
    }


    return NextResponse.json({
      uploadId: upload.id,
      uploadUrl: upload.url,
      videoId: video.id,
      assetId: upload.asset_id,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}
