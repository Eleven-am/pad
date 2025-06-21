# Toast Implementation Guide

This guide lists all locations in the codebase where toast notifications should be added for better user feedback.

## Setup
The project already has `sonner` installed and configured in the root layout. To use toasts, simply import and use:

```typescript
import { toast } from 'sonner';

// Success toast
toast.success('Operation completed successfully');

// Error toast
toast.error('Operation failed');

// Info toast
toast.info('Processing...');

// Promise toast
toast.promise(somePromise, {
  loading: 'Loading...',
  success: 'Done!',
  error: 'Failed!',
});
```

## Locations Requiring Toast Implementation

### 1. Collaboration Settings (`/src/components/collaboration/collaboration-settings.tsx`)
**Line 33-35**: Replace TODO comment
```typescript
} catch (error) {
  console.error('Failed to update role:', error);
  toast.error('Failed to update role. Please try again.');
}
```

### 2. Invite Collaborator Modal (`/src/components/collaboration/invite-collaborator-modal.tsx`)
**Line 40-42**: Add toast for error
```typescript
} catch (error) {
  console.error('Failed to invite collaborator:', error);
  toast.error('Failed to send invitation. Please try again.');
}
```
**Line 37**: Add success toast
```typescript
toast.success(`Invitation sent to ${email}`);
onOpenChange(false);
```

### 3. useCollaboratorManagement Hook (`/src/components/collaboration/hooks/useCollaboratorManagement.ts`)
**Line 31-33**: Add error toast
```typescript
} catch (error) {
  console.error('Failed to update role:', error);
  toast.error('Failed to update collaborator role');
}
```
**Line 28**: Add success toast
```typescript
await refresh();
toast.success('Role updated successfully');
```

### 4. usePostActivity Hook (`/src/components/collaboration/hooks/usePostActivity.ts`)
**Line 45-46**: Add error toast
```typescript
setError(errorMessage);
toast.error('Failed to load activity');
```

### 5. usePostActions Hook (`/src/components/sidebars/manage-post/hooks/usePostActions.ts`)
**Line 39-41**: Add error toast
```typescript
} catch (error) {
  console.error('Failed to save post:', error);
  toast.error('Failed to save post. Please try again.');
}
```
**Line 36**: Add success toast
```typescript
await mutateAsync({ postId, data });
toast.success('Post saved successfully');
```

**Line 50-52**: Add error toast for publish
```typescript
} catch (error) {
  console.error('Failed to publish post:', error);
  toast.error('Failed to publish post. Please try again.');
}
```
**Line 47**: Add success toast
```typescript
await mutateAsync({ postId, data: { published: true } });
toast.success('Post published successfully');
```

### 6. useCategoryManagement Hook (`/src/components/sidebars/manage-post/hooks/useCategoryManagement.ts`)
**Line 60-62**: Add error toast
```typescript
} catch (error) {
  console.error('Failed to create category:', error);
  toast.error('Failed to create category');
}
```
**Line 56**: Add success toast
```typescript
setCategorySearch('');
toast.success('Category created successfully');
```

### 7. useTagManagement Hook (`/src/components/sidebars/manage-post/hooks/useTagManagement.ts`)
**Line 65-67**: Add error toast
```typescript
} catch (error) {
  console.error('Failed to create tag:', error);
  toast.error('Failed to create tag');
}
```
**Line 61**: Add success toast
```typescript
setNewTag('');
toast.success('Tag created successfully');
```

**Line 76-78**: Add error toast for updating tags
```typescript
} catch (error) {
  console.error('Failed to update post tags:', error);
  toast.error('Failed to update tags');
}
```
**Line 73**: Add success toast
```typescript
await updatePostTags.mutateAsync({ postId, tagIds });
toast.success('Tags updated successfully');
```

### 8. Upload Component (`/src/components/upload-component.tsx`)
**Line 55-57**: Replace console.error with toast
```typescript
} catch (uploadError) {
  console.error("Upload failed:", uploadError);
  toast.error('Upload failed. Please try again.');
  setError("Upload failed");
}
```
**After Line 52**: Add success toast
```typescript
const result = await uploadMutation.mutateAsync(formData);
toast.success('File uploaded successfully');
```

### 9. Auth Component (`/src/components/auth-component.tsx`)
**Line 27-29**: Add error toast
```typescript
onError: () => {
  console.log("Failed");
  toast.error('Login failed. Please try again.');
},
```

### 10. Code Block (`/src/components/blocks/code/code-block.tsx`)
**Line 51-53**: Add error toast
```typescript
} catch (err) {
  console.error('Failed to copy:', err);
  toast.error('Failed to copy code');
}
```
**Line 49**: Add success toast
```typescript
setCopied(true);
toast.success('Code copied to clipboard');
```

### 11. Instagram Block Sidebar (`/src/components/blocks/instagram/instagram-block-sidebar.tsx`)
**Line 77-79**: Add error toast
```typescript
} catch (error) {
  console.error("Error fetching Instagram data:", error);
  toast.error('Failed to fetch Instagram post');
}
```
**Line 74**: Add success toast
```typescript
setFetchedData(result.data as CreateInstagramBlockInput);
toast.success('Instagram post fetched successfully');
```

### 12. Chart Block Sidebar (`/src/components/blocks/chart/chart-block-sidebar.tsx`)
**Line 103-105**: Add error toast
```typescript
} catch (error) {
  console.error('Failed to analyze file:', error);
  toast.error('Failed to analyze file data');
  setIsAnalyzing(false);
}
```
**Line 97**: Add success toast
```typescript
setSeriesOptions(detectedColumns);
toast.success('File analyzed successfully');
```

## Implementation Priority

1. **High Priority** (User-facing operations):
   - Post save/publish operations
   - File uploads
   - Collaborator invitations
   - Authentication errors

2. **Medium Priority** (Data operations):
   - Category/tag creation
   - Role updates
   - Instagram/chart data fetching

3. **Low Priority** (Background operations):
   - Activity fetching
   - Copy to clipboard

## Best Practices

1. **Be specific** in error messages
2. **Use loading states** for async operations with `toast.promise()`
3. **Keep messages concise** and actionable
4. **Use appropriate toast types**:
   - `success` for completed actions
   - `error` for failures
   - `info` for neutral information
   - `warning` for important notices

## Example Implementation Pattern

```typescript
const handleOperation = async () => {
  try {
    const result = await someAsyncOperation();
    toast.success('Operation completed successfully');
    // ... handle success
  } catch (error) {
    console.error('Operation failed:', error);
    toast.error('Operation failed. Please try again.');
    // ... handle error
  }
};

// Or using toast.promise for better UX
const handleOperation = async () => {
  await toast.promise(
    someAsyncOperation(),
    {
      loading: 'Processing...',
      success: 'Operation completed!',
      error: 'Operation failed',
    }
  );
};
```