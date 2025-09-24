'use client';

import { useState } from 'react';

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface NotesListProps {
  notes: Note[];
  onDeleteNote: (noteId: number) => void;
  loading: boolean;
}

export default function NotesList({ notes, onDeleteNote, loading }: NotesListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (noteId: number) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setDeletingId(noteId);
      await onDeleteNote(noteId);
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && notes.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Notes</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Notes ({notes.length})
      </h2>

      {notes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No notes yet. Create your first note!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {note.title}
                  </h3>
                  <p className="text-gray-600 mb-3 whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <div className="text-sm text-gray-500">
                    Created: {formatDate(note.created_at)}
                    {note.updated_at !== note.created_at && (
                      <span className="ml-2">
                        • Updated: {formatDate(note.updated_at)}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(note.id)}
                  disabled={deletingId === note.id || loading}
                  className="ml-4 text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingId === note.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
