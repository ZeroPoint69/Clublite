-- ==========================================================
-- CLUB LITE - RICH SEED DATA
-- ==========================================================
-- This script populates your Supabase tables with a variety 
-- of realistic posts and comments to test your UI.
-- ==========================================================

-- Clean up existing seed data to avoid primary key conflicts if re-run
DELETE FROM public.comments WHERE user_id LIKE 'seed_%';
DELETE FROM public.posts WHERE user_id LIKE 'seed_%';

-- 1. Insert an Official Announcement (with Image)
INSERT INTO public.posts (
    id, 
    user_id, 
    user_name, 
    user_avatar, 
    content, 
    image, 
    likes, 
    comment_count, 
    timestamp
)
VALUES (
    'a1111111-1111-1111-1111-111111111111', 
    'seed_admin_01', 
    'Alex Rivera (Admin)', 
    'https://ui-avatars.com/api/?name=Alex+Rivera&background=1877F2&color=fff',
    'Welcome to the official ClubLite platform! 🚀 We built this to make our club communication faster and more fun. Check out the "AI Polish" button when you write your next post—it uses Gemini to make your text look professional in one click!',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop',
    '["seed_user_02", "seed_user_03", "seed_user_04"]'::jsonb, 
    3,
    (EXTRACT(EPOCH FROM NOW()) * 1000 - 172800000)::BIGINT -- 2 days ago
);

-- 2. Insert a Social Activity Post (with Image)
INSERT INTO public.posts (
    id, 
    user_id, 
    user_name, 
    user_avatar, 
    content, 
    image, 
    likes, 
    comment_count, 
    timestamp
)
VALUES (
    'b2222222-2222-2222-2222-222222222222',
    'seed_user_02', 
    'Sarah Chen', 
    'https://ui-avatars.com/api/?name=Sarah+Chen&background=random&color=fff',
    'Had such an amazing time at the charity run this morning! Thanks to everyone who came out to support the cause. We raised over $2,000! 🏃‍♀️💨',
    'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=2074&auto=format&fit=crop',
    '["seed_admin_01", "seed_user_03"]'::jsonb, 
    2,
    (EXTRACT(EPOCH FROM NOW()) * 1000 - 36000000)::BIGINT -- 10 hours ago
);

-- 3. Insert a Text-only Question Post
INSERT INTO public.posts (
    id, 
    user_id, 
    user_name, 
    user_avatar, 
    content, 
    image, 
    likes, 
    comment_count, 
    timestamp
)
VALUES (
    'c3333333-3333-3333-3333-333333333333',
    'seed_user_03', 
    'Marcus Thorne', 
    'https://ui-avatars.com/api/?name=Marcus+Thorne&background=random&color=fff',
    'Does anyone have a recommendation for a good catering service for our next mixer? Needs to have vegetarian options! 🥗',
    NULL,
    '[]'::jsonb, 
    1,
    (EXTRACT(EPOCH FROM NOW()) * 1000 - 7200000)::BIGINT -- 2 hours ago
);

-- 4. Insert Comments for the Announcement
INSERT INTO public.comments (post_id, user_id, user_name, user_avatar, content, timestamp)
VALUES
('a1111111-1111-1111-1111-111111111111', 'seed_user_02', 'Sarah Chen', 'https://ui-avatars.com/api/?name=Sarah+Chen', 'This looks so much cleaner than the old WhatsApp group!', (EXTRACT(EPOCH FROM NOW()) * 1000 - 150000000)::BIGINT),
('a1111111-1111-1111-1111-111111111111', 'seed_user_03', 'Marcus Thorne', 'https://ui-avatars.com/api/?name=Marcus+Thorne', 'The AI polish feature is actually really helpful for my announcements.', (EXTRACT(EPOCH FROM NOW()) * 1000 - 140000000)::BIGINT),
('a1111111-1111-1111-1111-111111111111', 'seed_user_04', 'Lila Vance', 'https://ui-avatars.com/api/?name=Lila+Vance', 'Finally! Great job Alex.', (EXTRACT(EPOCH FROM NOW()) * 1000 - 130000000)::BIGINT);

-- 5. Insert Comments for Sarah's Running Post
INSERT INTO public.comments (post_id, user_id, user_name, user_avatar, content, timestamp)
VALUES
('b2222222-2222-2222-2222-222222222222', 'seed_admin_01', 'Alex Rivera (Admin)', 'https://ui-avatars.com/api/?name=Alex+Rivera', 'Incredible work Sarah! You crushed it.', (EXTRACT(EPOCH FROM NOW()) * 1000 - 30000000)::BIGINT),
('b2222222-2222-2222-2222-222222222222', 'seed_user_04', 'Lila Vance', 'https://ui-avatars.com/api/?name=Lila+Vance', 'Sorry I missed it, looks like a blast!', (EXTRACT(EPOCH FROM NOW()) * 1000 - 20000000)::BIGINT);

-- 6. Insert Comment for Marcus's Question
INSERT INTO public.comments (post_id, user_id, user_name, user_avatar, content, timestamp)
VALUES
('c3333333-3333-3333-3333-333333333333', 'seed_user_02', 'Sarah Chen', 'https://ui-avatars.com/api/?name=Sarah+Chen', 'I have a contact for a great Mediterranean spot. I will DM you!', (EXTRACT(EPOCH FROM NOW()) * 1000 - 3600000)::BIGINT);
