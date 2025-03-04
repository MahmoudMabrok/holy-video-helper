
import React from 'react';
import { Badge as BadgeType } from '@/store/badgeStore';
import { Badge as UiBadge } from '@/components/ui/badge';
import * as LucideIcons from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BadgeProps {
  badge: BadgeType;
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({ badge, size = 'md' }: BadgeProps) {
  // Get the icon component using dynamic import
  const getIconComponent = () => {
    const iconName = badge.icon as keyof typeof LucideIcons;
    return iconName in LucideIcons ? LucideIcons[iconName] : LucideIcons.Award;
  };
  
  const IconComponent = getIconComponent();
    
  // Size configurations
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5',
    lg: 'px-4 py-2 text-base',
  };
  
  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  };

  const badgeElement = (
    <UiBadge 
      variant={badge.earned ? "default" : "outline"}
      className={`flex items-center gap-1.5 ${sizeClasses[size]} ${!badge.earned ? 'opacity-50' : ''}`}
    >
      <IconComponent size={iconSizes[size]} className={badge.earned ? 'text-primary-foreground' : 'text-muted-foreground'} />
      <span>{badge.name}</span>
    </UiBadge>
  );

  if (!badge.earned) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badgeElement}
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{badge.name}</p>
            <p className="text-xs text-muted-foreground">{badge.description}</p>
            <p className="text-xs mt-1">Not earned yet</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeElement}
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{badge.name}</p>
          <p className="text-xs text-muted-foreground">{badge.description}</p>
          <p className="text-xs mt-1">Earned: {new Date(badge.earnedAt!).toLocaleDateString()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
