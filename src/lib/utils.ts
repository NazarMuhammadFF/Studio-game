import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDisciplineColor(discipline?: string): { bg: string; text: string; border: string } {
  switch (discipline) {
    case 'Programmer':
      return { bg: 'bg-blue-950/60', text: 'text-blue-400', border: 'border-blue-500/30' };
    case 'Artist':
      return { bg: 'bg-purple-950/60', text: 'text-purple-400', border: 'border-purple-500/30' };
    case 'Game Designer':
      return { bg: 'bg-emerald-950/60', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    case 'Audio':
      return { bg: 'bg-pink-950/60', text: 'text-pink-400', border: 'border-pink-500/30' };
    case 'Writer':
      return { bg: 'bg-amber-950/60', text: 'text-amber-400', border: 'border-amber-500/30' };
    case 'QA':
      return { bg: 'bg-rose-950/60', text: 'text-rose-400', border: 'border-rose-500/30' };
    case 'Producer':
      return { bg: 'bg-indigo-950/60', text: 'text-indigo-400', border: 'border-indigo-500/30' };
    default:
      return { bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' };
  }
}

export function getRoleBadgeColor(role?: string): { bg: string; text: string; border: string } {
  switch (role) {
    case 'owner':
      return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' };
    case 'lead':
      return { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' };
    case 'member':
      return { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' };
    case 'guest':
      return { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/30' };
    default:
      return { bg: 'bg-slate-800', text: 'text-slate-400', border: 'border-slate-700' };
  }
}
