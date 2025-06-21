import { useState, useCallback, useMemo, KeyboardEvent, useEffect } from 'react';
import { MultiSelectOption } from '../types';

interface UseMultiSelectProps {
  options: MultiSelectOption[];
  defaultValue: string[];
  maxCount: number;
  creatable: boolean;
  onValueChange: (value: string[]) => void;
  onCreateOption?: (option: MultiSelectOption, values: string[]) => void;
  onClose?: () => void;
}

export function useMultiSelect({
  options,
  defaultValue,
  maxCount,
  creatable,
  onValueChange,
  onCreateOption,
  onClose
}: UseMultiSelectProps) {
  const [selectedValues, setSelectedValues] = useState<string[]>(defaultValue);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    setSelectedValues(defaultValue);
  }, [defaultValue]);

  const handleCreateOption = useCallback((inputValue: string) => {
    const newOption: MultiSelectOption = {
      label: inputValue,
      value: inputValue,
    };
    
    const newSelectedValues = [...selectedValues, inputValue];
    setSelectedValues(newSelectedValues);
    onValueChange(newSelectedValues);
    onCreateOption?.(newOption, newSelectedValues);
    setSearchValue("");
  }, [selectedValues, onValueChange, onCreateOption]);
  
  const toggleOption = useCallback((option: string) => {
    const newSelectedValues = selectedValues.includes(option)
      ? selectedValues.filter((value) => value !== option)
      : [...selectedValues, option];
    setSelectedValues(newSelectedValues);
    onValueChange(newSelectedValues);
  }, [selectedValues, onValueChange]);
  
  const handleClear = useCallback(() => {
    setSelectedValues([]);
    onValueChange([]);
  }, [onValueChange]);
  
  const handleTogglePopover = useCallback(() => {
    setIsPopoverOpen((prev) => !prev);
  }, []);
  
  const clearExtraOptions = useCallback(() => {
    const newSelectedValues = selectedValues.slice(0, maxCount);
    setSelectedValues(newSelectedValues);
    onValueChange(newSelectedValues);
  }, [selectedValues, maxCount, onValueChange]);
  
  const toggleAll = useCallback(() => {
    if (selectedValues.length === options.length) {
      handleClear();
    } else {
      const allValues = options.map((option) => option.value);
      setSelectedValues(allValues);
      onValueChange(allValues);
    }
  }, [selectedValues.length, options, handleClear, onValueChange]);

  const handleToggleAnimation = useCallback(() => {
    setIsAnimating(prev => !prev);
  }, []);
  
  const handleInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        if (creatable && searchValue.trim() && !options.some(option =>
          option.value.toLowerCase() === searchValue.trim().toLowerCase() ||
          option.label.toLowerCase() === searchValue.trim().toLowerCase()
        ) && !selectedValues.includes(searchValue.trim())) {
          handleCreateOption(searchValue.trim());
        } else {
          setIsPopoverOpen(true);
        }
      } else if (event.key === "Backspace" && !event.currentTarget.value) {
        const newSelectedValues = [...selectedValues];
        newSelectedValues.pop();
        setSelectedValues(newSelectedValues);
        onValueChange(newSelectedValues);
      }
    },
    [creatable, searchValue, options, selectedValues, handleCreateOption, onValueChange]
  );
  
  const filteredOptions = useMemo(() => {
    if (!searchValue) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
      option.value.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [options, searchValue]);
  
  const shouldShowCreateOption = useMemo(() => {
    return creatable &&
      searchValue.trim() &&
      !options.some(option =>
        option.value.toLowerCase() === searchValue.trim().toLowerCase() ||
        option.label.toLowerCase() === searchValue.trim().toLowerCase()
      ) &&
      !selectedValues.includes(searchValue.trim());
  }, [creatable, searchValue, options, selectedValues]);

  const handleClosePopover = useCallback(() => {
    setIsPopoverOpen(false);
    onClose?.();
  }, [onClose]);

  return {
    selectedValues,
    isPopoverOpen,
    isAnimating,
    searchValue,
    filteredOptions,
    shouldShowCreateOption,
    setIsPopoverOpen,
    setSearchValue,
    handleCreateOption,
    toggleOption,
    handleClear,
    handleTogglePopover,
    clearExtraOptions,
    toggleAll,
    handleToggleAnimation,
    handleInputKeyDown,
    handleClosePopover
  };
}