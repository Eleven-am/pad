import { getPostAuthorsPublic, getPublicUrl, unwrap } from "@/lib/data";

export interface AuthorBase {
	id: string;
	name: string | null;
	email: string;
	avatarFile: { id: string; path: string } | null;
	image?: string | null;
}

export interface PostCoAuthor extends AuthorBase {
	joinedAt: Date | null;
}

export interface AuthorsData {
	owner: AuthorBase | null;
	coAuthors: PostCoAuthor[];
}

export interface AuthorWithAvatar extends AuthorBase {
	avatarUrl: string | null;
	isOwner: boolean;
	joinedAt?: Date | null;
}

export async function getAuthorsWithAvatars(postId: string): Promise<{ allAuthors: AuthorWithAvatar[] }> {
	const authorsData = await unwrap(getPostAuthorsPublic(postId)) as AuthorsData;
	const { owner, coAuthors } = authorsData;
	
	if (!owner) {
		return { allAuthors: [] };
	}

	const ownerAvatarUrl = owner.avatarFile 
		? await unwrap(getPublicUrl(owner.avatarFile.id)) as string 
		: owner.image || null;

	const coAuthorsWithAvatars = await Promise.all(
		coAuthors.map(async (coAuthor: PostCoAuthor) => ({
			...coAuthor,
			avatarUrl: coAuthor.avatarFile 
				? await unwrap(getPublicUrl(coAuthor.avatarFile.id)) as string 
				: coAuthor.image || null,
			isOwner: false
		}))
	);

	const allAuthors: AuthorWithAvatar[] = [
		{ ...owner, avatarUrl: ownerAvatarUrl, isOwner: true },
		...coAuthorsWithAvatars
	];

	return { allAuthors };
}