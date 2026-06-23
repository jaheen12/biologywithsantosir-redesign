import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface MCQ {
  id: string;
  question: string;
  options: string[];
  correct_option_index: number;
  explanation: string | null;
  topic_id: string;
  academic_level: 'ssc' | 'hsc' | 'honours';
  created_at: string;
}

export function useMCQs(topicId = 'all', levelFilter = 'all') {
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMCQs() {
      try {
        setLoading(true);
        setError(null);
        let query = supabase.from('mcqs').select('*');

        if (topicId && topicId !== 'all') {
          query = query.eq('topic_id', topicId);
        }

        if (levelFilter && levelFilter !== 'all') {
          query = query.eq('academic_level', levelFilter);
        }

        const { data, error: err } = await query.order('created_at', { ascending: true });

        if (err) throw err;
        setMcqs(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch MCQs');
      } finally {
        setLoading(false);
      }
    }

    fetchMCQs();
  }, [topicId, levelFilter]);

  return { mcqs, loading, error };
}
