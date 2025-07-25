import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
} from 'firebase/firestore';
import {
  Post,
  Category,
  Tag,
  Comment,
  UserProfile,
  FirestoreConverter,
} from '../../types/blog';

// Base converter utilities
const createBaseConverter = <T extends { id: string }>(): Partial<FirestoreConverter<T>> => ({
  toFirestore: (data: Partial<T>): DocumentData => {
    const { id, ...rest } = data as any;
    return {
      ...rest,
      updatedAt: Timestamp.now(),
    };
  },
});

// Post converter
export const postConverter: FirestoreConverter<Post> = {
  toFirestore: (post: Partial<Post>): DocumentData => {
    const { id, ...data } = post;
    return {
      ...data,
      updatedAt: Timestamp.now(),
      createdAt: data.createdAt || Timestamp.now(),
    };
  },
  fromFirestore: (
    snapshot: QueryDocumentSnapshot<DocumentData>,
    options?: SnapshotOptions
  ): Post => {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      title: data.title || '',
      slug: data.slug || '',
      content: data.content || '',
      excerpt: data.excerpt,
      featuredImage: data.featuredImage,
      status: data.status || 'draft',
      authorId: data.authorId || '',
      categoryIds: data.categoryIds || [],
      tagIds: data.tagIds || [],
      publishedAt: data.publishedAt,
      viewCount: data.viewCount || 0,
      likeCount: data.likeCount || 0,
      commentCount: data.commentCount || 0,
      readingTime: data.readingTime || 0,
      seo: data.seo || {},
      createdAt: data.createdAt || Timestamp.now(),
      updatedAt: data.updatedAt || Timestamp.now(),
    };
  },
};

// Category converter
export const categoryConverter: FirestoreConverter<Category> = {
  toFirestore: (category: Partial<Category>): DocumentData => {
    const { id, ...data } = category;
    return {
      ...data,
      updatedAt: Timestamp.now(),
      createdAt: data.createdAt || Timestamp.now(),
    };
  },
  fromFirestore: (
    snapshot: QueryDocumentSnapshot<DocumentData>,
    options?: SnapshotOptions
  ): Category => {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      name: data.name || '',
      slug: data.slug || '',
      description: data.description,
      color: data.color,
      postCount: data.postCount || 0,
      isActive: data.isActive !== false,
      parentId: data.parentId,
      createdAt: data.createdAt || Timestamp.now(),
      updatedAt: data.updatedAt || Timestamp.now(),
    };
  },
};

// Tag converter
export const tagConverter: FirestoreConverter<Tag> = {
  toFirestore: (tag: Partial<Tag>): DocumentData => {
    const { id, ...data } = tag;
    return {
      ...data,
      updatedAt: Timestamp.now(),
      createdAt: data.createdAt || Timestamp.now(),
    };
  },
  fromFirestore: (
    snapshot: QueryDocumentSnapshot<DocumentData>,
    options?: SnapshotOptions
  ): Tag => {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      name: data.name || '',
      slug: data.slug || '',
      description: data.description,
      color: data.color,
      postCount: data.postCount || 0,
      isActive: data.isActive !== false,
      createdAt: data.createdAt || Timestamp.now(),
      updatedAt: data.updatedAt || Timestamp.now(),
    };
  },
};

// Comment converter
export const commentConverter: FirestoreConverter<Comment> = {
  toFirestore: (comment: Partial<Comment>): DocumentData => {
    const { id, ...data } = comment;
    return {
      ...data,
      updatedAt: Timestamp.now(),
      createdAt: data.createdAt || Timestamp.now(),
    };
  },
  fromFirestore: (
    snapshot: QueryDocumentSnapshot<DocumentData>,
    options?: SnapshotOptions
  ): Comment => {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      postId: data.postId || '',
      authorId: data.authorId || '',
      content: data.content || '',
      parentId: data.parentId,
      status: data.status || 'pending',
      likeCount: data.likeCount || 0,
      isEdited: data.isEdited || false,
      editedAt: data.editedAt,
      createdAt: data.createdAt || Timestamp.now(),
      updatedAt: data.updatedAt || Timestamp.now(),
    };
  },
};

// UserProfile converter
export const userProfileConverter: FirestoreConverter<UserProfile> = {
  toFirestore: (userProfile: Partial<UserProfile>): DocumentData => {
    const { id, ...data } = userProfile;
    return {
      ...data,
      updatedAt: Timestamp.now(),
      createdAt: data.createdAt || Timestamp.now(),
    };
  },
  fromFirestore: (
    snapshot: QueryDocumentSnapshot<DocumentData>,
    options?: SnapshotOptions
  ): UserProfile => {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      uid: data.uid || '',
      email: data.email || '',
      displayName: data.displayName || '',
      photoURL: data.photoURL,
      bio: data.bio,
      website: data.website,
      role: data.role || 'reader',
      isActive: data.isActive !== false,
      lastLoginAt: data.lastLoginAt,
      createdAt: data.createdAt || Timestamp.now(),
      updatedAt: data.updatedAt || Timestamp.now(),
    };
  },
};
