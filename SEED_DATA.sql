
-- ==========================================================
-- CLUB LITE - RICH SEED DATA (UPDATED WITH PROFILES)
-- ==========================================================

-- Clean up existing seed data
DELETE FROM public.comments WHERE user_id LIKE 'seed_%';
DELETE FROM public.posts WHERE user_id LIKE 'seed_%';
DELETE FROM public.profiles WHERE id LIKE 'seed_%';

-- 1. Insert Demo Profiles (The missing step!)
INSERT INTO public.profiles (id, name, avatar, role)
VALUES 
('seed_admin_01', 'Alex Rivera', 'https://ui-avatars.com/api/?name=Alex+Rivera&background=1877F2&color=fff', 'admin'),
('seed_user_02', 'Sarah Chen', 'https://ui-avatars.com/api/?name=Sarah+Chen&background=random&color=fff', 'member'),
('seed_user_03', 'Marcus Thorne', 'https://ui-avatars.com/api/?name=Marcus+Thorne&background=random&color=fff', 'member'),
('seed_user_04', 'Lila Vance', 'https://ui-avatars.com/api/?name=Lila+Vance&background=random&color=fff', 'member');

-- 2. Insert an Official Announcement
INSERT INTO public.posts (
    id, user_id, user_name, user_avatar, content, image, likes, comment_count, timestamp
)
VALUES (
    'a1111111-1111-1111-1111-111111111111', 
    'seed_admin_01', 
    'Alex Rivera (Admin)', 
    'https://ui-avatars.com/api/?name=Alex+Rivera&background=1877F2&color=fff',
    'Welcome to the official ClubLite platform! 🚀 We built this to make our club communication faster and more fun.',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop',
    '["seed_user_02", "seed_user_03"]'::jsonb, 
    3,
    (EXTRACT(EPOCH FROM NOW()) * 1000 - 172800000)::BIGINT
);

-- 3. Insert a Social Activity Post
INSERT INTO public.posts (
    id, user_id, user_name, user_avatar, content, image, likes, comment_count, timestamp
)
VALUES (
    'b2222222-2222-2222-2222-222222222222',
    'seed_user_02', 
    'Sarah Chen', 
    'https://ui-avatars.com/api/?name=Sarah+Chen&background=random&color=fff',
    'Had such an amazing time at the charity run this morning! Thanks to everyone who came out to support. 🏃‍♀️💨',
    'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=2074&auto=format&fit=crop',
    '["seed_admin_01"]'::jsonb, 
    2,
    (EXTRACT(EPOCH FROM NOW()) * 1000 - 36000000)::BIGINT
);

-- 4. Insert Comments for the Announcement
INSERT INTO public.comments (post_id, user_id, user_name, user_avatar, content, timestamp)
VALUES
('a1111111-1111-1111-1111-111111111111', 'seed_user_02', 'Sarah Chen', 'https://ui-avatars.com/api/?name=Sarah+Chen', 'This looks so much cleaner than the old group!', (EXTRACT(EPOCH FROM NOW()) * 1000 - 150000000)::BIGINT),
('a1111111-1111-1111-1111-111111111111', 'seed_user_03', 'Marcus Thorne', 'https://ui-avatars.com/api/?name=Marcus+Thorne', 'The interface is super fast. Good job Alex.', (EXTRACT(EPOCH FROM NOW()) * 1000 - 140000000)::BIGINT);
