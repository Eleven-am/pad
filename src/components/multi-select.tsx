// src/components/multi-select.tsx

import {useState, useCallback, useMemo, forwardRef, KeyboardEvent, useEffect} from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
	CheckIcon,
	XCircle,
	ChevronDown,
	XIcon,
	WandSparkles,
	Plus,
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

/**
 * Variants for the multi-select component to handle different styles.
 * Uses class-variance-authority (cva) to define different styles based on "variant" prop.
 */
const multiSelectVariants = cva(
	"m-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300",
	{
		variants: {
			variant: {
				default:
					"border-foreground/10 text-foreground bg-card hover:bg-card/80",
				secondary:
					"border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
				destructive:
					"border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
				inverted: "inverted",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
);

/**
 * Props for MultiSelect component
 */
interface MultiSelectProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof multiSelectVariants> {
	/**
	 * An array of option objects to be displayed in the multi-select component.
	 * Each option object has a label, value, and an optional icon.
	 */
	options: {
		/** The text to display for the option. */
		label: string;
		/** The unique value associated with the option. */
		value: string;
		/** Optional icon component to display alongside the option. */
		icon?: React.ComponentType<{ className?: string }>;
	}[];
	
	/**
	 * Callback function triggered when the selected values change.
	 * Receives an array of the new selected values.
	 */
	onValueChange: (value: string[]) => void;
	
	/**
	 * Callback function triggered when a new option is created.
	 * Receives the created option object and all selected values.
	 */
	onCreateOption?: (
		createdOption: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> },
		allSelectedValues: string[]
	) => void;
	
	/**
	 * Callback function triggered when the popover is closed.
	 */
	onClose?: () => void;
	
	/** The default selected values when the component mounts. */
	defaultValue?: string[];
	
	/**
	 * Placeholder text to be displayed when no values are selected.
	 * Optional, defaults to "Select options".
	 */
	placeholder?: string;
	
	/**
	 * Placeholder text for the search input.
	 * Optional, defaults to "Search...".
	 */
	searchPlaceholder?: string;
	
	/**
	 * Animation duration in seconds for the visual effects (e.g., bouncing badges).
	 * Optional, defaults to 0 (no animation).
	 */
	animation?: number;
	
	/**
	 * Maximum number of items to display. Extra selected items will be summarized.
	 * Optional, defaults to 3.
	 */
	maxCount?: number;
	
	/**
	 * The modality of the popover. When set to true, interaction with outside elements
	 * will be disabled and only popover content will be visible to screen readers.
	 * Optional, defaults to false.
	 */
	modalPopover?: boolean;
	
	/**
	 * If true, renders the multi-select component as a child of another component.
	 * Optional, defaults to false.
	 */
	asChild?: boolean;
	
	/**
	 * Allow users to create new options when no matching option is found.
	 * Optional, defaults to false.
	 */
	creatable?: boolean;
	
	/**
	 * Additional class names to apply custom styles to the multi-select component.
	 * Optional, can be used to add custom styles.
	 */
	className?: string;
}

export const MultiSelect = forwardRef<
	HTMLButtonElement,
	MultiSelectProps
>(
	(
		{
			options,
			onValueChange,
			onCreateOption,
			onClose,
			variant,
			defaultValue = [],
			placeholder = "Select options",
			searchPlaceholder = "Search...",
			animation = 0,
			maxCount = 3,
			modalPopover = false,
			asChild = false,
			creatable = false,
			className,
			...props
		},
		ref
	) => {
		const [selectedValues, setSelectedValues] = useState<string[]>(defaultValue);
		const [isPopoverOpen, setIsPopoverOpen] = useState(false);
		const [isAnimating, setIsAnimating] = useState(false);
		const [searchValue, setSearchValue] = useState("");
		
		const handleCreateOption = useCallback((inputValue: string) => {
			const newOption = {
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

		const createBadgeClickHandler = useCallback((value: string) => (event: React.MouseEvent) => {
			event.stopPropagation();
			toggleOption(value);
		}, [toggleOption]);

		const handleClearExtraClick = useCallback((event: React.MouseEvent) => {
			event.stopPropagation();
			clearExtraOptions();
		}, [clearExtraOptions]);

		const handleClearAllClick = useCallback((event: React.MouseEvent) => {
			event.stopPropagation();
			handleClear();
		}, [handleClear]);

		const handleClosePopover = useCallback(() => {
			setIsPopoverOpen(false);
			onClose?.();
		}, [onClose]);

		const createOptionSelectHandler = useCallback((value: string) => () => {
			toggleOption(value);
		}, [toggleOption]);

		const createCreateOptionHandler = useCallback((value: string) => () => {
			handleCreateOption(value);
		}, [handleCreateOption]);
		
		useEffect (() => {
			setSelectedValues(defaultValue);
		}, [defaultValue]);
		
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
						{selectedValues.length > 0 ? (
							<div className="flex justify-between items-center w-full">
								<div className="flex flex-wrap items-center">
									{selectedValues.slice(0, maxCount).map((value) => {
										const option = options.find((o) => o.value === value);
										const IconComponent = option?.icon;
										return (
											<Badge
												key={value}
												className={cn(
													{
														'animate-bounce': isAnimating,
													},
													multiSelectVariants({ variant })
												)}
												onClick={createBadgeClickHandler(value)}
												style={{ animationDuration: `${animation}s` }}
											>
												{IconComponent && (
													<IconComponent className="h-4 w-4 mr-2" />
												)}
												{option?.label || value}
												<XCircle className="ml-2 h-4 w-4 cursor-pointer"/>
											</Badge>
										);
									})}
									{selectedValues.length > maxCount && (
										<Badge
											className={cn(
												"bg-transparent text-foreground border-foreground/1 hover:bg-transparent",
												{
													'animate-bounce': isAnimating,
												},
												multiSelectVariants({ variant })
											)}
											style={{ animationDuration: `${animation}s` }}
										>
											{`+ ${selectedValues.length - maxCount} more`}
											<XCircle
												className="ml-2 h-4 w-4 cursor-pointer"
												onClick={handleClearExtraClick}
											/>
										</Badge>
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
									<CommandItem
										key={`create-${searchValue.trim()}`}
										onSelect={createCreateOptionHandler(searchValue.trim())}
										className="cursor-pointer"
									>
										<Plus className="mr-2 h-4 w-4" />
										<span>Create &#34;{searchValue.trim()}&#34;</span>
									</CommandItem>
								</CommandGroup>
							)}
							
							{(filteredOptions.length > 0 || shouldShowCreateOption) && (
								<>
									{shouldShowCreateOption && <CommandSeparator />}
									<CommandGroup>
										<CommandItem
											key="select-all"
											onSelect={toggleAll}
											className="cursor-pointer"
										>
											<div
												className={cn(
													"mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
													{
														'bg-primary text-primary-foreground': selectedValues.length === options.length,
														'opacity-50 [&_svg]:invisible': selectedValues.length !== options.length,
													}
												)}
											>
												<CheckIcon className="h-4 w-4" />
											</div>
											<span>(Select All)</span>
										</CommandItem>
										{filteredOptions.map((option, index) => {
											const isSelected = selectedValues.includes(option.value);
											return (
												<CommandItem
													key={`option-${option.value}-${index}`}
													onSelect={createOptionSelectHandler(option.value)}
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
										})}
									</CommandGroup>
								</>
							)}
							<CommandSeparator />
							<CommandGroup>
								<div className="flex items-center justify-between">
									{selectedValues.length > 0 && (
										<>
											<CommandItem
												onSelect={handleClear}
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
										onSelect={handleClosePopover}
										className="flex-1 justify-center cursor-pointer max-w-full"
									>
										Close
									</CommandItem>
								</div>
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
				{animation > 0 && selectedValues.length > 0 && (
					<WandSparkles
						className={cn(
							"cursor-pointer my-2 text-foreground bg-background w-3 h-3",
							{
								'text-muted-foreground': isAnimating,
							}
						)}
						onClick={handleToggleAnimation}
					/>
				)}
			</Popover>
		);
	}
);

MultiSelect.displayName = "MultiSelect";
