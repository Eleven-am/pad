# File URL Hooks Documentation

## useFileId Hook

An optimized React hook for fetching file URLs by file ID with built-in caching, memoization, and request deduplication.

### Features:
- **In-memory caching** with 5-minute TTL
- **Request deduplication** - prevents multiple requests for the same file ID
- **Abort controller** support for canceling in-flight requests
- **Memoized return values** to prevent unnecessary re-renders
- **Automatic cleanup** on unmount
- **Error handling** with proper state management

### Usage:

```tsx
import { useFileId } from '@/hooks/useFileId';

function ImageComponent({ fileId }: { fileId: string }) {
  const { url, loading, error, reload } = useFileId(fileId);
  
  if (loading) return <Skeleton />;
  if (error) return <div>Error: {error}</div>;
  if (!url) return null;
  
  return <img src={url} alt="..." />;
}
```

### Cache Management:

```tsx
import { clearFileUrlCache, removeFromFileUrlCache } from '@/hooks/useFileId';

// Clear entire cache
clearFileUrlCache();

// Remove specific file from cache
removeFromFileUrlCache(fileId);
```

## useFileIds Hook (Batch Loading)

Optimized hook for loading multiple file URLs at once, sharing the same cache as `useFileId`.

### Features:
- **Batch loading** of multiple file IDs
- **Shared cache** with useFileId hook
- **Parallel requests** with proper error handling per file
- **Optimized re-renders** using Map data structures

### Usage:

```tsx
import { useFileIds } from '@/hooks/useFileIds';

function ImageGallery({ fileIds }: { fileIds: string[] }) {
  const { urls, loading, errors, reload } = useFileIds(fileIds);
  
  if (loading) return <GallerySkeletion />;
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {fileIds.map(fileId => {
        const url = urls.get(fileId);
        const error = errors.get(fileId);
        
        if (error) {
          return <div key={fileId}>Error loading image</div>;
        }
        
        if (!url) {
          return <Skeleton key={fileId} />;
        }
        
        return <img key={fileId} src={url} alt="..." />;
      })}
    </div>
  );
}
```

## Performance Benefits

1. **Caching**: URLs are cached for 5 minutes, reducing API calls
2. **Deduplication**: Multiple components requesting the same file ID will share a single request
3. **Memoization**: All callbacks and return values are memoized
4. **Abort Support**: In-flight requests are canceled when component unmounts or fileId changes
5. **Batch Loading**: Multiple files can be loaded in parallel with a single hook

## Best Practices

1. **Use useFileId for single images** (avatars, featured images, etc.)
2. **Use useFileIds for galleries** or multiple images
3. **Don't call hooks conditionally** - pass empty string/array if no file ID
4. **Consider preloading** critical images by calling the hook early
5. **Handle loading and error states** appropriately in your UI