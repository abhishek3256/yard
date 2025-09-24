'use client';

import { useState, useEffect } from 'react';
import LoginForm from '@/components/LoginForm';
import NotesList from '@/components/NotesList';
import CreateNoteForm from '@/components/CreateNoteForm';
import UpgradePrompt from '@/components/UpgradePrompt';

interface User {
  id: number;
  email: string;
  role: string;
  tenantId: number;
}

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface Tenant {
  id: number;
  name: string;
  slug: string;
  subscription_plan: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing token on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserData(token);
    }
  }, []);

  const fetchUserData = async (token: string) => {
    try {
      setLoading(true);
      
      // Fetch notes
      const notesResponse = await fetch('/api/notes', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (notesResponse.ok) {
        const notesData = await notesResponse.json();
        setNotes(notesData);
      }

      // Fetch tenant info (we'll get this from the user data)
      const userData = JSON.parse(atob(token.split('.')[1]));
      setUser({
        id: userData.userId,
        email: userData.email,
        role: userData.role,
        tenantId: userData.tenantId,
      });

      // Mock tenant data for demo
      setTenant({
        id: userData.tenantId,
        name: userData.tenantId === 1 ? 'Acme Corp' : 'Globex Corp',
        slug: userData.tenantId === 1 ? 'acme' : 'globex',
        subscription_plan: 'free', // This would come from API in real app
      });

    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        await fetchUserData(data.token);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setNotes([]);
    setTenant(null);
  };

  const handleCreateNote = async (title: string, content: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      const data = await response.json();

      if (response.ok) {
        setNotes([data, ...notes]);
        setError(null);
      } else {
        setError(data.error || 'Failed to create note');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotes(notes.filter(note => note.id !== noteId));
        setError(null);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete note');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/tenants/${tenant?.slug}/upgrade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setTenant({ ...tenant!, subscription_plan: 'pro' });
        setError(null);
        alert('Successfully upgraded to Pro plan!');
      } else {
        setError(data.error || 'Failed to upgrade');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Multi-Tenant Notes SaaS
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sign in to your account
            </p>
          </div>
          <LoginForm onLogin={handleLogin} loading={loading} error={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Notes App - {tenant?.name}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.email} ({user.role})
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                tenant?.subscription_plan === 'pro' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {tenant?.subscription_plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {tenant?.subscription_plan === 'free' && notes.length >= 3 && (
            <UpgradePrompt onUpgrade={handleUpgrade} loading={loading} />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <CreateNoteForm 
                onCreateNote={handleCreateNote} 
                loading={loading}
                disabled={tenant?.subscription_plan === 'free' && notes.length >= 3}
              />
            </div>
            <div className="lg:col-span-2">
              <NotesList 
                notes={notes} 
                onDeleteNote={handleDeleteNote}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
