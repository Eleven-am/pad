'use client'

import {use} from 'react';
import Image from "next/image";

interface Author {
	id: string;
	name: string | null;
	email: string;
	avatarFile: { id: string; path: string } | null;
	joinedAt?: Date | null;
}


interface AuthorWithAvatar extends Author {
	avatarUrl: string | null;
	isOwner: boolean;
}

interface MultiAuthorDisplayProps {
	authorsPromise: Promise<{
		allAuthors: AuthorWithAvatar[];
	}>;
	className?: string;
}

export function MultiAuthorDisplay ({authorsPromise, className}: MultiAuthorDisplayProps) {
	const {allAuthors} = use (authorsPromise);
	
	console.log(allAuthors);
	if ( ! allAuthors || allAuthors.length === 0) {
		return null;
	}
	
	if (allAuthors.length === 1) {
		// Single author - display as before
		const author = allAuthors[0];
		return (
			<div className={`flex items-center gap-2 ${className}`}>
        <span className="inline-block h-6 w-6 rounded-full bg-muted overflow-hidden">
          {author.avatarUrl ? (
			  <img
				  src={author.avatarUrl}
				  alt={author.name || 'Author'}
				  width={24}
				  height={24}
			  />
		  ) : (
			  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
				  {author.name?.charAt (0)?.toUpperCase () || 'A'}
			  </div>
		  )}
        </span>
				<span>{author.name}</span>
			</div>
		);
	}
	
	// Multiple authors - show all with indicators
	return (
		<div className={`flex items-center gap-2 ${className}`}>
			<div className="flex items-center -space-x-2">
				{allAuthors.slice (0, 3).map ((author, index) => (
					<div
						key={author.id}
						className="inline-block h-6 w-6 rounded-full bg-muted overflow-hidden border-2 border-background"
						style={{zIndex: allAuthors.length - index}}
						title={`${author.name}${author.isOwner ? ' (Author)' : ' (Co-author)'}`}
					>
						{author.avatarUrl ? (
							<Image
								src={author.avatarUrl}
								alt={author.name || 'Author'}
								width={24}
								height={24}
							/>
						) : (
							<div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
								{author.name?.charAt (0)?.toUpperCase () || 'A'}
							</div>
						)}
					</div>
				))}
				{allAuthors.length > 3 && (
					<div
						className="inline-flex h-6 w-6 rounded-full bg-muted border-2 border-background items-center justify-center text-xs font-medium"
						title={`+${allAuthors.length - 3} more authors`}
					>
						+{allAuthors.length - 3}
					</div>
				)}
			</div>
			<div className="flex flex-col">
        <span className="text-xs">
          {allAuthors[0].name}
			{allAuthors.length > 1 && ` + ${allAuthors.length - 1} co-author${allAuthors.length > 2 ? 's' : ''}`}
        </span>
			</div>
		</div>
	);
}