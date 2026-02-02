-- ==========================================================
-- SEED DATA SCRIPT
-- Copy and paste this into the Supabase SQL Editor to add
-- sample posts and comments to your app.
-- ==========================================================

-- 1. Insert a Welcome Post
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
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- Static UUID for the post
    'user_admin_01', 
    'Club Administrator', 
    'https://ui-avatars.com/api/?name=Club+Admin&background=0D8ABC&color=fff',
    'Welcome to ClubLite! 🚀 This is a lightweight, real-time social platform for our club members. Feel free to introduce yourself in the comments below!',
    'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=2070&auto=format&fit=crop', -- Optional Image
    '["user_02", "user_03"]'::jsonb, -- 2 initial likes
    2,
    (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT -- Current timestamp in ms
);

-- 2. Insert a Text-only Post
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
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'user_sarah_01', 
    'Sarah Jenkins', 
    'https://ui-avatars.com/api/?name=Sarah+Jenkins&background=random&color=fff',
    'Does anyone know what time the meetup starts this Saturday? really excited to see everyone! 😊',
    NULL,
    '[]'::jsonb, 
    1,
    (EXTRACT(EPOCH FROM NOW()) * 1000 - 3600000)::BIGINT -- 1 hour ago
);

-- 3. Insert Comments for the Welcome Post
INSERT INTO public.comments (
    post_id, 
    user_id, 
    user_name, 
    user_avatar, 
    content, 
    timestamp
)
VALUES
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- Links to Welcome Post
    'user_mike_01',
    'Mike Ross',
    'https://ui-avatars.com/api/?name=Mike+Ross&background=random',
    'Thanks for setting this up! Looks great.',
    (EXTRACT(EPOCH FROM NOW()) * 1000 - 60000)::BIGINT
),
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- Links to Welcome Post
    'user_sarah_01',
    'Sarah Jenkins',
    'https://ui-avatars.com/api/?name=Sarah+Jenkins&background=random',
    'Love the new design!',
    (EXTRACT(EPOCH FROM NOW()) * 1000 - 30000)::BIGINT
);

-- 4. Insert Comment for Sarah's Post
INSERT INTO public.comments (
    post_id, 
    user_id, 
    user_name, 
    user_avatar, 
    content, 
    timestamp
)
VALUES
(
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', -- Links to Sarah's Post
    'user_admin_01',
    'Club Administrator',
    'https://ui-avatars.com/api/?name=Club+Admin&background=0D8ABC&color=fff',
    'Hey Sarah! Doors open at 10:00 AM.',
    (EXTRACT(EPOCH FROM NOW()) * 1000 - 1800000)::BIGINT
);
