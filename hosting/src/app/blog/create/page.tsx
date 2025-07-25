'use client';

import { Metadata } from 'next';
import { useState } from 'react';

// Note: This would typically require authentication middleware
// For now, we'll assume the user is authenticated

export default function CreateBlogPostPage() {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Development',
    tags: '',
    publishedAt: new Date().toISOString().split('T')[0],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Auto-generate slug from title
    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({
        ...prev,
        slug,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In a real app, this would send to your API
      console.log('Creating blog post:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to the new post (in a real app)
      window.location.href = `/blog/${formData.slug}`;
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-hack-background p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <nav className="mb-4">
            <a
              href="/blog"
              className="text-terminal-cyan font-mono hover:text-terminal-green transition-colors"
            >
              &lt; BACK_TO_BLOG
            </a>
          </nav>
          
          <h1 className="text-4xl font-bold text-terminal-green mb-4 font-mono">
            &gt; CREATE_POST.EXE
          </h1>
          <p className="text-terminal-cyan font-mono">
            Author new blog content
          </p>
        </header>

        <form onSubmit={handleSubmit} className="bg-hack-surface border border-terminal-green rounded-lg p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-terminal-green font-mono text-sm mb-2">
                TITLE*
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full bg-hack-background border border-terminal-green text-terminal-green font-mono p-3 rounded focus:border-terminal-cyan focus:outline-none"
                placeholder="Enter post title..."
              />
            </div>

            <div>
              <label className="block text-terminal-green font-mono text-sm mb-2">
                SLUG
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className="w-full bg-hack-background border border-terminal-green text-terminal-green font-mono p-3 rounded focus:border-terminal-cyan focus:outline-none"
                placeholder="url-friendly-slug"
              />
            </div>
          </div>

          <div>
            <label className="block text-terminal-green font-mono text-sm mb-2">
              EXCERPT*
            </label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              required
              rows={3}
              className="w-full bg-hack-background border border-terminal-green text-terminal-green font-mono p-3 rounded focus:border-terminal-cyan focus:outline-none resize-vertical"
              placeholder="Brief description of the post..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-terminal-green font-mono text-sm mb-2">
                CATEGORY
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full bg-hack-background border border-terminal-green text-terminal-green font-mono p-3 rounded focus:border-terminal-cyan focus:outline-none"
              >
                <option value="Development">Development</option>
                <option value="Tutorial">Tutorial</option>
                <option value="Opinion">Opinion</option>
                <option value="News">News</option>
                <option value="Review">Review</option>
              </select>
            </div>

            <div>
              <label className="block text-terminal-green font-mono text-sm mb-2">
                TAGS
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full bg-hack-background border border-terminal-green text-terminal-green font-mono p-3 rounded focus:border-terminal-cyan focus:outline-none"
                placeholder="tag1, tag2, tag3"
              />
            </div>

            <div>
              <label className="block text-terminal-green font-mono text-sm mb-2">
                PUBLISH_DATE
              </label>
              <input
                type="date"
                name="publishedAt"
                value={formData.publishedAt}
                onChange={handleInputChange}
                className="w-full bg-hack-background border border-terminal-green text-terminal-green font-mono p-3 rounded focus:border-terminal-cyan focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-terminal-green font-mono text-sm mb-2">
              CONTENT* (Markdown supported)
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows={20}
              className="w-full bg-hack-background border border-terminal-green text-terminal-green font-mono p-3 rounded focus:border-terminal-cyan focus:outline-none resize-vertical text-sm"
              placeholder="# Your Blog Post Title

Write your content here using Markdown syntax...

## Section Heading

Some content here.

```javascript
// Code blocks are supported
console.log('Hello, world!');
```"
            />
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-terminal-green">
            <div className="text-xs font-mono text-terminal-cyan">
              * Required fields
            </div>
            
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-2 border border-terminal-amber text-terminal-amber hover:bg-terminal-amber hover:text-hack-background transition-all font-mono"
                disabled={isSubmitting}
              >
                CANCEL
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting || !formData.title || !formData.excerpt || !formData.content}
                className="px-6 py-2 border border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-hack-background transition-all font-mono disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'CREATING...' : 'CREATE_POST'}
              </button>
            </div>
          </div>
        </form>

        {/* Preview section could be added here */}
        <div className="mt-8 text-center text-xs font-mono text-terminal-cyan">
          TIP: Use Markdown syntax for formatting. Preview functionality coming soon.
        </div>
      </div>
    </div>
  );
}
