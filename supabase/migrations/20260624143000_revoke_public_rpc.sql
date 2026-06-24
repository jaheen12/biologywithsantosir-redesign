REVOKE EXECUTE ON FUNCTION public.delete_user_by_admin FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_all_exam_stats_for_student FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_batch_leaderboard FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_exam_stats FROM anon, authenticated;
