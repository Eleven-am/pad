import React from 'react';
import { CheckIcon } from 'lucide-react';
import { CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { MultiSelectOption } from '../types';

interface CommandOptionProps {
  option: MultiSelectOption;
  isSelected: boolean;
  onSelect: (value: string) => void;
  index: number;
}

export const CommandOption = React.memo<CommandOptionProps>(({
  option,
  isSelected,
  onSelect,
  index
}) => {
  const handleSelect = React.useCallback(() => {
    onSelect(option.value);
  }, [option.value, onSelect]);
  
  return (
    <CommandItem
      key={`option-${option.value}-${index}`}
      onSelect={handleSelect}
      className="cursor-pointer"
    >
      <div
        className={cn(
          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
          {
            'bg-primary text-primary-foreground': isSelected,
            'opacity-50 [&_svg]:invisible': !isSelected,
          }
        )}
      >
        <CheckIcon className="h-4 w-4" />
      </div>
      {option.icon && (
        <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
      )}
      <span>{option.label}</span>
    </CommandItem>
  );
});

CommandOption.displayName = 'CommandOption';