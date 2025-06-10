import {CreateBlockInput, UnifiedBlockInput, BlockType, UnifiedBlockOutput, CategoryData, TagData} from "@/services/types";
import { CreatePostInput, PostWithDetails, UpdatePostInput } from "@/services/postService";

export interface BaseCommand<T = any> {
	postId: string;
    timestamp: number;
    execute(): Promise<T>;
    undo(): Promise<T>;
    redo(): Promise<T>;
}

export interface CreateCommandData {
    data: CreateBlockInput;
}

export interface UpdateCommandData {
    blockId: string;
    previousState: UnifiedBlockOutput;
    newState: UnifiedBlockOutput;
}

export interface DeleteCommandData {
    blockId: string;
    data: UnifiedBlockOutput;
}

export interface MoveCommandData {
    blockId: string;
    blockType: BlockType;
    oldPosition: number;
    newPosition: number;
}

export interface CreatePostCommandData {
    input: CreatePostInput;
    userId: string;
}

export interface UpdatePostCommandData {
    postId: string;
    input: UpdatePostInput;
    userId: string;
    previousState: PostWithDetails;
}

export interface DeletePostCommandData {
    postId: string;
    userId: string;
    previousState: PostWithDetails;
    blocks: UnifiedBlockOutput[];
}

export interface PublishPostCommandData {
    postId: string;
    userId: string;
    previousState: PostWithDetails;
}

export interface CreateCategoryCommandData extends CategoryData {}

export interface UpdateCategoryCommandData extends CategoryData {
    id: string;
}

export interface DeleteCategoryCommandData {
    id: string;
}

export interface CreateTagCommandData extends TagData {}

export interface UpdateTagCommandData extends TagData {
    id: string;
}

export interface DeleteTagCommandData {
    id: string;
} 