-- Fix search path settings for security definer functions
-- Setting search_path to 'public' allows the functions to locate public relations 
-- (like tables and sequences) without raising 42P01 errors, which PostgREST translates to 404.
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.generate_receipt_number() SET search_path = public;
ALTER FUNCTION public.get_exam_stats(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.compute_grade() SET search_path = public;
ALTER FUNCTION public.get_batch_leaderboard(uuid) SET search_path = public;
ALTER FUNCTION public.get_all_exam_stats_for_student(uuid) SET search_path = public;
ALTER FUNCTION public.delete_user_by_admin(uuid) SET search_path = public;
