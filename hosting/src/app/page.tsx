'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pb-8 pt-6 md:space-y-5">
        <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
          Hi, I'm <span className="text-primary-600 dark:text-primary-400 font-mono">Henry Reed</span>
        </h1>
        <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
          Welcome to my digital space where technology meets security. I'm a cybersecurity professional
          passionate about terminal interfaces, development, and building secure systems.
        </p>
      </div>
      <div className="container py-12">
        <div className="-m-4 flex flex-wrap">
          <div className="p-4 md:w-1/2 xl:w-1/3">
            <div className="h-full rounded-md border-2 border-gray-200 border-opacity-60 dark:border-gray-700">
              <div className="p-6">
                <h2 className="mb-3 text-2xl font-bold leading-8 tracking-tight">
                  <span className="text-primary-600 dark:text-primary-400 font-mono">~/terminal</span>
                </h2>
                <p className="prose mb-3 max-w-none text-gray-500 dark:text-gray-400">
                  Explore various terminal emulators and command-line interfaces built with modern web technologies.
                </p>
                <Link
                  href="/terminal"
                  className="text-base font-medium leading-6 text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                  aria-label="Read more about terminal interfaces"
                >
                  Explore →
                </Link>
              </div>
            </div>
          </div>
          
          <div className="p-4 md:w-1/2 xl:w-1/3">
            <div className="h-full rounded-md border-2 border-gray-200 border-opacity-60 dark:border-gray-700">
              <div className="p-6">
                <h2 className="mb-3 text-2xl font-bold leading-8 tracking-tight">
                  <span className="text-primary-600 dark:text-primary-400 font-mono">~/blog</span>
                </h2>
                <p className="prose mb-3 max-w-none text-gray-500 dark:text-gray-400">
                  Technical insights, tutorials, and thoughts on cybersecurity and modern development practices.
                </p>
                <Link
                  href="/blog"
                  className="text-base font-medium leading-6 text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                  aria-label="Read blog posts"
                >
                  Read →
                </Link>
              </div>
            </div>
          </div>
          
          <div className="p-4 md:w-1/2 xl:w-1/3">
            <div className="h-full rounded-md border-2 border-gray-200 border-opacity-60 dark:border-gray-700">
              <div className="p-6">
                <h2 className="mb-3 text-2xl font-bold leading-8 tracking-tight">
                  <span className="text-primary-600 dark:text-primary-400 font-mono">~/about</span>
                </h2>
                <p className="prose mb-3 max-w-none text-gray-500 dark:text-gray-400">
                  Learn more about my background in cybersecurity, development, and passion for technology.
                </p>
                <Link
                  href="/about"
                  className="text-base font-medium leading-6 text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                  aria-label="Learn more about Henry Reed"
                >
                  About →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
