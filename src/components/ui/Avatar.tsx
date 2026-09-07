import React from 'react';
import { cn } from '@/lib/utils';
import { AvatarConfig } from '@/types/database.types';
import { Code, Palette, Gamepad2, Volume2, BookOpen, CheckSquare, Shield, User } from 'lucide-react';

export interface AvatarProps {
  name: string;
  discipline?: string;
  avatarConfig?: AvatarConfig;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  discipline,
  avatarConfig,
  size = 'md',
  showBadge = false,
  className,
}) => {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base font-bold',
    xl: 'w-20 h-20 text-xl font-bold',
  };

  const getDisciplineIcon = () => {
    switch (discipline) {
      case 'Programmer':
        return <Code className="w-3 h-3 text-blue-400" />;
      case 'Artist':
        return <Palette className="w-3 h-3 text-purple-400" />;
      case 'Game Designer':
        return <Gamepad2 className="w-3 h-3 text-emerald-400" />;
      case 'Audio':
        return <Volume2 className="w-3 h-3 text-pink-400" />;
      case 'Writer':
        return <BookOpen className="w-3 h-3 text-amber-400" />;
      case 'QA':
        return <CheckSquare className="w-3 h-3 text-rose-400" />;
      case 'Producer':
        return <Shield className="w-3 h-3 text-indigo-400" />;
      default:
        return <User className="w-3 h-3 text-slate-400" />;
    }
  };

  const skinColor = avatarConfig?.skinColor || '#f5d0b5';
  const shirtColor = avatarConfig?.shirtColor || '#3b82f6';
  const hairColor = avatarConfig?.hairColor || '#2b1d0c';

  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      {/* Pixel style avatar icon representation */}
      <div
        className={cn(
          'rounded-xl border border-studio-border flex items-center justify-center font-bold select-none overflow-hidden relative shadow-inner',
          sizeClasses[size],
          className
        )}
        style={{
          background: `linear-gradient(135deg, ${shirtColor}22 0%, #161d27 100%)`,
          borderColor: `${shirtColor}55`,
        }}
      >
        {/* Pixel portrait hint */}
        <div className="flex flex-col items-center justify-center">
          <span style={{ color: shirtColor }} className="tracking-tighter">
            {initials}
          </span>
          <div className="flex gap-0.5 mt-0.5 opacity-60">
            <span className="w-1.5 h-1 rounded-full" style={{ backgroundColor: skinColor }} />
            <span className="w-1.5 h-1 rounded-full" style={{ backgroundColor: hairColor }} />
          </div>
        </div>
      </div>

      {/* Optional discipline badge icon */}
      {showBadge && (
        <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-studio-panel border border-studio-border shadow">
          {getDisciplineIcon()}
        </div>
      )}
    </div>
  );
};
