import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  postRepository,
  categoryRepository,
  tagRepository,
  commentRepository,
  userProfileRepository,
} from '../lib/firebase/data-access';
import {
  Post,
  Category,
  Tag,
  Comment,
  UserProfile,
  QueryOptions,
} from '../types/blog';

// Query keys
export const queryKeys = {
  posts: ['posts'] as const,
  post: (id: string) => ['posts', id] as const,
  publishedPosts: ['posts', 'published'] as const,
  postsByAuthor: (authorId: string) => ['posts', 'author', authorId] as const,
  postsByCategory: (categoryId: string) => ['posts', 'category', categoryId] as const,
  postsByTag: (tagId: string) => ['posts', 'tag', tagId] as const,
  
  categories: ['categories'] as const,
  category: (id: string) => ['categories', id] as const,
  activeCategories: ['categories', 'active'] as const,
  categoryBySlug: (slug: string) => ['categories', 'slug', slug] as const,
  
  tags: ['tags'] as const,
  tag: (id: string) => ['tags', id] as const,
  activeTags: ['tags', 'active'] as const,
  tagBySlug: (slug: string) => ['tags', 'slug', slug] as const,
  
  comments: ['comments'] as const,
  comment: (id: string) => ['comments', id] as const,
  commentsByPost: (postId: string) => ['comments', 'post', postId] as const,
  approvedCommentsByPost: (postId: string) => ['comments', 'post', postId, 'approved'] as const,
  
  userProfiles: ['userProfiles'] as const,
  userProfile: (id: string) => ['userProfiles', id] as const,
  userProfileByUid: (uid: string) => ['userProfiles', 'uid', uid] as const,
};

// Post hooks
export const usePost = (id: string) => {
  return useQuery({
    queryKey: queryKeys.post(id),
    queryFn: () => postRepository.findById(id),
    enabled: !!id,
  });
};

export const usePosts = (options?: QueryOptions) => {
  return useQuery({
    queryKey: [...queryKeys.posts, options],
    queryFn: () => postRepository.findMany(options),
  });
};

export const usePublishedPosts = (options?: QueryOptions) => {
  return useQuery({
    queryKey: [...queryKeys.publishedPosts, options],
    queryFn: () => postRepository.findPublished(options),
  });
};

export const usePostsByAuthor = (authorId: string, options?: QueryOptions) => {
  return useQuery({
    queryKey: [...queryKeys.postsByAuthor(authorId), options],
    queryFn: () => postRepository.findByAuthor(authorId, options),
    enabled: !!authorId,
  });
};

export const usePostsByCategory = (categoryId: string, options?: QueryOptions) => {
  return useQuery({
    queryKey: [...queryKeys.postsByCategory(categoryId), options],
    queryFn: () => postRepository.findByCategory(categoryId, options),
    enabled: !!categoryId,
  });
};

export const usePostsByTag = (tagId: string, options?: QueryOptions) => {
  return useQuery({
    queryKey: [...queryKeys.postsByTag(tagId), options],
    queryFn: () => postRepository.findByTag(tagId, options),
    enabled: !!tagId,
  });
};

// Category hooks
export const useCategory = (id: string) => {
  return useQuery({
    queryKey: queryKeys.category(id),
    queryFn: () => categoryRepository.findById(id),
    enabled: !!id,
  });
};

export const useCategories = (options?: QueryOptions) => {
  return useQuery({
    queryKey: [...queryKeys.categories, options],
    queryFn: () => categoryRepository.findMany(options),
  });
};

export const useActiveCategories = (options?: QueryOptions) => {
  return useQuery({
    queryKey: [...queryKeys.activeCategories, options],
    queryFn: () => categoryRepository.findActive(options),
  });
};

export const useCategoryBySlug = (slug: string) => {
  return useQuery({
    queryKey: queryKeys.categoryBySlug(slug),
    queryFn: () => categoryRepository.findBySlug(slug),
    enabled: !!slug,
  });
};

// Tag hooks
export const useTag = (id: string) => {
  return useQuery({
    queryKey: queryKeys.tag(id),
    queryFn: () => tagRepository.findById(id),
    enabled: !!id,
  });
};

export const useTags = (options?: QueryOptions) => {
  return useQuery({
    queryKey: [...queryKeys.tags, options],
    queryFn: () => tagRepository.findMany(options),
  });
};

export const useActiveTags = (options?: QueryOptions) => {
  return useQuery({
    queryKey: [...queryKeys.activeTags, options],
    queryFn: () => tagRepository.findActive(options),
  });
};

export const useTagBySlug = (slug: string) => {
  return useQuery({
    queryKey: queryKeys.tagBySlug(slug),
    queryFn: () => tagRepository.findBySlug(slug),
    enabled: !!slug,
  });
};

// Comment hooks
export const useComment = (id: string) => {
  return useQuery({
    queryKey: queryKeys.comment(id),
    queryFn: () => commentRepository.findById(id),
    enabled: !!id,
  });
};

export const useCommentsByPost = (postId: string, options?: QueryOptions) => {
  return useQuery({
    queryKey: [...queryKeys.commentsByPost(postId), options],
    queryFn: () => commentRepository.findByPost(postId, options),
    enabled: !!postId,
  });
};

export const useApprovedCommentsByPost = (postId: string, options?: QueryOptions) => {
  return useQuery({
    queryKey: [...queryKeys.approvedCommentsByPost(postId), options],
    queryFn: () => commentRepository.findApprovedByPost(postId, options),
    enabled: !!postId,
  });
};

// User Profile hooks
export const useUserProfile = (id: string) => {
  return useQuery({
    queryKey: queryKeys.userProfile(id),
    queryFn: () => userProfileRepository.findById(id),
    enabled: !!id,
  });
};

export const useUserProfileByUid = (uid: string) => {
  return useQuery({
    queryKey: queryKeys.userProfileByUid(uid),
    queryFn: () => userProfileRepository.findByUid(uid),
    enabled: !!uid,
  });
};

// Mutation hooks
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) =>
      postRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
      queryClient.invalidateQueries({ queryKey: queryKeys.publishedPosts });
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Post> }) =>
      postRepository.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.post(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
      queryClient.invalidateQueries({ queryKey: queryKeys.publishedPosts });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => postRepository.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.post(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
      queryClient.invalidateQueries({ queryKey: queryKeys.publishedPosts });
    },
  });
};

export const useIncrementPostViewCount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => postRepository.incrementViewCount(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.post(id) });
    },
  });
};

// Similar mutation hooks for other entities
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) =>
      categoryRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      queryClient.invalidateQueries({ queryKey: queryKeys.activeCategories });
    },
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>) =>
      tagRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags });
      queryClient.invalidateQueries({ queryKey: queryKeys.activeTags });
    },
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) =>
      commentRepository.create(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.commentsByPost(data.postId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.approvedCommentsByPost(data.postId) 
      });
    },
  });
};
