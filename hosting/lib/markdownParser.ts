/**
 * Markdown Parser with Automatic Field Extraction
 * Uses gray-matter for frontmatter parsing and implements
 * intelligent field extraction from markdown content
 */

import matter from 'gray-matter';

export interface MarkdownMetadata {
  // Core fields extracted from frontmatter
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  author?: string;
  date?: string;

  // Auto-extracted fields
  keywords?: string[];
  relatedDocuments?: string[];
  topics?: string[];
  complexity?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedReadTime?: number;

  // Custom user fields
  customFields?: Record<string, any>;
}

export interface ParsedMarkdown {
  content: string;
  metadata: MarkdownMetadata;
  rawFrontmatter: Record<string, any>;
  links: string[];
  headings: string[];
  codeBlocks: string[];
}

/**
 * Parse markdown file and extract metadata
 */
export function parseMarkdown(markdownText: string): ParsedMarkdown {
  // Parse frontmatter using gray-matter
  const { data, content } = matter(markdownText);

  // Extract links from markdown
  const links = extractLinks(content);

  // Extract headings
  const headings = extractHeadings(content);

  // Extract code blocks
  const codeBlocks = extractCodeBlocks(content);

  // Auto-generate keywords from content
  const keywords = extractKeywords(content);

  // Determine complexity based on content analysis
  const complexity = determineComplexity(content, headings, codeBlocks);

  // Calculate estimated read time (average 200 words per minute)
  const estimatedReadTime = Math.ceil(content.split(/\s+/).length / 200);

  // Merge frontmatter with auto-extracted metadata
  const metadata: MarkdownMetadata = {
    title: data.title || extractTitle(content, headings),
    description: data.description || extractDescription(content),
    category: data.category,
    tags: data.tags || [],
    author: data.author,
    date: data.date,
    keywords,
    relatedDocuments: data.relatedDocuments || [],
    topics: data.topics || extractTopics(content, headings),
    complexity,
    estimatedReadTime,
    customFields: {}
  };

  return {
    content,
    metadata,
    rawFrontmatter: data,
    links,
    headings,
    codeBlocks
  };
}

/**
 * Extract markdown links [text](url) and [[wikilinks]]
 */
function extractLinks(content: string): string[] {
  const links: string[] = [];

  // Match standard markdown links
  const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = mdLinkRegex.exec(content)) !== null) {
    links.push(match[2]);
  }

  // Match wiki-style links [[page]]
  const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
  while ((match = wikiLinkRegex.exec(content)) !== null) {
    links.push(match[1]);
  }

  return [...new Set(links)]; // Remove duplicates
}

/**
 * Extract all headings from markdown
 */
function extractHeadings(content: string): string[] {
  const headingRegex = /^#{1,6}\s+(.+)$/gm;
  const headings: string[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    headings.push(match[1].trim());
  }

  return headings;
}

/**
 * Extract code blocks from markdown
 */
function extractCodeBlocks(content: string): string[] {
  const codeBlockRegex = /```[\s\S]*?```/g;
  const blocks = content.match(codeBlockRegex) || [];
  return blocks;
}

/**
 * Extract title from content if not in frontmatter
 */
function extractTitle(content: string, headings: string[]): string {
  // Try to find first H1
  const h1Regex = /^#\s+(.+)$/m;
  const match = content.match(h1Regex);
  if (match) return match[1].trim();

  // Fall back to first heading
  if (headings.length > 0) return headings[0];

  // Fall back to first line
  const firstLine = content.split('\n')[0];
  return firstLine.substring(0, 50).trim();
}

/**
 * Extract description from first paragraph
 */
function extractDescription(content: string): string {
  // Remove frontmatter and headings, get first paragraph
  const cleaned = content.replace(/^#{1,6}\s+.+$/gm, '').trim();
  const firstParagraph = cleaned.split('\n\n')[0];
  return firstParagraph.substring(0, 200).trim();
}

/**
 * Extract keywords using simple frequency analysis
 * In production, you could use NLP libraries like natural or compromise
 */
function extractKeywords(content: string, topN: number = 10): string[] {
  // Common words to ignore
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this',
    'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their'
  ]);

  // Extract words and count frequency
  const words = content
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));

  const frequency: Record<string, number> = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  // Sort by frequency and return top N
  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, topN)
    .map(([word]) => word);
}

/**
 * Extract topics from headings and content
 */
function extractTopics(content: string, headings: string[]): string[] {
  const topics = new Set<string>();

  // Use headings as topics
  headings.forEach(heading => {
    // Clean up heading text
    const cleaned = heading.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    if (cleaned.length > 0) {
      topics.add(cleaned);
    }
  });

  // Look for topic indicators in content
  const topicPatterns = [
    /(?:topic|subject|about|regarding):\s*([^\n.]+)/gi,
    /(?:covers?|discusses?|explains?):\s*([^\n.]+)/gi
  ];

  topicPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      topics.add(match[1].trim());
    }
  });

  return Array.from(topics).slice(0, 5);
}

/**
 * Determine complexity based on content characteristics
 */
function determineComplexity(
  content: string,
  headings: string[],
  codeBlocks: string[]
): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
  let score = 0;

  // Content length indicator
  const wordCount = content.split(/\s+/).length;
  if (wordCount > 2000) score += 2;
  else if (wordCount > 1000) score += 1;

  // Heading depth and structure
  if (headings.length > 10) score += 1;

  // Code blocks presence
  if (codeBlocks.length > 5) score += 2;
  else if (codeBlocks.length > 2) score += 1;

  // Technical terms
  const technicalTerms = [
    'algorithm', 'architecture', 'implementation', 'optimization',
    'integration', 'deployment', 'configuration', 'infrastructure',
    'kubernetes', 'docker', 'api', 'microservices', 'database'
  ];
  const technicalCount = technicalTerms.filter(term =>
    content.toLowerCase().includes(term)
  ).length;
  score += Math.min(technicalCount, 3);

  // Determine complexity level
  if (score <= 2) return 'beginner';
  if (score <= 4) return 'intermediate';
  if (score <= 6) return 'advanced';
  return 'expert';
}

/**
 * Generate suggested tags based on content
 */
export function generateSuggestedTags(parsed: ParsedMarkdown): string[] {
  const suggestions = new Set<string>();

  // Add keywords as potential tags
  if (parsed.metadata.keywords) {
    parsed.metadata.keywords.forEach(kw => suggestions.add(kw));
  }

  // Add category as tag
  if (parsed.metadata.category) {
    suggestions.add(parsed.metadata.category);
  }

  // Add complexity level
  if (parsed.metadata.complexity) {
    suggestions.add(parsed.metadata.complexity);
  }

  // Detect common patterns
  const patterns = {
    'tutorial': /tutorial|walkthrough|how-to|guide/i,
    'reference': /reference|documentation|api|specification/i,
    'troubleshooting': /troubleshoot|debug|error|fix|problem|issue/i,
    'best-practices': /best practice|recommendation|pattern|guideline/i,
    'security': /security|authentication|authorization|encryption|vulnerability/i,
    'performance': /performance|optimization|speed|latency|scalability/i
  };

  Object.entries(patterns).forEach(([tag, pattern]) => {
    if (pattern.test(parsed.content)) {
      suggestions.add(tag);
    }
  });

  return Array.from(suggestions).slice(0, 10);
}

/**
 * Extract relationships between documents based on links and references
 */
export function extractRelationships(
  parsed: ParsedMarkdown,
  existingDocs: string[]
): Array<{ target: string; type: string }> {
  const relationships: Array<{ target: string; type: string }> = [];

  // Link-based relationships
  parsed.links.forEach(link => {
    // Check if link references an existing document
    const matchedDoc = existingDocs.find(doc =>
      link.includes(doc) || doc.includes(link)
    );

    if (matchedDoc) {
      relationships.push({
        target: matchedDoc,
        type: 'references'
      });
    }
  });

  // Tag-based relationships
  if (parsed.metadata.tags) {
    parsed.metadata.tags.forEach(tag => {
      existingDocs.forEach(doc => {
        if (doc.toLowerCase().includes(tag.toLowerCase())) {
          relationships.push({
            target: doc,
            type: 'related-by-tag'
          });
        }
      });
    });
  }

  return relationships;
}
