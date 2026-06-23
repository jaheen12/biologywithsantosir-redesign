import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Note {
  id: string;
  title: string;
  academic_level: 'ssc' | 'hsc' | 'honours';
  subject: string;
  pdf_path: string;
  size_mb: number;
  download_count: number;
  created_at: string;
}

export function useNotes(levelFilter = 'all') {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNotes() {
      try {
        setLoading(true);
        setError(null);
        let query = supabase.from('notes').select('*');

        if (levelFilter && levelFilter !== 'all') {
          query = query.eq('academic_level', levelFilter);
        }

        const { data, error: err } = await query.order('created_at', { ascending: false });

        if (err) throw err;
        setNotes(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch notes');
      } finally {
        setLoading(false);
      }
    }

    fetchNotes();
  }, [levelFilter]);

  return { notes, loading, error };
}

export async function trackDownload(noteId: string, currentCount: number) {
  try {
    await supabase
      .from('notes')
      .update({ download_count: currentCount + 1 })
      .eq('id', noteId);
  } catch (err) {
    console.error('Failed to track download count', err);
  }
}
