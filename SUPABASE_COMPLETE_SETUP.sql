
-- ==========================================================
-- CLUB LITE - SUPABASE COMPLETE SETUP SCRIPT (UPDATED)
-- ==========================================================

-- 1. Create the 'profiles' table (ID is UUID but reference removed for easy demo seeding)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY, -- Changed to TEXT for more flexible seeding
    name TEXT NOT NULL,
    avatar TEXT,
    role TEXT DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the 'posts' table
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

-- 3. Create the 'comments' table
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

-- 4. Create the 'notifications' table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    actor_id TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    actor_avatar TEXT,
    type TEXT NOT NULL,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    content TEXT,
    is_read BOOLEAN DEFAULT false,
    timestamp BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Enable Realtime
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.posts, public.comments, public.notifications, public.profiles;
COMMIT;

-- 6. RLS Policies (Allowing public read/write for demo purposes)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for public on profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for public on posts" ON public.posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for public on comments" ON public.comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for public on notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
