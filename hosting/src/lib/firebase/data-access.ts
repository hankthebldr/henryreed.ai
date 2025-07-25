import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  CollectionReference,
  DocumentReference,
  Query,
  QueryConstraint,
  DocumentSnapshot,
  QuerySnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebase';
import {
  Post,
  Category,
  Tag,
  Comment,
  UserProfile,
  QueryOptions,
  ApiResponse,
  PaginationMeta,
  FirestoreConverter,
} from '../../types/blog';
import {
  postConverter,
  categoryConverter,
  tagConverter,
  commentConverter,
  userProfileConverter,
} from './converters';

// Generic base repository class
export class BaseRepository<T extends { id: string }> {
  protected collectionRef: CollectionReference;
  protected converter: FirestoreConverter<T>;

  constructor(collectionName: string, converter: FirestoreConverter<T>) {
    this.collectionRef = collection(db, collectionName);
    this.converter = converter;
  }

  // Get document by ID
  async findById(id: string): Promise<T | null> {
    try {
      const docRef = doc(this.collectionRef, id).withConverter(this.converter);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error(`Error fetching document ${id}:`, error);
      throw error;
    }
  }

  // Get all documents with optional filtering and pagination
  async findMany(options: QueryOptions = {}): Promise<T[]> {
    try {
      const queryRef = this.buildQuery(options);
      const querySnapshot = await getDocs(queryRef);
      return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  // Create new document
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docData = {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      const docRef = await addDoc(
        this.collectionRef.withConverter(this.converter),
        docData as any
      );
      return docRef.id;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  // Update existing document
  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const docRef = doc(this.collectionRef, id);
      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
      };
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error(`Error updating document ${id}:`, error);
      throw error;
    }
  }

  // Delete document
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(this.collectionRef, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document ${id}:`, error);
      throw error;
    }
  }

  // Build Firestore query from options
  protected buildQuery(options: QueryOptions): Query<T> {
    let queryRef: Query<T> = this.collectionRef.withConverter(this.converter);
    const constraints: QueryConstraint[] = [];

    // Add where clauses
    if (options.where) {
      options.where.forEach(condition => {
        constraints.push(where(condition.field, condition.operator, condition.value));
      });
    }

    // Add ordering
    if (options.orderBy) {
      constraints.push(orderBy(options.orderBy.field, options.orderBy.direction));
    }

    // Add limit
    if (options.limit) {
      constraints.push(limit(options.limit));
    }

    // Add pagination cursor
    if (options.startAfter) {
      constraints.push(startAfter(options.startAfter));
    }

    if (constraints.length > 0) {
      queryRef = query(queryRef, ...constraints);
    }

    return queryRef;
  }

  // Count documents matching criteria
  async count(options: Omit<QueryOptions, 'limit' | 'startAfter'> = {}): Promise<number> {
    try {
      const queryRef = this.buildQuery(options);
      const snapshot = await getDocs(queryRef);
      return snapshot.size;
    } catch (error) {
      console.error('Error counting documents:', error);
      throw error;
    }
  }
}

// Specific repository implementations
export class PostRepository extends BaseRepository<Post> {
  constructor() {
    super('posts', postConverter);
  }

  // Get published posts
  async findPublished(options: QueryOptions = {}): Promise<Post[]> {
    const publishedOptions = {
      ...options,
      where: [
        { field: 'status', operator: '==' as const, value: 'published' },
        ...(options.where || []),
      ],
    };
    return this.findMany(publishedOptions);
  }

  // Get posts by author
  async findByAuthor(authorId: string, options: QueryOptions = {}): Promise<Post[]> {
    const authorOptions = {
      ...options,
      where: [
        { field: 'authorId', operator: '==' as const, value: authorId },
        ...(options.where || []),
      ],
    };
    return this.findMany(authorOptions);
  }

  // Get posts by category
  async findByCategory(categoryId: string, options: QueryOptions = {}): Promise<Post[]> {
    const categoryOptions = {
      ...options,
      where: [
        { field: 'categoryIds', operator: 'array-contains' as const, value: categoryId },
        ...(options.where || []),
      ],
    };
    return this.findMany(categoryOptions);
  }

  // Get posts by tag
  async findByTag(tagId: string, options: QueryOptions = {}): Promise<Post[]> {
    const tagOptions = {
      ...options,
      where: [
        { field: 'tagIds', operator: 'array-contains' as const, value: tagId },
        ...(options.where || []),
      ],
    };
    return this.findMany(tagOptions);
  }

  // Increment view count
  async incrementViewCount(id: string): Promise<void> {
    try {
      const post = await this.findById(id);
      if (post) {
        await this.update(id, { viewCount: post.viewCount + 1 });
      }
    } catch (error) {
      console.error(`Error incrementing view count for post ${id}:`, error);
      throw error;
    }
  }
}

export class CategoryRepository extends BaseRepository<Category> {
  constructor() {
    super('categories', categoryConverter);
  }

  // Get active categories
  async findActive(options: QueryOptions = {}): Promise<Category[]> {
    const activeOptions = {
      ...options,
      where: [
        { field: 'isActive', operator: '==' as const, value: true },
        ...(options.where || []),
      ],
    };
    return this.findMany(activeOptions);
  }

  // Find by slug
  async findBySlug(slug: string): Promise<Category | null> {
    const categories = await this.findMany({
      where: [{ field: 'slug', operator: '==', value: slug }],
      limit: 1,
    });
    return categories[0] || null;
  }
}

export class TagRepository extends BaseRepository<Tag> {
  constructor() {
    super('tags', tagConverter);
  }

  // Get active tags
  async findActive(options: QueryOptions = {}): Promise<Tag[]> {
    const activeOptions = {
      ...options,
      where: [
        { field: 'isActive', operator: '==' as const, value: true },
        ...(options.where || []),
      ],
    };
    return this.findMany(activeOptions);
  }

  // Find by slug
  async findBySlug(slug: string): Promise<Tag | null> {
    const tags = await this.findMany({
      where: [{ field: 'slug', operator: '==', value: slug }],
      limit: 1,
    });
    return tags[0] || null;
  }
}

export class CommentRepository extends BaseRepository<Comment> {
  constructor() {
    super('comments', commentConverter);
  }

  // Get comments for a post
  async findByPost(postId: string, options: QueryOptions = {}): Promise<Comment[]> {
    const postOptions = {
      ...options,
      where: [
        { field: 'postId', operator: '==' as const, value: postId },
        ...(options.where || []),
      ],
      orderBy: options.orderBy || { field: 'createdAt', direction: 'desc' as const },
    };
    return this.findMany(postOptions);
  }

  // Get approved comments for a post
  async findApprovedByPost(postId: string, options: QueryOptions = {}): Promise<Comment[]> {
    const approvedOptions = {
      ...options,
      where: [
        { field: 'postId', operator: '==' as const, value: postId },
        { field: 'status', operator: '==' as const, value: 'approved' },
        ...(options.where || []),
      ],
    };
    return this.findMany(approvedOptions);
  }
}

export class UserProfileRepository extends BaseRepository<UserProfile> {
  constructor() {
    super('userProfiles', userProfileConverter);
  }

  // Find by UID
  async findByUid(uid: string): Promise<UserProfile | null> {
    const profiles = await this.findMany({
      where: [{ field: 'uid', operator: '==', value: uid }],
      limit: 1,
    });
    return profiles[0] || null;
  }

  // Update last login
  async updateLastLogin(uid: string): Promise<void> {
    const profile = await this.findByUid(uid);
    if (profile) {
      await this.update(profile.id, { lastLoginAt: Timestamp.now() });
    }
  }
}

// Repository instances
export const postRepository = new PostRepository();
export const categoryRepository = new CategoryRepository();
export const tagRepository = new TagRepository();
export const commentRepository = new CommentRepository();
export const userProfileRepository = new UserProfileRepository();
