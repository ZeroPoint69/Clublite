-- ==========================================================
-- CLUB LITE - SUPABASE COMPLETE SETUP SCRIPT
-- ==========================================================
-- Run this script in your Supabase SQL Editor to set up
-- everything needed for the application to function.

-- 0. Enable extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Create the 'posts' table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    content TEXT NOT NULL,
    image TEXT,
    likes JSONB DEFAULT '[]'::jsonb,
    comment_count INTEGER DEFAULT 0,
    timestamp BIGINT, -- Stores JavaScript Date.now()
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the 'comments' table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    content TEXT NOT NULL,
    timestamp BIGINT, -- Stores JavaScript Date.now()
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Realtime for both tables
-- This is critical for the "Live Sync" features to work.
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.posts, public.comments;
COMMIT;

-- 4. Set up Row Level Security (RLS)
-- We enable RLS and allow public access for the anon key as per current design.
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid errors on re-run
DROP POLICY IF EXISTS "Enable all access for public on posts" ON public.posts;
DROP POLICY IF EXISTS "Enable all access for public on comments" ON public.comments;

-- Create broad policies for the club environment
CREATE POLICY "Enable all access for public on posts" 
ON public.posts FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Enable all access for public on comments" 
ON public.comments FOR ALL 
USING (true) 
WITH CHECK (true);

-- 5. Insert Initial Seed Data (Optional but recommended)
-- Only inserts if the table is empty to avoid duplicates
INSERT INTO public.posts (id, user_id, user_name, user_avatar, content, image, likes, comment_count, timestamp)
SELECT 
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
    'admin_system', 
    'Club Lite Welcome', 
    'https://ui-avatars.com/api/?name=Club+Lite&background=1877F2&color=fff',
    'Welcome to your new club communication platform! This app features real-time updates, AI-assisted polishing, and a lightweight experience. Try creating a post or commenting below! 🚀',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop',
    '[]'::jsonb,
    1,
    (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
WHERE NOT EXISTS (SELECT 1 FROM public.posts WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

INSERT INTO public.comments (post_id, user_id, user_name, user_avatar, content, timestamp)
SELECT 
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'admin_system',
    'Club Lite AI',
    'https://ui-avatars.com/api/?name=AI&background=000&color=fff',
    'Dont forget to try the AI Polish button when writing a post!',
    (EXTRACT(EPOCH FROM NOW()) * 1000 + 1000)::BIGINT
WHERE NOT EXISTS (SELECT 1 FROM public.comments WHERE post_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' AND content LIKE 'Dont forget%');
