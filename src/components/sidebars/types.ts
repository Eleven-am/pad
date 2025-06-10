export enum Views {
	SelectBlock = "select-block",
	ManagePost = "manage-post",
	BlockSidebar = "block-sidebar",
}

export interface BaseBlockSidebarProps<T> {
	onClose: () => void;
	onSave: (data: T) => void;
	onDelete?: () => void;
	initialData: T;
	isUpdate: boolean;
}

export interface BlockSidebarHeaderProps {
	title: string;
	onClose: () => void;
}

export interface BlockSidebarFooterProps {
	onSave: () => void;
	onDelete?: () => void;
	isUpdate: boolean;
	isValid: boolean;
} 