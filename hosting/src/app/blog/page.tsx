import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - Henry Reed',
  description: 'Technical articles and insights on software development, terminal interfaces, and modern web technologies.',
  openGraph: {
    title: 'Blog - Henry Reed',
    description: 'Technical articles and insights on software development.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - Henry Reed',
    description: 'Technical articles and insights on software development.',
  },
};

interface BlogPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { page } = await searchParams;
  const currentPage = parseInt(page ?? '1');
  
  // Mock blog posts data - replace with actual data fetching
  const posts = [
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
    // Add more posts as needed
  ];

  const postsPerPage = 10;
  const totalPages = Math.ceil(posts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = posts.slice(startIndex, startIndex + postsPerPage);

  return (
    <div className="min-h-screen bg-hack-background p-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-terminal-green mb-4 font-mono">
            &gt; BLOG_INDEX.EXE
          </h1>
          <p className="text-terminal-cyan font-mono">
            Technical articles and development insights
          </p>
        </header>

        <main className="space-y-8">
          {paginatedPosts.map((post) => (
            <article
              key={post.id}
              className="bg-hack-surface border border-terminal-green rounded-lg p-6 hover:border-terminal-cyan transition-colors duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="text-xs font-mono text-terminal-amber bg-hack-background px-2 py-1 rounded">
                  {post.category}
                </span>
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
                {post.tags.map((tag) => (
                  <a
                    key={tag}
                    href={`/tags/${tag.toLowerCase()}`}
                    className="text-xs font-mono text-terminal-cyan hover:text-terminal-green px-2 py-1 bg-hack-background rounded transition-colors"
                  >
                    #{tag}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-12 flex justify-center space-x-4">
            {currentPage > 1 && (
              <a
                href={`/blog?page=${currentPage - 1}`}
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
                href={`/blog?page=${currentPage + 1}`}
                className="px-4 py-2 border border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-hack-background transition-all font-mono"
              >
                NEXT &gt;
              </a>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
