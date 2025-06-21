export interface MultiSelectOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface MultiSelectProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  options: MultiSelectOption[];
  onValueChange: (value: string[]) => void;
  onCreateOption?: (
    createdOption: MultiSelectOption,
    allSelectedValues: string[]
  ) => void;
  onClose?: () => void;
  defaultValue?: string[];
  placeholder?: string;
  searchPlaceholder?: string;
  animation?: number;
  maxCount?: number;
  modalPopover?: boolean;
  asChild?: boolean;
  creatable?: boolean;
  className?: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'inverted';
}