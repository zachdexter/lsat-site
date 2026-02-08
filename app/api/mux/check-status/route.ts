import { NextRequest, NextResponse } from 'next/server';
import { mux } from '../../../../lib/mux';
import { createServerSupabaseClient } from '../../../../lib/supabaseServer';

// This endpoint checks the status of a Mux upload and updates the database
export async function POST(req: NextRequest) {
  try {
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

    // Get video ID from request
    const { videoId } = await req.json();

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    // Get video record from database
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('mux_upload_id, mux_asset_id')
      .eq('id', videoId)
      .maybeSingle();

    if (videoError || !video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Check Mux upload status
    if (video.mux_upload_id) {
      try {
        // Verify Mux client is initialized
        if (!mux || !mux.video || !mux.video.uploads) {
          console.error('Mux client not properly initialized');
          return NextResponse.json(
            { error: 'Mux client not initialized', details: 'Check MUX_TOKEN_ID and MUX_TOKEN_SECRET' },
            { status: 500 }
          );
        }

        const muxUpload = await mux.video.uploads.retrieve(video.mux_upload_id);
        
        // If upload has an asset_id, the video is ready
        if (muxUpload.asset_id) {
          // Get the asset to get playback_id
          const asset = await mux.video.assets.retrieve(muxUpload.asset_id);
          const playbackId = asset.playback_ids?.[0]?.id;

          // Update database
          const { error: updateError } = await supabase
            .from('videos')
            .update({
              mux_asset_id: muxUpload.asset_id,
              mux_playback_id: playbackId || null,
              status: 'ready',
            })
            .eq('id', videoId);

          if (updateError) {
            console.error('Error updating video:', updateError);
            return NextResponse.json(
              { error: 'Failed to update video', details: updateError.message },
              { status: 500 }
            );
          }

          return NextResponse.json({
            success: true,
            status: 'ready',
            asset_id: muxUpload.asset_id,
            playback_id: playbackId,
          });
        } else if (muxUpload.status === 'errored' || muxUpload.status === 'cancelled' || muxUpload.status === 'timed_out') {
          // Upload failed
          await supabase
            .from('videos')
            .update({ status: 'errored' })
            .eq('id', videoId);

          return NextResponse.json({
            success: true,
            status: 'errored',
          });
        } else {
          // Still processing
          return NextResponse.json({
            success: true,
            status: 'processing',
          });
        }
      } catch (muxError) {
        return NextResponse.json(
          { error: 'Failed to check Mux status', details: muxError instanceof Error ? muxError.message : 'Unknown error' },
          { status: 500 }
        );
      }
    } else if (video.mux_asset_id) {
      // Video already has asset_id, check asset status directly
      try {
        const asset = await mux.video.assets.retrieve(video.mux_asset_id);
        const playbackId = asset.playback_ids?.[0]?.id;

        const status = asset.status === 'ready' ? 'ready' : 'processing';

        await supabase
          .from('videos')
          .update({
            mux_playback_id: playbackId || null,
            status,
          })
          .eq('id', videoId);

        return NextResponse.json({
          success: true,
          status,
          playback_id: playbackId,
        });
      } catch (muxError) {
        return NextResponse.json(
          { error: 'Failed to check asset status', details: muxError instanceof Error ? muxError.message : 'Unknown error' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json({ error: 'Video has no Mux upload or asset ID' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
