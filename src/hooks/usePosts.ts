import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  topic_id: string;
  academic_level: 'ssc' | 'hsc' | 'honours';
  read_time: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export function useLatestPosts(limit = 6) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        setPosts(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch posts');
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [limit]);

  return { posts, loading, error };
}

export function useTopicPosts(topicId?: string, levelFilter = 'all') {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        let query = supabase.from('posts').select('*');
        
        if (topicId && topicId !== 'all') {
          query = query.eq('topic_id', topicId);
        }
        
        if (levelFilter && levelFilter !== 'all') {
          query = query.eq('academic_level', levelFilter);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        setPosts(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch topic posts');
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [topicId, levelFilter]);

  return { posts, loading, error };
}

export function usePost(slug?: string) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    async function fetchPost() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setPost(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch post');
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [slug]);

  return { post, loading, error };
}
