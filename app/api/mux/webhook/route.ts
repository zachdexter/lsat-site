import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabaseServer';
import crypto from 'crypto';

// Mux webhook handler
// This receives notifications when videos are processed
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('mux-signature');

    // Verify webhook signature (optional but recommended)
    const webhookSecret = process.env.MUX_WEBHOOK_SECRET;
    if (webhookSecret && signature) {
      const hmac = crypto.createHmac('sha256', webhookSecret);
      hmac.update(body);
      const expectedSignature = hmac.digest('hex');

      if (signature !== expectedSignature) {
        console.error('Invalid Mux webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const event = JSON.parse(body);

    // Handle different event types
    if (event.type === 'video.asset.ready') {
      // Video is ready for playback
      const assetId = event.data.id;
      const playbackId = event.data.playback_ids?.[0]?.id;
      const passthrough = event.data.passthrough;

      if (!assetId) {
        return NextResponse.json({ error: 'Missing asset ID' }, { status: 400 });
      }

      // Update video record in database
      const supabase = createServerSupabaseClient();
      
      let videoId: string | null = null;
      
      // Priority 1: Try to get videoId from passthrough (most reliable)
      if (passthrough) {
        try {
          const passthroughData = JSON.parse(passthrough);
          videoId = passthroughData.videoId;
        } catch (e) {
          // Passthrough parsing failed, will use fallback methods
        }
      }

      let updateError = null;

      // If we have videoId from passthrough, update directly (most reliable method)
      if (videoId) {
        const { error } = await supabase
          .from('videos')
          .update({
            mux_asset_id: assetId,
            mux_playback_id: playbackId,
            status: 'ready',
          })
          .eq('id', videoId);

        if (error) {
          updateError = error;
        } else {
          return NextResponse.json({ received: true });
        }
      }

      // Priority 2: Fallback - try to update by asset_id (for videos uploaded before passthrough was added)
      if (updateError || !videoId) {
        const { data: existingVideo, error: checkError } = await supabase
          .from('videos')
          .select('id')
          .eq('mux_asset_id', assetId)
          .maybeSingle();

        if (!checkError && existingVideo) {
          // Video already has this asset_id, update it
          const { error } = await supabase
            .from('videos')
            .update({
              mux_playback_id: playbackId,
              status: 'ready',
            })
            .eq('id', existingVideo.id);

          if (error) {
            updateError = error;
          } else {
            return NextResponse.json({ received: true });
          }
        }
      }

      // Priority 3: Last resort - find most recent processing video with null asset_id
      // (This handles edge cases but is less reliable)
      if (updateError || !videoId) {
        const { data: videoToUpdate } = await supabase
          .from('videos')
          .select('id')
          .is('mux_asset_id', null)
          .eq('status', 'processing')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (videoToUpdate) {
          const { error } = await supabase
            .from('videos')
            .update({
              mux_asset_id: assetId,
              mux_playback_id: playbackId,
              status: 'ready',
            })
            .eq('id', videoToUpdate.id);
          
          if (error) {
            updateError = error;
          } else {
            return NextResponse.json({ received: true });
          }
        }
      }

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update video status', details: updateError.message },
          { status: 500 }
        );
      }

      // If we get here, we couldn't find a matching video
      return NextResponse.json({ received: true, warning: 'No matching video found' });
    } else if (event.type === 'video.asset.errored') {
      // Video processing failed
      const assetId = event.data.id;
      const passthrough = event.data.passthrough;

      if (!assetId) {
        return NextResponse.json({ error: 'Missing asset ID' }, { status: 400 });
      }

      const supabase = createServerSupabaseClient();
      let videoId: string | null = null;

      // Try to get videoId from passthrough first
      if (passthrough) {
        try {
          const passthroughData = JSON.parse(passthrough);
          videoId = passthroughData.videoId;
        } catch (e) {
          // Passthrough parsing failed, will use fallback
        }
      }

      let updateError = null;

      // Priority 1: Update by videoId from passthrough
      if (videoId) {
        const { error } = await supabase
          .from('videos')
          .update({
            status: 'errored',
          })
          .eq('id', videoId);

        if (error) {
          updateError = error;
        } else {
          return NextResponse.json({ received: true });
        }
      }

      // Priority 2: Fallback to asset_id matching
      if (updateError || !videoId) {
        const { error } = await supabase
          .from('videos')
          .update({
            status: 'errored',
          })
          .eq('mux_asset_id', assetId);

        if (!error) {
          return NextResponse.json({ received: true });
        }
      }
    } else if (event.type === 'video.upload.asset_created') {
      // This event indicates an asset has been created from an upload
      // We can use this to link the upload to the asset early
      const uploadId = event.data.id;
      const assetId = event.data.asset_id;
      const passthrough = event.data.passthrough;

      let videoId: string | null = null;
      if (passthrough) {
        try {
          const passthroughData = JSON.parse(passthrough);
          videoId = passthroughData.videoId;
        } catch (e) {
          // Passthrough parsing failed
        }
      }

      if (videoId && assetId) {
        const supabase = createServerSupabaseClient();
        await supabase
          .from('videos')
          .update({ mux_asset_id: assetId })
          .eq('id', videoId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Mux webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
