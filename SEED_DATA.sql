
-- ==========================================================
-- CLUB LITE - PRODUCTION CLEANUP SCRIPT
-- ==========================================================

-- Warning: Running this will delete ALL user-generated content and profiles.
-- This is intended for preparing a fresh production environment.

BEGIN;
  DELETE FROM public.notifications;
  DELETE FROM public.comments;
  DELETE FROM public.posts;
  DELETE FROM public.profiles;
COMMIT;

-- After running this, the first user to Sign Up will be the new owner/admin 
-- if they use the correct secret code.
