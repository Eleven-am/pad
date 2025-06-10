"use client";

import { BaseCommand } from "./BaseCommand";
import { ProgressTracker, ProgressVariant } from "@/generated/prisma";
import { unwrap } from "@/lib/unwrap";
import { getTrackerByPostId } from "@/lib/data";
import { createProgressTracker, deleteProgressTracker, updateProgressTracker } from "@/lib/data";

export interface UpdateProgressTrackerInput {
    variant: ProgressVariant;
    showPercentage: boolean;
}

export class UpdateProgressTrackerCommand extends BaseCommand<ProgressTracker> {
    private previousTracker: ProgressTracker | null = null;

    constructor(
        postId: string,
        private readonly input: UpdateProgressTrackerInput
    ) {
        super(postId);
        this.postId = postId;
    }

    async execute(): Promise<ProgressTracker> {
        this.previousTracker = await unwrap(getTrackerByPostId(this.postId));

        if (!this.previousTracker) {
            return unwrap(createProgressTracker(this.postId, {
                variant: this.input.variant,
                showPercentage: this.input.showPercentage
            }));
        }

        return unwrap(updateProgressTracker(this.postId, {
            variant: this.input.variant,
            showPercentage: this.input.showPercentage
        }));
    }

    async undo(): Promise<ProgressTracker> {
        if (!this.previousTracker) {
            await unwrap(deleteProgressTracker(this.postId));
            return this.previousTracker!;
        }

        return unwrap(updateProgressTracker(this.postId, {
            variant: this.previousTracker.variant,
            showPercentage: this.previousTracker.showPercentage
        }));
    }
} 