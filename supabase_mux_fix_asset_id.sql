-- Fix: Make mux_asset_id nullable since it's not available until upload completes
ALTER TABLE public.videos 
  ALTER COLUMN mux_asset_id DROP NOT NULL;
