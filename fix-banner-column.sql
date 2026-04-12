-- RUN THIS IN THE SUPABASE SQL EDITOR:
-- This adds the missing banner_url column to your profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;
