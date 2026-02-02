-- 1. Create the 'posts' table
CREATE TABLE public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    content TEXT NOT NULL,
    image TEXT,
    likes JSONB DEFAULT '[]'::jsonb,
    comment_count INTEGER DEFAULT 0,
    timestamp BIGINT, -- Stores the JavaScript Date.now()
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the 'comments' table
CREATE TABLE public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    content TEXT NOT NULL,
    timestamp BIGINT, -- Stores the JavaScript Date.now()
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Realtime replication for both tables
-- This allows the app to receive live updates when data changes.
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;

-- 4. Set up Row Level Security (RLS)
-- Since the app uses client-side "simulated" auth (local storage), 
-- we need to allow public access to these tables for the API to work with the anon key.

-- Enable RLS on tables
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (SELECT, INSERT, UPDATE, DELETE) for everyone
CREATE POLICY "Enable all access for public on posts" 
ON public.posts FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Enable all access for public on comments" 
ON public.comments FOR ALL 
USING (true) 
WITH CHECK (true);
