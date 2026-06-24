ALTER FUNCTION public.handle_new_user() SECURITY DEFINER SET search_path = '';
ALTER FUNCTION public.generate_receipt_number() SECURITY DEFINER SET search_path = '';
ALTER FUNCTION public.get_exam_stats(uuid, uuid) SECURITY DEFINER SET search_path = '';
ALTER FUNCTION public.compute_grade() SECURITY DEFINER SET search_path = '';
ALTER FUNCTION public.get_batch_leaderboard(uuid) SECURITY DEFINER SET search_path = '';
ALTER FUNCTION public.get_all_exam_stats_for_student(uuid) SECURITY DEFINER SET search_path = '';
ALTER FUNCTION public.delete_user_by_admin(uuid) SECURITY DEFINER SET search_path = '';
