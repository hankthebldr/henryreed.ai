import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface TagPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

// Mock data - replace with actual data fetching
const tags = {
  'next.js': {
    name: 'Next.js',
    description: 'Articles about Next.js framework, React development, and modern web applications.',
    posts: [
      {
        id: 1,
        title: 'Building Terminal Interfaces with Next.js',
        excerpt: 'Exploring modern approaches to creating web-based terminal emulators.',
        slug: 'building-terminal-interfaces-nextjs',
        publishedAt: '2024-01-15',
        tags: ['Next.js', 'Terminal', 'React'],
        category: 'Development',
      },
    ],
  },
  terminal: {
    name: 'Terminal',
    description: 'Articles about terminal emulators, command-line interfaces, and terminal-based applications.',
    posts: [
      {
        id: 1,
        title: 'Building Terminal Interfaces with Next.js',
        excerpt: 'Exploring modern approaches to creating web-based terminal emulators.',
        slug: 'building-terminal-interfaces-nextjs',
        publishedAt: '2024-01-15',
        tags: ['Next.js', 'Terminal', 'React'],
        category: 'Development',
      },
    ],
  },
  react: {
    name: 'React',
    description: 'Articles about React development, hooks, components, and best practices.',
    posts: [
      {
        id: 1,
        title: 'Building Terminal Interfaces with Next.js',
        excerpt: 'Exploring modern approaches to creating web-based terminal emulators.',
        slug: 'building-terminal-interfaces-nextjs',
        publishedAt: '2024-01-15',
        tags: ['Next.js', 'Terminal', 'React'],
        category: 'Development',
      },
      {
        id: 2,
        title: 'XTerm.js Integration Patterns',
        excerpt: 'Best practices for integrating XTerm.js in React applications.',
        slug: 'xterm-integration-patterns',
        publishedAt: '2024-01-10',
        tags: ['XTerm.js', 'React', 'TypeScript'],
        category: 'Tutorial',
      },
    ],
  },
  'xterm.js': {
    name: 'XTerm.js',
    description: 'Articles about XTerm.js library, terminal emulation, and web-based terminals.',
    posts: [
      {
        id: 2,
        title: 'XTerm.js Integration Patterns',
        excerpt: 'Best practices for integrating XTerm.js in React applications.',
        slug: 'xterm-integration-patterns',
        publishedAt: '2024-01-10',
        tags: ['XTerm.js', 'React', 'TypeScript'],
        category: 'Tutorial',
      },
    ],
  },
  typescript: {
    name: 'TypeScript',
    description: 'Articles about TypeScript, type safety, and modern JavaScript development.',
    posts: [
      {
        id: 2,
        title: 'XTerm.js Integration Patterns',
        excerpt: 'Best practices for integrating XTerm.js in React applications.',
        slug: 'xterm-integration-patterns',
        publishedAt: '2024-01-10',
        tags: ['XTerm.js', 'React', 'TypeScript'],
        category: 'Tutorial',
      },
    ],
  },
};

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = tags[slug as keyof typeof tags];
  
  if (!tag) {
    return {
      title: 'Tag Not Found',
    };
  }

  return {
    title: `#${tag.name} - Blog Tags - Henry Reed`,
    description: tag.description,
    openGraph: {
      title: `Posts tagged with #${tag.name}`,
      description: tag.description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Posts tagged with #${tag.name}`,
      description: tag.description,
    },
  };
}

export function generateStaticParams() {
  return Object.keys(tags).map((slug) => ({
    slug,
  }));
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { slug } = await params;
  const { page } = await searchParams;
  const tag = tags[slug as keyof typeof tags];
  const currentPage = parseInt(page ?? '1');

  if (!tag) {
    notFound();
  }

  const postsPerPage = 10;
  const totalPages = Math.ceil(tag.posts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = tag.posts.slice(startIndex, startIndex + postsPerPage);

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
          <div className="inline-block px-4 py-2 border border-terminal-cyan rounded mb-4">
            <span className="text-terminal-cyan font-mono text-sm">TAG</span>
          </div>
          
          <h1 className="text-4xl font-bold text-terminal-green mb-4 font-mono">
            &gt; #{tag.name.toUpperCase()}_POSTS
          </h1>
          
          <p className="text-terminal-cyan font-mono max-w-2xl mx-auto">
            {tag.description}
          </p>
          
          <div className="mt-6 text-terminal-green font-mono text-sm">
            {tag.posts.length} post{tag.posts.length !== 1 ? 's' : ''} tagged
          </div>
        </header>

        {tag.posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-hack-surface border border-terminal-amber rounded-lg p-8">
              <h2 className="text-2xl font-mono text-terminal-amber mb-4">
                NO_POSTS_FOUND
              </h2>
              <p className="text-terminal-green font-mono mb-6">
                No articles have been tagged with #{tag.name} yet.
              </p>
              <a
                href="/blog/create"
                className="inline-block px-4 py-2 border border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-hack-background transition-all font-mono"
              >
                CREATE_FIRST_POST
              </a>
            </div>
          </div>
        ) : (
          <main className="space-y-8">
            {paginatedPosts.map((post) => (
              <article
                key={post.id}
                className="bg-hack-surface border border-terminal-green rounded-lg p-6 hover:border-terminal-cyan transition-colors duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <a
                    href={`/categories/${post.category.toLowerCase()}`}
                    className="text-xs font-mono text-terminal-amber bg-hack-background px-2 py-1 rounded hover:text-terminal-green transition-colors"
                  >
                    {post.category}
                  </a>
                  <time className="text-xs font-mono text-terminal-green">
                    {post.publishedAt}
                  </time>
                </div>
                
                <h2 className="text-2xl font-mono text-terminal-green mb-3 hover:text-terminal-cyan transition-colors">
                  <a href={`/blog/${post.slug}`}>
                    {post.title}
                  </a>
                </h2>
                
                <p className="text-terminal-green text-sm mb-4">
                  {post.excerpt}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((postTag) => (
                    <a
                      key={postTag}
                      href={`/tags/${postTag.toLowerCase()}`}
                      className={`text-xs font-mono px-2 py-1 bg-hack-background rounded transition-colors ${
                        postTag.toLowerCase() === slug
                          ? 'text-terminal-green border border-terminal-green'
                          : 'text-terminal-cyan hover:text-terminal-green'
                      }`}
                    >
                      #{postTag}
                    </a>
                  ))}
                </div>
                
                <a
                  href={`/blog/${post.slug}`}
                  className="inline-block text-terminal-green font-mono hover:text-terminal-cyan transition-colors"
                >
                  READ_MORE &gt;&gt;
                </a>
              </article>
            ))}
          </main>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-12 flex justify-center space-x-4">
            {currentPage > 1 && (
              <a
                href={`/tags/${slug}?page=${currentPage - 1}`}
                className="px-4 py-2 border border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-hack-background transition-all font-mono"
              >
                &lt; PREV
              </a>
            )}
            
            <span className="px-4 py-2 border border-terminal-cyan text-terminal-cyan font-mono">
              {currentPage} / {totalPages}
            </span>
            
            {currentPage < totalPages && (
              <a
                href={`/tags/${slug}?page=${currentPage + 1}`}
                className="px-4 py-2 border border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-hack-background transition-all font-mono"
              >
                NEXT &gt;
              </a>
            )}
          </nav>
        )}

        {/* Popular Tags */}
        <div className="mt-16 border-t border-terminal-green pt-8">
          <h3 className="text-xl font-mono text-terminal-green mb-6">
            POPULAR_TAGS
          </h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(tags)
              .sort(([,a], [,b]) => b.posts.length - a.posts.length)
              .map(([tagSlug, tagData]) => (
                <a
                  key={tagSlug}
                  href={`/tags/${tagSlug}`}
                  className={`inline-block px-3 py-2 rounded font-mono text-sm transition-colors ${
                    tagSlug === slug
                      ? 'bg-terminal-green text-hack-background border border-terminal-green'
                      : 'bg-hack-surface border border-terminal-cyan text-terminal-cyan hover:border-terminal-green hover:text-terminal-green'
                  }`}
                >
                  #{tagData.name} ({tagData.posts.length})
                </a>
              ))}
          </div>
        </div>

        {/* Tag Cloud Visualization */}
        <div className="mt-12 text-center">
          <h4 className="text-lg font-mono text-terminal-green mb-4">
            TAG_CLOUD.EXE
          </h4>
          <div className="bg-hack-surface border border-terminal-green rounded-lg p-6">
            <div className="flex flex-wrap justify-center gap-2">
              {Object.entries(tags).map(([tagSlug, tagData], index) => (
                <a
                  key={tagSlug}
                  href={`/tags/${tagSlug}`}
                  className="font-mono transition-colors hover:text-terminal-cyan"
                  style={{
                    fontSize: `${Math.max(0.75, Math.min(1.5, tagData.posts.length * 0.25 + 0.75))}rem`,
                    color: tagSlug === slug ? '#00ff00' : '#00ffff',
                    opacity: tagSlug === slug ? 1 : 0.7,
                  }}
                >
                  #{tagData.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
