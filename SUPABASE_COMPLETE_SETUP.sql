
-- ==========================================================
-- CLUB LITE - SUPABASE COMPLETE SETUP SCRIPT
-- ==========================================================

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
    timestamp BIGINT,
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
    timestamp BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create the 'notifications' table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Recipient
    actor_id TEXT NOT NULL, -- Who triggered it
    actor_name TEXT NOT NULL,
    actor_avatar TEXT,
    type TEXT NOT NULL, -- LIKE, COMMENT, NEW_POST
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    content TEXT,
    is_read BOOLEAN DEFAULT false,
    timestamp BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Realtime
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.posts, public.comments, public.notifications;
COMMIT;

-- 5. RLS Policies
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for public on posts" ON public.posts;
CREATE POLICY "Enable all access for public on posts" ON public.posts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for public on comments" ON public.comments;
CREATE POLICY "Enable all access for public on comments" ON public.comments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for public on notifications" ON public.notifications;
CREATE POLICY "Enable all access for public on notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
