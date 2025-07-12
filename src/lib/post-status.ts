export type PostStatus = 'draft' | 'published' | 'scheduled';

export interface PostWithStatusFields {
  published: boolean;
  publishedAt: Date | null;
  scheduledAt?: Date | null;
}

export function getPostStatus(post: PostWithStatusFields): PostStatus {
  if (!post.published) {
    return 'draft';
  }
  
  if (post.publishedAt && new Date(post.publishedAt) > new Date()) {
    return 'scheduled';
  }
  
  return 'published';
}

export function isPostLive(post: PostWithStatusFields): boolean {
  return post.published && 
         post.publishedAt !== null && 
         new Date(post.publishedAt) <= new Date();
}

export function isPostScheduled(post: PostWithStatusFields): boolean {
  return post.published && 
         post.publishedAt !== null && 
         new Date(post.publishedAt) > new Date();
}

export function getPostStatusDisplay(post: PostWithStatusFields): {
  status: PostStatus;
  label: string;
  variant: 'default' | 'secondary' | 'outline';
  color: string;
} {
  const status = getPostStatus(post);
  
  switch (status) {
    case 'published':
      return {
        status,
        label: 'Published',
        variant: 'default',
        color: 'text-green-600'
      };
    case 'scheduled':
      return {
        status,
        label: 'Scheduled',
        variant: 'secondary',
        color: 'text-orange-600'
      };
    case 'draft':
      return {
        status,
        label: 'Draft',
        variant: 'secondary',
        color: 'text-gray-600'
      };
  }
}