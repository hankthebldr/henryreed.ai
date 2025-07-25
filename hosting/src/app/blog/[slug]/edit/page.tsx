'use client';

import { Metadata } from 'next';
import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';

interface EditBlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// Mock data - replace with actual data fetching
const posts = [
  {
    id: 1,
    title: 'Building Terminal Interfaces with Next.js',
    content: `# Building Terminal Interfaces with Next.js

In this comprehensive guide, we'll explore how to create modern, web-based terminal emulators using Next.js and various terminal libraries.

## Introduction

Terminal interfaces have become increasingly popular in web applications, especially for developer tools and system administration interfaces. With the power of modern web technologies, we can create rich, interactive terminal experiences that rival native applications.`,
    excerpt: 'Exploring modern approaches to creating web-based terminal emulators.',
    slug: 'building-terminal-interfaces-nextjs',
    publishedAt: '2024-01-15',
    tags: ['Next.js', 'Terminal', 'React'],
    category: 'Development',
    author: 'Henry Reed',
  },
  {
    id: 2,
    title: 'XTerm.js Integration Patterns',
    content: `# XTerm.js Integration Patterns

Best practices and patterns for integrating XTerm.js into React applications effectively.

## Overview

XTerm.js is powerful, but integrating it properly with React requires understanding its lifecycle and event handling patterns.`,
    excerpt: 'Best practices for integrating XTerm.js in React applications.',
    slug: 'xterm-integration-patterns',
    publishedAt: '2024-01-10',
    tags: ['XTerm.js', 'React', 'TypeScript'],
    category: 'Tutorial',
    author: 'Henry Reed',
  },
];

export default function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const [post, setPost] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Development',
    tags: '',
    publishedAt: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Handle async params
    const loadPost = async () => {
      const { slug } = await params;
      // Simulate loading post data
      const foundPost = posts.find(p => p.slug === slug);
      if (foundPost) {
        setPost(foundPost);
        setFormData({
          title: foundPost.title,
          slug: foundPost.slug,
          excerpt: foundPost.excerpt,
          content: foundPost.content,
          category: foundPost.category,
          tags: foundPost.tags.join(', '),
          publishedAt: foundPost.publishedAt,
        });
      }
      setIsLoading(false);
    };
    
    loadPost();
  }, [params]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-hack-background p-6 flex items-center justify-center">
        <div className="text-terminal-green font-mono">LOADING_POST.EXE...</div>
      </div>
    );
  }

  if (!post) {
    notFound();
  }

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
      console.log('Updating blog post:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to the updated post
      window.location.href = `/blog/${formData.slug}`;
    } catch (error) {
      console.error('Error updating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      // In a real app, this would send delete request to your API
      console.log('Deleting blog post:', post.id);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to blog index
      window.location.href = '/blog';
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <div className="min-h-screen bg-hack-background p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <nav className="mb-4 flex justify-between items-center">
            <a
              href={`/blog/${post.slug}`}
              className="text-terminal-cyan font-mono hover:text-terminal-green transition-colors"
            >
              &lt; BACK_TO_POST
            </a>
            <button
              onClick={handleDelete}
              className="text-terminal-red font-mono hover:text-red-400 transition-colors text-sm"
            >
              DELETE_POST
            </button>
          </nav>
          
          <h1 className="text-4xl font-bold text-terminal-green mb-4 font-mono">
            &gt; EDIT_POST.EXE
          </h1>
          <p className="text-terminal-cyan font-mono">
            Modify existing blog content
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
              placeholder="Write your content here using Markdown syntax..."
            />
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-terminal-green">
            <div className="text-xs font-mono text-terminal-cyan">
              * Required fields
            </div>
            
            <div className="flex space-x-4">
              <a
                href={`/blog/${post.slug}`}
                className="px-6 py-2 border border-terminal-amber text-terminal-amber hover:bg-terminal-amber hover:text-hack-background transition-all font-mono"
              >
                CANCEL
              </a>
              
              <button
                type="submit"
                disabled={isSubmitting || !formData.title || !formData.excerpt || !formData.content}
                className="px-6 py-2 border border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-hack-background transition-all font-mono disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'UPDATING...' : 'UPDATE_POST'}
              </button>
            </div>
          </div>
        </form>

        {/* Changes indicator */}
        <div className="mt-8 text-center text-xs font-mono text-terminal-cyan">
          Last modified: {new Date().toLocaleDateString()} | Changes are saved automatically
        </div>
      </div>
    </div>
  );
}
