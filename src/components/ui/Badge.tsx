import React from 'react';
import { cn, getDisciplineColor, getRoleBadgeColor } from '@/lib/utils';
import { UserDiscipline, UserRole } from '@/types/database.types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'discipline' | 'role';
  discipline?: UserDiscipline | string;
  role?: UserRole | string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  discipline,
  role,
  size = 'md',
  children,
  ...props
}) => {
  let colorStyles = 'bg-studio-surface text-studio-text border-studio-border';

  if (variant === 'discipline' && discipline) {
    const dColor = getDisciplineColor(discipline);
    colorStyles = `${dColor.bg} ${dColor.text} ${dColor.border}`;
  } else if (variant === 'role' && role) {
    const rColor = getRoleBadgeColor(role);
    colorStyles = `${rColor.bg} ${rColor.text} ${rColor.border}`;
  }

  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-md border tracking-wide uppercase',
        sizeStyles,
        colorStyles,
        className
      )}
      {...props}
    >
      {children || discipline || role}
    </span>
  );
};
