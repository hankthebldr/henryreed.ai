'use client';

import { Metadata } from 'next';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Define the Post interface
interface Post {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  publishedAt: string;
  tags: string[];
  category: string;
  author: string;
}

// Mock data - replace with actual search API
const posts: Post[] = [
  {
    id: 1,
    title: 'Building Terminal Interfaces with Next.js',
    excerpt: 'Exploring modern approaches to creating web-based terminal emulators.',
    content: 'In this comprehensive guide, we\'ll explore how to create modern, web-based terminal emulators using Next.js and various terminal libraries. Terminal interfaces have become increasingly popular in web applications.',
    slug: 'building-terminal-interfaces-nextjs',
    publishedAt: '2024-01-15',
    tags: ['Next.js', 'Terminal', 'React'],
    category: 'Development',
    author: 'Henry Reed',
  },
  {
    id: 2,
    title: 'XTerm.js Integration Patterns',
    excerpt: 'Best practices for integrating XTerm.js in React applications.',
    content: 'Best practices and patterns for integrating XTerm.js into React applications effectively. XTerm.js is powerful, but integrating it properly with React requires understanding its lifecycle.',
    slug: 'xterm-integration-patterns',
    publishedAt: '2024-01-10',
    tags: ['XTerm.js', 'React', 'TypeScript'],
    category: 'Tutorial',
    author: 'Henry Reed',
  },
];

interface SearchResult extends Post {
  score: number;
  matchedField: string;
  matchedText: string;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams?.get('q') || '');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [filters, setFilters] = useState({
    category: 'all',
    sortBy: 'relevance',
    dateRange: 'all',
  });

  // Simulated search function
  const performSearch = useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    const searchTerm = query.toLowerCase();
    const results: SearchResult[] = [];

    posts.forEach(post => {
      let score = 0;
      let matchedField = '';
      let matchedText = '';

      // Search in title (highest weight)
      if (post.title.toLowerCase().includes(searchTerm)) {
        score += 10;
        matchedField = 'title';
        matchedText = post.title;
      }

      // Search in excerpt (medium weight)
      if (post.excerpt.toLowerCase().includes(searchTerm)) {
        score += 5;
        if (!matchedField) {
          matchedField = 'excerpt';
          matchedText = post.excerpt;
        }
      }

      // Search in content (lower weight)
      if (post.content.toLowerCase().includes(searchTerm)) {
        score += 3;
        if (!matchedField) {
          matchedField = 'content';
          matchedText = post.content;
        }
      }

      // Search in tags
      post.tags.forEach(tag => {
        if (tag.toLowerCase().includes(searchTerm)) {
          score += 7;
          if (!matchedField) {
            matchedField = 'tags';
            matchedText = tag;
          }
        }
      });

      // Search in category
      if (post.category.toLowerCase().includes(searchTerm)) {
        score += 6;
        if (!matchedField) {
          matchedField = 'category';
          matchedText = post.category;
        }
      }

      if (score > 0) {
        results.push({
          ...post,
          score,
          matchedField,
          matchedText,
        });
      }
    });

    // Apply filters
    let filteredResults = results;

    if (filters.category !== 'all') {
      filteredResults = filteredResults.filter(
        result => result.category.toLowerCase() === filters.category
      );
    }

    // Sort by relevance or date
    if (filters.sortBy === 'relevance') {
      filteredResults.sort((a, b) => b.score - a.score);
    } else if (filters.sortBy === 'date') {
      filteredResults.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    }

    return filteredResults;
  }, [query, filters]);

  useEffect(() => {
    if (query.trim()) {
      setIsSearching(true);
      // Simulate API delay
      const timer = setTimeout(() => {
        setSearchResults(performSearch);
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [performSearch, query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update URL with search query
    const url = new URL(window.location.href);
    if (query.trim()) {
      url.searchParams.set('q', query);
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState({}, '', url.toString());
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-terminal-green text-hack-background px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="min-h-screen bg-hack-background p-6">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-8">
          <a
            href="/blog"
            className="text-terminal-cyan font-mono hover:text-terminal-green transition-colors"
          >
            &lt; BACK_TO_BLOG
          </a>
        </nav>

        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-terminal-green mb-4 font-mono">
            &gt; SEARCH_ENGINE.EXE
          </h1>
          <p className="text-terminal-cyan font-mono">
            Search through blog posts and articles
          </p>
        </header>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="bg-hack-surface border border-terminal-green rounded-lg p-6">
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter search terms..."
                  className="w-full bg-hack-background border border-terminal-green text-terminal-green font-mono p-3 rounded focus:border-terminal-cyan focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-6 py-3 border border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-hack-background transition-all font-mono disabled:opacity-50"
              >
                {isSearching ? 'SEARCHING...' : 'SEARCH'}
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-terminal-green">
              <div>
                <label className="block text-terminal-green font-mono text-sm mb-2">
                  CATEGORY
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-hack-background border border-terminal-green text-terminal-green font-mono p-2 rounded focus:border-terminal-cyan focus:outline-none text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="development">Development</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="opinion">Opinion</option>
                  <option value="news">News</option>
                  <option value="review">Review</option>
                </select>
              </div>

              <div>
                <label className="block text-terminal-green font-mono text-sm mb-2">
                  SORT_BY
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="w-full bg-hack-background border border-terminal-green text-terminal-green font-mono p-2 rounded focus:border-terminal-cyan focus:outline-none text-sm"
                >
                  <option value="relevance">Relevance</option>
                  <option value="date">Date (Newest)</option>
                  <option value="title">Title A-Z</option>
                </select>
              </div>

              <div>
                <label className="block text-terminal-green font-mono text-sm mb-2">
                  DATE_RANGE
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="w-full bg-hack-background border border-terminal-green text-terminal-green font-mono p-2 rounded focus:border-terminal-cyan focus:outline-none text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
            </div>
          </div>
        </form>

        {/* Search Results */}
        {query.trim() && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-terminal-green font-mono text-sm">
                {isSearching 
                  ? 'SEARCHING...' 
                  : `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${query}"`
                }
              </div>
              
              {searchResults.length > 0 && (
                <div className="text-terminal-cyan font-mono text-xs">
                  Search completed in ~{Math.random() * 100 + 50}ms
                </div>
              )}
            </div>

            {searchResults.length === 0 && !isSearching && query.trim() && (
              <div className="text-center py-12">
                <div className="bg-hack-surface border border-terminal-amber rounded-lg p-8">
                  <h3 className="text-2xl font-mono text-terminal-amber mb-4">
                    NO_RESULTS_FOUND
                  </h3>
                  <p className="text-terminal-green font-mono mb-6">
                    No posts match your search criteria. Try different keywords or filters.
                  </p>
                  <div className="text-terminal-cyan font-mono text-sm">
                    Suggestions:
                    <ul className="list-none mt-2 space-y-1">
                      <li>• Check spelling of search terms</li>
                      <li>• Try broader or different keywords</li>
                      <li>• Remove filters to expand results</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Results List */}
            <div className="space-y-6">
              {searchResults.map((result) => (
                <article
                  key={result.id}
                  className="bg-hack-surface border border-terminal-green rounded-lg p-6 hover:border-terminal-cyan transition-colors duration-300"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-xs font-mono text-terminal-amber bg-hack-background px-2 py-1 rounded">
                      {result.category}
                    </span>
                    <time className="text-xs font-mono text-terminal-green">
                      {result.publishedAt}
                    </time>
                    <span className="text-xs font-mono text-terminal-cyan">
                      Match in: {result.matchedField}
                    </span>
                    <span className="text-xs font-mono text-terminal-purple">
                      Score: {result.score}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl font-mono text-terminal-green mb-3 hover:text-terminal-cyan transition-colors">
                    <a href={`/blog/${result.slug}`}>
                      {highlightText(result.title, query)}
                    </a>
                  </h2>
                  
                  <p className="text-terminal-green text-sm mb-4">
                    {highlightText(result.excerpt, query)}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {result.tags.map((tag) => (
                      <a
                        key={tag}
                        href={`/tags/${tag.toLowerCase()}`}
                        className="text-xs font-mono text-terminal-cyan hover:text-terminal-green px-2 py-1 bg-hack-background rounded transition-colors"
                      >
                        #{highlightText(tag, query)}
                      </a>
                    ))}
                  </div>
                  
                  <a
                    href={`/blog/${result.slug}`}
                    className="inline-block text-terminal-green font-mono hover:text-terminal-cyan transition-colors"
                  >
                    READ_FULL_POST &gt;&gt;
                  </a>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Search Tips */}
        {!query.trim() && (
          <div className="bg-hack-surface border border-terminal-cyan rounded-lg p-8">
            <h3 className="text-xl font-mono text-terminal-cyan mb-4">
              SEARCH_TIPS.TXT
            </h3>
            <div className="text-terminal-green font-mono text-sm space-y-2">
              <div>• Search by title, content, tags, or category</div>
              <div>• Use filters to narrow down results</div>
              <div>• Search is case-insensitive</div>
              <div>• Try keywords like: "terminal", "react", "tutorial"</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-hack-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="text-terminal-green font-mono">
              Loading search interface...
            </div>
          </div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
