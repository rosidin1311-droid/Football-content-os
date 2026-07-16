'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase-client';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setMessage('Cek email kamu untuk konfirmasi akun, lalu login.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }

    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lime font-mono text-sm animate-pulse">Memuat...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col justify-center px-6 py-12">
        <div className="max-w-sm mx-auto w-full">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-full bg-lime flex items-center justify-center text-2xl">
              ⚽
            </div>
            <div>
              <div className="font-display font-black text-xl tracking-wide text-lime uppercase">
                Football OS
              </div>
              <div className="text-[10px] text-gray-500 tracking-widest uppercase">
                Content Planner
              </div>
            </div>
          </div>

          <div className="bg-panel border border-lime/20 rounded-lg p-6">
            <div className="flex gap-2 mb-6 bg-black/30 rounded-md p-1">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-2 rounded text-sm font-semibold uppercase tracking-wide transition ${
                  mode === 'login' ? 'bg-lime text-dark' : 'text-gray-400'
                }`}
              >
                Masuk
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 rounded text-sm font-semibold uppercase tracking-wide transition ${
                  mode === 'signup' ? 'bg-lime text-dark' : 'text-gray-400'
                }`}
              >
                Daftar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dark border border-lime/20 rounded-md px-4 py-3 text-sm text-white focus:outline-none focus:border-lime"
                  placeholder="kamu@email.com"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark border border-lime/20 rounded-md px-4 py-3 text-sm text-white focus:outline-none focus:border-lime"
                  placeholder="Minimal 6 karakter"
                />
              </div>

              {error && (
                <div className="text-red-card text-xs bg-red-card/10 border border-red-card/30 rounded px-3 py-2">
                  {error}
                </div>
              )}
              {message && (
                <div className="text-lime text-xs bg-lime/10 border border-lime/30 rounded px-3 py-2">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="bg-lime text-dark font-display font-bold uppercase tracking-wide py-3 rounded-md text-sm mt-2 disabled:opacity-50"
              >
                {submitting ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Buat Akun'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
