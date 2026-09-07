import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { DisciplineBadge } from '@/components/profile/DisciplineBadge';
import { Avatar } from '@/components/ui/Avatar';
import { UserDiscipline } from '@/types/database.types';
import { Globe2, Gamepad2, Sparkles, Shield } from 'lucide-react';

const DISCIPLINES: { label: string; value: UserDiscipline }[] = [
  { label: 'Programmer', value: 'Programmer' },
  { label: 'Artist', value: 'Artist' },
  { label: 'Game Designer', value: 'Game Designer' },
  { label: 'Audio', value: 'Audio' },
  { label: 'Writer', value: 'Writer' },
  { label: 'QA', value: 'QA' },
  { label: 'Producer', value: 'Producer' },
  { label: 'Other', value: 'Other' },
];

export const AuthView: React.FC = () => {
  const { signIn, signInWithGoogle, signUp, error, availableDemoUsers, switchDemoUser, isConfigured } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [discipline, setDiscipline] = useState<UserDiscipline>('Programmer');
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setNotice(null);

    if (mode === 'signin') {
      await signIn(email, password);
    } else {
      const result = await signUp(email, password, displayName, discipline);
      if (result.requiresEmailConfirmation) {
        setNotice('Account created. Check your email to confirm the account, then sign in.');
        setMode('signin');
      }
    }

    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setNotice(null);
    setIsLoading(true);
    await signInWithGoogle();
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-studio-bg via-[#121924] to-[#0a0d13]">
      <div className="w-full max-w-md space-y-6">
        {/* Brand / Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 shadow-lg mb-2">
            <Gamepad2 className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-studio-text">Virtual Game Dev Studio</h1>
          <p className="text-xs text-studio-muted">
            Communication, coordination, and monitoring layer for game teams.
          </p>
        </div>

        {/* Auth Form Card */}
        <Card className="border-studio-border/80 shadow-2xl backdrop-blur-md bg-studio-panel/90">
          {/* Tabs */}
          <div className="flex rounded-lg bg-studio-bg p-1 border border-studio-border mb-5">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                mode === 'signin'
                  ? 'bg-studio-surface text-studio-text shadow'
                  : 'text-studio-muted hover:text-studio-text'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                mode === 'signup'
                  ? 'bg-studio-surface text-studio-text shadow'
                  : 'text-studio-muted hover:text-studio-text'
              }`}
            >
              Register New Member
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <Input
                  label="Display Name"
                  placeholder="e.g. Alex Vance"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
                <Select
                  label="Game Dev Discipline"
                  value={discipline}
                  onChange={(e) => setDiscipline(e.target.value as UserDiscipline)}
                  options={DISCIPLINES}
                />
              </>
            )}

            <Input
              label="Email Address / User ID"
              type="email"
              placeholder="alex@pixelforge.games"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={isConfigured}
            />

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {error}
              </div>
            )}

            {notice && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                {notice}
              </div>
            )}

            <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading}>
              {mode === 'signin' ? 'Sign In to Studio' : 'Create Member Account'}
            </Button>
          </form>

          {isConfigured && (
            <div className="mt-5 pt-5 border-t border-studio-border/60 space-y-3">
              <p className="text-center text-[11px] text-studio-muted">or continue with</p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                icon={<Globe2 className="w-4 h-4" />}
                isLoading={isLoading}
                onClick={handleGoogleSignIn}
              >
                Continue with Google
              </Button>
            </div>
          )}

          {/* Quick Demo Test Profiles Section (Always available for instant 2-tab local testing) */}
          <div className="mt-6 pt-5 border-t border-studio-border/60">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-studio-muted flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Instant Demo Team Logins
              </span>
              <span className="text-[10px] text-studio-muted/70">1-Click Local Test</span>
            </div>

            <div className="space-y-2">
              {availableDemoUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => switchDemoUser(u.id)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-studio-border bg-studio-surface/40 hover:bg-studio-surface hover:border-blue-500/40 transition-all text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar name={u.display_name} discipline={u.discipline} avatarConfig={u.avatar_config} size="sm" />
                    <div>
                      <div className="text-xs font-semibold text-studio-text group-hover:text-blue-400 transition-colors">
                        {u.display_name}
                      </div>
                      <div className="text-[10px] text-studio-muted">@{u.username}</div>
                    </div>
                  </div>
                  <DisciplineBadge discipline={u.discipline} size="sm" />
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Footer info */}
        <div className="text-center text-[11px] text-studio-muted flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5 text-studio-muted" />
          <span>Goal 1: Foundation & RBAC Enabled</span>
          <span>•</span>
          <span className={isConfigured ? 'text-emerald-400' : 'text-amber-400'}>
            {isConfigured ? 'Supabase Connected' : 'Demo Local Mode Active'}
          </span>
        </div>
      </div>
    </div>
  );
};
