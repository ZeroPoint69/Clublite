
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

-- 3. Enable Realtime replication
-- Note: This is simplified, COMPLETE_SETUP.sql handles this better
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 4. DROP and CREATE policies
DROP POLICY IF EXISTS "Enable all access for public on posts" ON public.posts;
DROP POLICY IF EXISTS "Enable all access for public on comments" ON public.comments;

CREATE POLICY "Enable all access for public on posts" 
ON public.posts FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Enable all access for public on comments" 
ON public.comments FOR ALL 
USING (true) 
WITH CHECK (true);
