"use client";

import React, { forwardRef } from "react";
import {
  ChevronDown,
  XIcon,
  WandSparkles,
  CheckIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

import { MultiSelectProps } from './types';
import { useMultiSelect } from './hooks/useMultiSelect';
import { multiSelectVariants } from './styles';
import { SelectedBadge } from './components/SelectedBadge';
import { CommandOption } from './components/CommandOption';
import { CreateOption } from './components/CreateOption';
import { CommandFooter } from './components/CommandFooter';

const SelectAllOption = React.memo<{
  isAllSelected: boolean;
  onToggleAll: () => void;
}>(({ isAllSelected, onToggleAll }) => (
  <CommandItem
    key="select-all"
    onSelect={onToggleAll}
    className="cursor-pointer"
  >
    <div
      className={cn(
        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
        {
          'bg-primary text-primary-foreground': isAllSelected,
          'opacity-50 [&_svg]:invisible': !isAllSelected,
        }
      )}
    >
      <CheckIcon className="h-4 w-4" />
    </div>
    <span>(Select All)</span>
  </CommandItem>
));

SelectAllOption.displayName = 'SelectAllOption';

const ExtraBadge = React.memo<{
  count: number;
  variant?: 'default' | 'secondary' | 'destructive' | 'inverted';
  isAnimating: boolean;
  animation: number;
  onClear: () => void;
}>(({ count, variant, isAnimating, animation, onClear }) => {
  const handleClick = React.useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    onClear();
  }, [onClear]);
  
  return (
    <Badge
      className={cn(
        "bg-transparent text-foreground border-foreground/1 hover:bg-transparent",
        isAnimating && 'animate-bounce',
        multiSelectVariants({ variant })
      )}
      style={{ animationDuration: `${animation}s` }}
    >
      {`+ ${count} more`}
      <XIcon
        className="ml-2 h-4 w-4 cursor-pointer"
        onClick={handleClick}
      />
    </Badge>
  );
});

ExtraBadge.displayName = 'ExtraBadge';

export const MultiSelect = forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    {
      options,
      onValueChange,
      onCreateOption,
      onClose,
      variant = "default",
      defaultValue = [],
      placeholder = "Select options",
      searchPlaceholder = "Search...",
      animation = 0,
      maxCount = 3,
      modalPopover = false,
      asChild: _asChild = false,
      creatable = false,
      className,
      ...props
    },
    ref
  ) => {
    const {
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
    } = useMultiSelect({
      options,
      defaultValue,
      maxCount,
      creatable,
      onValueChange,
      onCreateOption,
      onClose
    });

    const handleClearAllClick = React.useCallback((event: React.MouseEvent) => {
      event.stopPropagation();
      handleClear();
    }, [handleClear]);

    const isAllSelected = selectedValues.length === options.length;
    const hasSelectedValues = selectedValues.length > 0;
    const extraCount = selectedValues.length - maxCount;
    
    return (
      <Popover
        open={isPopoverOpen}
        onOpenChange={setIsPopoverOpen}
        modal={modalPopover}
      >
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            {...props}
            onClick={handleTogglePopover}
            className={cn(
              "flex w-full p-1 rounded-md border min-h-10 h-auto items-center justify-between bg-inherit hover:bg-inherit [&_svg]:pointer-events-auto",
              className
            )}
          >
            {hasSelectedValues ? (
              <div className="flex justify-between items-center w-full">
                <div className="flex flex-wrap items-center">
                  {selectedValues.slice(0, maxCount).map((value) => {
                    const option = options.find((o) => o.value === value);
                    return (
                      <SelectedBadge
                        key={value}
                        value={value}
                        option={option}
                        variant={variant}
                        isAnimating={isAnimating}
                        animation={animation}
                        onRemove={toggleOption}
                      />
                    );
                  })}
                  {extraCount > 0 && (
                    <ExtraBadge
                      count={extraCount}
                      variant={variant}
                      isAnimating={isAnimating}
                      animation={animation}
                      onClear={clearExtraOptions}
                    />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <XIcon
                    className="h-4 mx-2 cursor-pointer text-muted-foreground"
                    onClick={handleClearAllClick}
                  />
                  <Separator
                    orientation="vertical"
                    className="flex min-h-6 h-full"
                  />
                  <ChevronDown className="h-4 mx-2 cursor-pointer text-muted-foreground" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full mx-auto">
                <span className="text-sm text-muted-foreground mx-3">
                  {placeholder}
                </span>
                <ChevronDown className="h-4 cursor-pointer text-muted-foreground mx-2" />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-full p-0"
          align="start"
          onEscapeKeyDown={handleClosePopover}
          style={{ width: 'var(--radix-popover-trigger-width)' }}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={searchPlaceholder}
              onKeyDown={handleInputKeyDown}
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>
                {creatable ? "No results found. Press Enter to create a new option." : "No results found."}
              </CommandEmpty>
              
              {shouldShowCreateOption && (
                <CommandGroup>
                  <CreateOption
                    value={searchValue.trim()}
                    onCreate={handleCreateOption}
                  />
                </CommandGroup>
              )}
              
              {(filteredOptions.length > 0 || shouldShowCreateOption) && (
                <>
                  {shouldShowCreateOption && <CommandSeparator />}
                  <CommandGroup>
                    <SelectAllOption
                      isAllSelected={isAllSelected}
                      onToggleAll={toggleAll}
                    />
                    {filteredOptions.map((option, index) => (
                      <CommandOption
                        key={`${option.value}-${index}`}
                        option={option}
                        isSelected={selectedValues.includes(option.value)}
                        onSelect={toggleOption}
                        index={index}
                      />
                    ))}
                  </CommandGroup>
                </>
              )}
              <CommandSeparator />
              <CommandFooter
                hasSelectedValues={hasSelectedValues}
                onClear={handleClear}
                onClose={handleClosePopover}
              />
            </CommandList>
          </Command>
        </PopoverContent>
        {animation > 0 && hasSelectedValues && (
          <WandSparkles
            className={cn(
              "cursor-pointer my-2 text-foreground bg-background w-3 h-3",
              isAnimating && 'text-muted-foreground'
            )}
            onClick={handleToggleAnimation}
          />
        )}
      </Popover>
    );
  }
);

MultiSelect.displayName = "MultiSelect";