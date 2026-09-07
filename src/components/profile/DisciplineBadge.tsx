import React from 'react';
import { UserDiscipline } from '@/types/database.types';
import { Badge } from '@/components/ui/Badge';
import { Code, Palette, Gamepad2, Volume2, BookOpen, CheckSquare, Shield, User } from 'lucide-react';

export const DisciplineBadge: React.FC<{ discipline: UserDiscipline | string; size?: 'sm' | 'md' }> = ({
  discipline,
  size = 'md',
}) => {
  const getIcon = () => {
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

  return (
    <Badge variant="discipline" discipline={discipline} size={size} className="gap-1.5 font-semibold">
      {getIcon()}
      {discipline}
    </Badge>
  );
};
