-- Create videos table for storing video metadata
-- This table links to Mux video assets

CREATE TABLE IF NOT EXISTS public.videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  section TEXT NOT NULL CHECK (section IN ('introduction', 'lr', 'rc', 'final-tips')),
  mux_asset_id TEXT UNIQUE,
  mux_playback_id TEXT,
  mux_upload_id TEXT,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'errored')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read videos (for members to view)
CREATE POLICY "Anyone can view videos" ON public.videos
  FOR SELECT
  USING (true);

-- Policy: Only admins can insert videos
CREATE POLICY "Only admins can create videos" ON public.videos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Only admins can update videos
CREATE POLICY "Only admins can update videos" ON public.videos
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Only admins can delete videos
CREATE POLICY "Only admins can delete videos" ON public.videos
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_videos_section ON public.videos(section);
CREATE INDEX IF NOT EXISTS idx_videos_status ON public.videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_mux_asset_id ON public.videos(mux_asset_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
