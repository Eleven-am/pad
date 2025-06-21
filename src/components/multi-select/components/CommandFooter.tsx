import React from 'react';
import { CommandItem, CommandGroup } from '@/components/ui/command';
import { Separator } from '@/components/ui/separator';

interface CommandFooterProps {
  hasSelectedValues: boolean;
  onClear: () => void;
  onClose: () => void;
}

export const CommandFooter = React.memo<CommandFooterProps>(({
  hasSelectedValues,
  onClear,
  onClose
}) => {
  return (
    <CommandGroup>
      <div className="flex items-center justify-between">
        {hasSelectedValues && (
          <>
            <CommandItem
              onSelect={onClear}
              className="flex-1 justify-center cursor-pointer"
            >
              Clear
            </CommandItem>
            <Separator
              orientation="vertical"
              className="flex min-h-6 h-full"
            />
          </>
        )}
        <CommandItem
          onSelect={onClose}
          className="flex-1 justify-center cursor-pointer max-w-full"
        >
          Close
        </CommandItem>
      </div>
    </CommandGroup>
  );
});

CommandFooter.displayName = 'CommandFooter';