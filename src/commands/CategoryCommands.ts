"use client";

import {BaseCommand} from "./BaseCommand";
import {createCategory, deleteCategory, getCategoryById, updateCategory} from "@/lib/data";
import {Category} from "@/generated/prisma";
import {CreateCategoryCommandData, DeleteCategoryCommandData, UpdateCategoryCommandData} from "./types";
import {unwrap} from "@/lib/unwrap";

export class CreateCategoryCommand extends BaseCommand<Category> {
	private readonly data: CreateCategoryCommandData;
	private createdCategory: Category | null = null;
	
	constructor (data: CreateCategoryCommandData) {
		super ('category');
		this.data = data;
	}
	
	async execute (): Promise<Category> {
		const category = await unwrap (createCategory (this.data));
		this.createdCategory = category;
		return category;
	}
	
	async undo (): Promise<Category> {
		if ( ! this.createdCategory) {
			throw new Error ('No created category to undo');
		}
		await unwrap (deleteCategory (this.createdCategory.id));
		return this.createdCategory;
	}
}

export class UpdateCategoryCommand extends BaseCommand<Category> {
	private data: UpdateCategoryCommandData;
	private previousCategory: Category | null = null;
	
	constructor (data: UpdateCategoryCommandData) {
		super ('category');
		this.data = data;
	}
	
	async execute (): Promise<Category> {
		this.previousCategory = await unwrap(getCategoryById(this.data.id));
		return await unwrap (updateCategory (this.data.id, this.data));
	}
	
	async undo (): Promise<Category> {
		if (!this.previousCategory) {
			throw new Error ('Cannot undo category update: previous state not available');
		}
		// Convert nulls to undefined for CategoryData
		const prev = { ...this.previousCategory, description: this.previousCategory.description ?? undefined, color: this.previousCategory.color ?? undefined, parentId: this.previousCategory.parentId ?? undefined };
		return await unwrap (updateCategory (this.data.id, prev));
	}
}

export class DeleteCategoryCommand extends BaseCommand<Category> {
	private data: DeleteCategoryCommandData;
	private deletedCategory: Category | null = null;
	
	constructor (data: DeleteCategoryCommandData) {
		super ('category');
		this.data = data;
	}
	
	async execute (): Promise<Category> {
		this.deletedCategory = await unwrap(getCategoryById(this.data.id));
		await unwrap(deleteCategory(this.data.id));
		return this.deletedCategory;
	}
	
	async undo (): Promise<Category> {
		if (!this.deletedCategory) {
			throw new Error ('Cannot undo category deletion: category was not deleted');
		}
		const cat = { ...this.deletedCategory, description: this.deletedCategory.description ?? undefined, color: this.deletedCategory.color ?? undefined, parentId: this.deletedCategory.parentId ?? undefined };
		return await unwrap (createCategory (cat));
	}
} 