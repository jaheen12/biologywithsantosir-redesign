'use client';

import React from 'react';
import { FileText, Download } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export interface Note {
  id: string;
  title: string;
  description: string | null;
  level: string;
  topic_id: string | null;
  storage_path: string;
  public_url: string | null;
  created_at: string;
}

interface NoteCardProps {
  note: Note;
}

export default function NoteCard({ note }: NoteCardProps) {
  // Safe fallback if public_url is empty
  const downloadUrl = note.public_url || '#';

  return (
    <div className="bg-surface border border-border rounded-xl p-5 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full group font-ui">
      <div>
        {/* PDF Document Icon & Level Badge */}
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-primary-light text-primary rounded-xl group-hover:scale-105 transition-transform duration-200">
            <FileText size={26} />
          </div>
          <Badge variant={note.level as any}>{note.level.toUpperCase()}</Badge>
        </div>

        {/* Title */}
        <h3 className="text-[1rem] font-bold text-text-primary leading-snug mb-2 group-hover:text-primary transition-colors">
          {note.title}
        </h3>

        {/* Description */}
        {note.description && (
          <p className="text-[0.875rem] text-text-secondary leading-relaxed mb-6 line-clamp-2">
            {note.description}
          </p>
        )}
      </div>

      {/* Download Action Button */}
      <a
        href={downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full mt-auto block"
      >
        <Button variant="primary" className="w-full gap-2 min-h-[48px] flex items-center justify-center text-[0.9375rem]">
          <Download size={16} /> ডাউনলোড করুন (Download)
        </Button>
      </a>
    </div>
  );
}
