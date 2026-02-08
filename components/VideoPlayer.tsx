'use client';

import { useEffect, useRef } from 'react';
import MuxPlayer from '@mux/mux-player-react';

type VideoPlayerProps = {
  playbackId: string;
  title: string;
};

export function VideoPlayer({ playbackId, title }: VideoPlayerProps) {
  return (
    <div className="w-full">
      <MuxPlayer
        streamType="on-demand"
        playbackId={playbackId}
        metadata={{
          video_title: title,
        }}
        className="w-full rounded-lg"
      />
    </div>
  );
}
