-- Create PDFs table for storing PDF metadata
-- PDFs are stored in Supabase Storage

CREATE TABLE IF NOT EXISTS public.pdfs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  section TEXT NOT NULL CHECK (section IN ('introduction', 'lr', 'rc', 'final-tips')),
  file_path TEXT NOT NULL, -- Path in Supabase Storage
  file_size BIGINT, -- File size in bytes
  file_name TEXT NOT NULL, -- Original filename
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.pdfs ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read PDFs (for members to view)
CREATE POLICY "Anyone can view PDFs" ON public.pdfs
  FOR SELECT
  USING (true);

-- Policy: Only admins can insert PDFs
CREATE POLICY "Only admins can create PDFs" ON public.pdfs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Only admins can update PDFs
CREATE POLICY "Only admins can update PDFs" ON public.pdfs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Only admins can delete PDFs
CREATE POLICY "Only admins can delete PDFs" ON public.pdfs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_pdfs_section ON public.pdfs(section);
CREATE INDEX IF NOT EXISTS idx_pdfs_file_path ON public.pdfs(file_path);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pdfs_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_pdfs_updated_at
  BEFORE UPDATE ON public.pdfs
  FOR EACH ROW
  EXECUTE FUNCTION update_pdfs_updated_at_column();
