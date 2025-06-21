export interface SidebarHeaderProps {
  title: string;
  onBack?: () => void;
  showBackButton?: boolean;
  children?: React.ReactNode;
}

export interface LoadingStateProps {
  count?: number;
  message?: string;
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export interface FormStateHook<T> {
  data: T;
  updateData: (data: Partial<T>) => void;
  resetData: () => void;
  isValid: boolean;
  isDirty: boolean;
}

export interface AsyncStateHook<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (asyncFn: () => Promise<T>) => Promise<void>;
  reset: () => void;
}

export const SIDEBAR_CONSTANTS = {
  SPACING: {
    PADDING: "p-4",
    CONTENT_GAP: "space-y-4",
    HEADER_GAP: "space-y-2",
    BUTTON_GAP: "gap-2",
  },
  SIZES: {
    ICON: "h-4 w-4",
    AVATAR_SMALL: "h-9 w-9",
    AVATAR_MEDIUM: "h-12 w-12",
    INPUT_HEIGHT: "h-10",
  },
  SCROLL: {
    HEIGHT: "h-80",
    BOTTOM_PADDING: "pb-24",
  },
  ANIMATIONS: {
    TRANSITION: "transition-colors",
    DURATION: "duration-200",
    HOVER: "hover:bg-accent/50",
  },
} as const;

export const LOADING_SKELETON = {
  ACTIVITY_COUNT: 3,
  DEFAULT_COUNT: 5,
} as const;