import { Timestamp } from 'firebase/firestore';

// Base model with common fields
export interface BaseModel {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// User Profile model
export interface UserProfile extends BaseModel {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  website?: string;
  role: 'admin' | 'author' | 'reader';
  isActive: boolean;
  lastLoginAt?: Timestamp;
}

// Category model
export interface Category extends BaseModel {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  postCount: number;
  isActive: boolean;
  parentId?: string; // For nested categories
}

// Tag model
export interface Tag extends BaseModel {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  postCount: number;
  isActive: boolean;
}

// Post model
export interface Post extends BaseModel {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status: 'draft' | 'published' | 'archived';
  authorId: string;
  categoryIds: string[];
  tagIds: string[];
  publishedAt?: Timestamp;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  readingTime: number; // in minutes
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    canonicalUrl?: string;
  };
}

// Comment model
export interface Comment extends BaseModel {
  postId: string;
  authorId: string;
  content: string;
  parentId?: string; // For nested comments
  status: 'pending' | 'approved' | 'spam' | 'rejected';
  likeCount: number;
  isEdited: boolean;
  editedAt?: Timestamp;
}

// Firestore converter interfaces
export interface FirestoreConverter<T> {
  toFirestore: (data: Partial<T>) => Record<string, any>;
  fromFirestore: (snapshot: any) => T;
}

// Query options for pagination and filtering
export interface QueryOptions {
  limit?: number;
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  where?: {
    field: string;
    operator: '==' | '!=' | '>' | '>=' | '<' | '<=' | 'array-contains' | 'in' | 'not-in';
    value: any;
  }[];
  startAfter?: any;
}

// API response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

// Pagination metadata
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
