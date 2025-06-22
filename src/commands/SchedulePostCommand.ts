import { BaseCommand } from './BaseCommand';
import { schedulePost } from '@/lib/data';
import { PostWithDetails } from '@/services/postService';

export interface SchedulePostCommandData {
	postId: string;
	scheduledAt: Date;
	userId: string;
	previousState: PostWithDetails;
}

export class SchedulePostCommand extends BaseCommand<PostWithDetails> {
	constructor(private data: SchedulePostCommandData) {
		super(data.postId);
	}

	async execute(): Promise<PostWithDetails> {
		const { postId, scheduledAt, userId } = this.data;
		const result = await schedulePost(postId, scheduledAt, userId);
		if ('success' in result && result.success) {
			return result.data;
		}
		throw new Error('error' in result ? result.error : 'Failed to schedule post');
	}

	async undo(): Promise<PostWithDetails> {
		return this.data.previousState;
	}

	get description(): string {
		return `Schedule post for ${this.data.scheduledAt.toLocaleDateString()}`;
	}
}