import { BlockType, UnifiedBlockOutput } from "@/services/types";
import { getPublicUrl, unwrap } from "@/lib/data";

export async function preprocessBlocks(blocks: UnifiedBlockOutput[]): Promise<UnifiedBlockOutput[]> {
	return Promise.all(blocks.map(async (block) => {
		if (block.type === BlockType.IMAGES) {
			// Pre-fetch all image URLs
			const processedImages = await Promise.all(
				block.data.images.map(async (image) => ({
					...image,
					publicUrl: await unwrap(getPublicUrl(image.fileId)) as string
				}))
			);
			return {
				...block,
				data: {
					...block.data,
					images: processedImages
				}
			};
		} else if (block.type === BlockType.INSTAGRAM) {
			// Pre-fetch Instagram file URLs and avatar
			const processedFiles = await Promise.all(
				block.data.files.map(async (file) => ({
					...file,
					publicUrl: await unwrap(getPublicUrl(file.fileId)) as string
				}))
			);
			const avatarUrl = block.data.avatar ? await unwrap(getPublicUrl(block.data.avatar)) as string : null;
			return {
				...block,
				data: {
					...block.data,
					files: processedFiles,
					avatarUrl
				}
			};
		} else if (block.type === BlockType.VIDEO) {
			// Pre-fetch video URLs
			const videoUrl = block.data.videoFileId ? await unwrap(getPublicUrl(block.data.videoFileId)) as string : null;
			const posterUrl = block.data.posterFileId ? await unwrap(getPublicUrl(block.data.posterFileId)) as string : null;
			return {
				...block,
				data: {
					...block.data,
					videoUrl,
					posterUrl
				}
			};
		} else if (block.type === BlockType.TWITTER) {
			// Pre-fetch Twitter avatar and image URLs
			const avatarUrl = block.data.avatarId ? await unwrap(getPublicUrl(block.data.avatarId)) as string : null;
			const imageUrl = block.data.imageFileId ? await unwrap(getPublicUrl(block.data.imageFileId)) as string : null;
			return {
				...block,
				data: {
					...block.data,
					avatarUrl,
					imageUrl
				}
			};
		}
		// Return other blocks unchanged
		return block;
	}));
}