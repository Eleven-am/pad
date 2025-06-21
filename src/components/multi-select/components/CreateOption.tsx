import React from 'react';
import { Plus } from 'lucide-react';
import { CommandItem } from '@/components/ui/command';

interface CreateOptionProps {
  value: string;
  onCreate: (value: string) => void;
}

export const CreateOption = React.memo<CreateOptionProps>(({
  value,
  onCreate
}) => {
  const handleSelect = React.useCallback(() => {
    onCreate(value);
  }, [value, onCreate]);
  
  return (
    <CommandItem
      key={`create-${value}`}
      onSelect={handleSelect}
      className="cursor-pointer"
    >
      <Plus className="mr-2 h-4 w-4" />
      <span>Create &quot;{value}&quot;</span>
    </CommandItem>
  );
});

CreateOption.displayName = 'CreateOption';