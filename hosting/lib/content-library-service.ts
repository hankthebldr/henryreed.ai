import { ContentItem } from '../components/ContentLibrary';

// Content Library Service for advanced operations
export class ContentLibraryService {
  private static instance: ContentLibraryService;
  private favorites: Set<string> = new Set();
  private usageStats: Map<string, { views: number; uses: number; lastAccessed: Date }> = new Map();
  
  static getInstance(): ContentLibraryService {
    if (!ContentLibraryService.instance) {
      ContentLibraryService.instance = new ContentLibraryService();
    }
    return ContentLibraryService.instance;
  }

  // Favorites Management
  toggleFavorite(itemId: string): boolean {
    if (this.favorites.has(itemId)) {
      this.favorites.delete(itemId);
      this.saveFavorites();
      return false;
    } else {
      this.favorites.add(itemId);
      this.saveFavorites();
      return true;
    }
  }

  isFavorite(itemId: string): boolean {
    return this.favorites.has(itemId);
  }

  getFavorites(): string[] {
    return Array.from(this.favorites);
  }

  private saveFavorites(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('contentLibrary_favorites', JSON.stringify(Array.from(this.favorites)));
    }
  }

  loadFavorites(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('contentLibrary_favorites');
      if (saved) {
        try {
          const favArray = JSON.parse(saved);
          this.favorites = new Set(favArray);
        } catch (e) {
          console.warn('Failed to load favorites:', e);
        }
      }
    }
  }

  // Usage Statistics
  trackView(itemId: string): void {
    const current = this.usageStats.get(itemId) || { views: 0, uses: 0, lastAccessed: new Date() };
    current.views += 1;
    current.lastAccessed = new Date();
    this.usageStats.set(itemId, current);
    this.saveUsageStats();
  }

  trackUsage(itemId: string): void {
    const current = this.usageStats.get(itemId) || { views: 0, uses: 0, lastAccessed: new Date() };
    current.uses += 1;
    current.lastAccessed = new Date();
    this.usageStats.set(itemId, current);
    this.saveUsageStats();
  }

  getUsageStats(itemId: string) {
    return this.usageStats.get(itemId) || { views: 0, uses: 0, lastAccessed: new Date() };
  }

  private saveUsageStats(): void {
    if (typeof window !== 'undefined') {
      const statsObject = Object.fromEntries(
        Array.from(this.usageStats.entries()).map(([key, value]) => [
          key,
          {
            ...value,
            lastAccessed: value.lastAccessed.toISOString()
          }
        ])
      );
      localStorage.setItem('contentLibrary_usage', JSON.stringify(statsObject));
    }
  }

  loadUsageStats(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('contentLibrary_usage');
      if (saved) {
        try {
          const statsObject = JSON.parse(saved);
          this.usageStats = new Map(
            Object.entries(statsObject).map(([key, value]: [string, any]) => [
              key,
              {
                ...value,
                lastAccessed: new Date(value.lastAccessed)
              }
            ])
          );
        } catch (e) {
          console.warn('Failed to load usage stats:', e);
        }
      }
    }
  }

  // Content Export/Import
  exportContent(items: ContentItem[]): string {
    const exportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      items: items,
      metadata: {
        totalItems: items.length,
        categories: [...new Set(items.map(item => item.category))],
        avgRating: items.reduce((sum, item) => sum + item.rating, 0) / items.length
      }
    };
    return JSON.stringify(exportData, null, 2);
  }

  importContent(jsonData: string): { success: boolean; items?: ContentItem[]; error?: string } {
    try {
      const importData = JSON.parse(jsonData);
      
      // Validate structure
      if (!importData.items || !Array.isArray(importData.items)) {
        return { success: false, error: 'Invalid format: missing items array' };
      }

      // Validate each item
      const validatedItems: ContentItem[] = [];
      for (const item of importData.items) {
        if (this.validateContentItem(item)) {
          validatedItems.push(item);
        } else {
          console.warn('Skipped invalid item:', item.id);
        }
      }

      return { success: true, items: validatedItems };
    } catch (error) {
      return { success: false, error: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  private validateContentItem(item: any): boolean {
    const requiredFields = ['id', 'title', 'description', 'category', 'difficulty', 'tags', 'author', 'version'];
    return requiredFields.every(field => item[field] !== undefined);
  }

  // Search and Filtering
  searchContent(items: ContentItem[], query: string): ContentItem[] {
    if (!query.trim()) return items;

    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    return items.filter(item => {
      const searchableText = [
        item.title,
        item.description,
        item.author,
        item.subcategory,
        ...item.tags,
        ...(item.metadata.platforms || []),
        ...(item.metadata.mitreAttck || [])
      ].join(' ').toLowerCase();

      return searchTerms.every(term => searchableText.includes(term));
    });
  }

  // Advanced Filtering
  filterContent(items: ContentItem[], filters: {
    categories?: string[];
    difficulties?: string[];
    minRating?: number;
    tags?: string[];
    dateRange?: { start: Date; end: Date };
  }): ContentItem[] {
    return items.filter(item => {
      // Category filter
      if (filters.categories && filters.categories.length > 0) {
        if (!filters.categories.includes(item.category)) return false;
      }

      // Difficulty filter
      if (filters.difficulties && filters.difficulties.length > 0) {
        if (!filters.difficulties.includes(item.difficulty)) return false;
      }

      // Rating filter
      if (filters.minRating && item.rating < filters.minRating) {
        return false;
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => 
          item.tags.some(itemTag => itemTag.toLowerCase().includes(tag.toLowerCase()))
        );
        if (!hasMatchingTag) return false;
      }

      // Date range filter
      if (filters.dateRange) {
        const itemDate = new Date(item.lastUpdated);
        if (itemDate < filters.dateRange.start || itemDate > filters.dateRange.end) {
          return false;
        }
      }

      return true;
    });
  }

  // Content Analytics
  getContentAnalytics(items: ContentItem[]) {
    const analytics = {
      totalItems: items.length,
      categoryCounts: {} as Record<string, number>,
      difficultyCounts: {} as Record<string, number>,
      avgRating: 0,
      totalUsage: 0,
      topTags: {} as Record<string, number>,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };

    items.forEach(item => {
      // Category counts
      analytics.categoryCounts[item.category] = (analytics.categoryCounts[item.category] || 0) + 1;

      // Difficulty counts
      analytics.difficultyCounts[item.difficulty] = (analytics.difficultyCounts[item.difficulty] || 0) + 1;

      // Rating calculations
      analytics.avgRating += item.rating;
      const ratingFloor = Math.floor(item.rating);
      if (ratingFloor >= 1 && ratingFloor <= 5) {
        analytics.ratingDistribution[ratingFloor as keyof typeof analytics.ratingDistribution]++;
      }

      // Usage totals
      analytics.totalUsage += item.usageCount;

      // Tag frequency
      item.tags.forEach(tag => {
        analytics.topTags[tag] = (analytics.topTags[tag] || 0) + 1;
      });
    });

    analytics.avgRating = analytics.avgRating / items.length;

    // Sort top tags
    const sortedTags = Object.entries(analytics.topTags)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    analytics.topTags = Object.fromEntries(sortedTags);

    return analytics;
  }

  // Content Recommendations
  getRecommendations(currentItem: ContentItem, allItems: ContentItem[], limit: number = 5): ContentItem[] {
    const recommendations = allItems
      .filter(item => item.id !== currentItem.id)
      .map(item => {
        let score = 0;

        // Same category bonus
        if (item.category === currentItem.category) score += 3;

        // Similar difficulty
        const difficultyOrder = ['beginner', 'intermediate', 'advanced', 'expert'];
        const currentLevel = difficultyOrder.indexOf(currentItem.difficulty);
        const itemLevel = difficultyOrder.indexOf(item.difficulty);
        const difficultyDistance = Math.abs(currentLevel - itemLevel);
        score += Math.max(0, 2 - difficultyDistance);

        // Tag overlap
        const commonTags = item.tags.filter(tag => currentItem.tags.includes(tag));
        score += commonTags.length;

        // MITRE ATT&CK overlap
        if (item.metadata.mitreAttck && currentItem.metadata.mitreAttck) {
          const commonTechniques = item.metadata.mitreAttck.filter(tech => 
            currentItem.metadata.mitreAttck?.includes(tech)
          );
          score += commonTechniques.length * 0.5;
        }

        // Platform overlap
        if (item.metadata.platforms && currentItem.metadata.platforms) {
          const commonPlatforms = item.metadata.platforms.filter(platform => 
            currentItem.metadata.platforms?.includes(platform)
          );
          score += commonPlatforms.length * 0.3;
        }

        // Rating bonus
        score += item.rating * 0.2;

        return { item, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(rec => rec.item);

    return recommendations;
  }

  // Initialize service
  initialize(): void {
    this.loadFavorites();
    this.loadUsageStats();
  }
}

// Export singleton instance
export const contentLibraryService = ContentLibraryService.getInstance();