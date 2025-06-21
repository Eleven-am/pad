import React from 'react';
import { XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MultiSelectOption } from '../types';
import { multiSelectVariants } from '../styles';

interface SelectedBadgeProps {
  value: string;
  option?: MultiSelectOption;
  variant?: 'default' | 'secondary' | 'destructive' | 'inverted';
  isAnimating: boolean;
  animation: number;
  onRemove: (value: string) => void;
}

export const SelectedBadge = React.memo<SelectedBadgeProps>(({
  value,
  option,
  variant,
  isAnimating,
  animation,
  onRemove
}) => {
  const IconComponent = option?.icon;
  
  const handleClick = React.useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    onRemove(value);
  }, [value, onRemove]);
  
  return (
    <Badge
      className={cn(
        isAnimating && 'animate-bounce',
        multiSelectVariants({ variant })
      )}
      onClick={handleClick}
      style={{ animationDuration: `${animation}s` }}
    >
      {IconComponent && (
        <IconComponent className="h-4 w-4 mr-2" />
      )}
      {option?.label || value}
      <XCircle className="ml-2 h-4 w-4 cursor-pointer"/>
    </Badge>
  );
});

SelectedBadge.displayName = 'SelectedBadge';