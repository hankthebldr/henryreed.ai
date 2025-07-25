import { Metadata } from 'next';
import { notFound } from 'next/navigation';
interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

// Mock data - replace with actual data fetching
const categories = {
  development: {
    name: 'Development',
    description: 'Articles about software development, programming patterns, and technical insights.',
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
  tutorial: {
    name: 'Tutorial',
    description: 'Step-by-step guides and practical tutorials for developers.',
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
  opinion: {
    name: 'Opinion',
    description: 'Personal thoughts and perspectives on technology and development.',
    posts: [],
  },
  news: {
    name: 'News',
    description: 'Latest updates and news from the tech world.',
    posts: [],
  },
  review: {
    name: 'Review',
    description: 'Reviews of tools, frameworks, and technologies.',
    posts: [],
  },
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = categories[slug as keyof typeof categories];
  
  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} - Blog Categories - Henry Reed`,
    description: category.description,
    openGraph: {
      title: `${category.name} Articles`,
      description: category.description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} Articles`,
      description: category.description,
    },
  };
}

export function generateStaticParams() {
  return Object.keys(categories).map((slug) => ({
    slug,
  }));
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { page } = await searchParams;
  const category = categories[slug as keyof typeof categories];
  const currentPage = parseInt(page ?? '1');

  if (!category) {
    notFound();
  }

  const postsPerPage = 10;
  const totalPages = Math.ceil(category.posts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = category.posts.slice(startIndex, startIndex + postsPerPage);

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
          <div className="inline-block px-4 py-2 border border-terminal-amber rounded mb-4">
            <span className="text-terminal-amber font-mono text-sm">CATEGORY</span>
          </div>
          
          <h1 className="text-4xl font-bold text-terminal-green mb-4 font-mono">
            &gt; {category.name.toUpperCase()}_POSTS
          </h1>
          
          <p className="text-terminal-cyan font-mono max-w-2xl mx-auto">
            {category.description}
          </p>
          
          <div className="mt-6 text-terminal-green font-mono text-sm">
            {category.posts.length} post{category.posts.length !== 1 ? 's' : ''} found
          </div>
        </header>

        {category.posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-hack-surface border border-terminal-amber rounded-lg p-8">
              <h2 className="text-2xl font-mono text-terminal-amber mb-4">
                NO_POSTS_FOUND
              </h2>
              <p className="text-terminal-green font-mono mb-6">
                No articles have been published in this category yet.
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
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-12 flex justify-center space-x-4">
            {currentPage > 1 && (
              <a
                href={`/categories/${slug}?page=${currentPage - 1}`}
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
                href={`/categories/${slug}?page=${currentPage + 1}`}
                className="px-4 py-2 border border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-hack-background transition-all font-mono"
              >
                NEXT &gt;
              </a>
            )}
          </nav>
        )}

        {/* Related Categories */}
        <div className="mt-16 border-t border-terminal-green pt-8">
          <h3 className="text-xl font-mono text-terminal-green mb-6">
            OTHER_CATEGORIES
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(categories)
              .filter(([categorySlug]) => categorySlug !== slug)
              .map(([slug, cat]) => (
                <a
                  key={slug}
                  href={`/categories/${slug}`}
                  className="block bg-hack-surface border border-terminal-cyan rounded-lg p-4 hover:border-terminal-green transition-colors"
                >
                  <div className="text-terminal-cyan font-mono text-sm mb-2">
                    {cat.name}
                  </div>
                  <div className="text-xs text-terminal-green font-mono">
                    {cat.posts.length} posts
                  </div>
                </a>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
