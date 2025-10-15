'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '../lib/utils';

/**
 * DemoSlideshow Component
 *
 * Full-screen slideshow for demo presentations with markdown support
 * Features:
 * - Keyboard navigation (arrow keys, space, escape)
 * - Progress indicator
 * - Slide counter
 * - Auto-advance option
 * - Fullscreen mode
 */

interface Slide {
  title: string;
  content: string;
  type?: 'title' | 'content' | 'bullets' | 'code' | 'chart' | 'image';
  bgColor?: string;
  textColor?: string;
}

interface DemoSlideshowProps {
  slides: Slide[];
  autoAdvance?: boolean;
  autoAdvanceDelay?: number;
  onClose?: () => void;
  title?: string;
}

export const DemoSlideshow: React.FC<DemoSlideshowProps> = ({
  slides,
  autoAdvance = false,
  autoAdvanceDelay = 5000,
  onClose,
  title = 'Demo Presentation'
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const totalSlides = slides.length;

  // Navigation handlers
  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < totalSlides) {
      setCurrentSlide(index);
    }
  }, [totalSlides]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevSlide();
          break;
        case 'Escape':
          e.preventDefault();
          onClose?.();
          break;
        case 'Home':
          e.preventDefault();
          goToSlide(0);
          break;
        case 'End':
          e.preventDefault();
          goToSlide(totalSlides - 1);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          setIsPaused(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, goToSlide, totalSlides, onClose]);

  // Auto-advance
  useEffect(() => {
    if (!autoAdvance || isPaused) return;

    const timer = setInterval(nextSlide, autoAdvanceDelay);
    return () => clearInterval(timer);
  }, [autoAdvance, autoAdvanceDelay, nextSlide, isPaused]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Fullscreen request failed:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Progress percentage
  const progress = useMemo(() => {
    return ((currentSlide + 1) / totalSlides) * 100;
  }, [currentSlide, totalSlides]);

  // Current slide data
  const slide = slides[currentSlide];

  // Render slide content based on type
  const renderSlideContent = () => {
    const type = slide.type || 'content';

    switch (type) {
      case 'title':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
            <div className="text-7xl font-bold text-cortex-text-primary animate-fade-in">
              {slide.title}
            </div>
            {slide.content && (
              <div className="text-2xl text-cortex-text-secondary max-w-3xl animate-fade-in-delay">
                {slide.content}
              </div>
            )}
          </div>
        );

      case 'bullets':
        return (
          <div className="flex flex-col h-full p-12">
            <h2 className="text-5xl font-bold text-cortex-text-primary mb-12 animate-fade-in">
              {slide.title}
            </h2>
            <div className="space-y-6 text-2xl text-cortex-text-secondary">
              {slide.content.split('\n').filter(line => line.trim()).map((line, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-4 animate-slide-in-left"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <span className="text-cortex-accent text-3xl">•</span>
                  <span className="flex-1">{line.replace(/^[•\-*]\s*/, '')}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'code':
        return (
          <div className="flex flex-col h-full p-12">
            <h2 className="text-5xl font-bold text-cortex-text-primary mb-8 animate-fade-in">
              {slide.title}
            </h2>
            <pre className="flex-1 bg-black/40 border border-cortex-border/40 rounded-lg p-8 overflow-auto text-lg font-mono text-cortex-text-primary animate-fade-in-delay">
              {slide.content}
            </pre>
          </div>
        );

      case 'chart':
        return (
          <div className="flex flex-col h-full p-12">
            <h2 className="text-5xl font-bold text-cortex-text-primary mb-8 text-center animate-fade-in">
              {slide.title}
            </h2>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-6xl text-cortex-accent animate-pulse">
                📊
              </div>
              <div className="ml-8 text-2xl text-cortex-text-secondary max-w-2xl">
                {slide.content}
              </div>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="flex flex-col h-full p-12">
            <h2 className="text-4xl font-bold text-cortex-text-primary mb-8 text-center animate-fade-in">
              {slide.title}
            </h2>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-9xl animate-bounce-slow">
                {slide.content.match(/[^\s]/)?.[0] || '🖼️'}
              </div>
            </div>
          </div>
        );

      default: // 'content'
        return (
          <div className="flex flex-col h-full p-12">
            <h2 className="text-5xl font-bold text-cortex-text-primary mb-8 animate-fade-in">
              {slide.title}
            </h2>
            <div className="flex-1 flex items-center">
              <div className="text-2xl text-cortex-text-secondary leading-relaxed max-w-4xl animate-fade-in-delay">
                {slide.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-6">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-cortex-bg-primary">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-cortex-bg-tertiary/80 backdrop-blur-sm border-b border-cortex-border/30 px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-4">
          <span className="text-cortex-accent text-2xl">🎬</span>
          <h1 className="text-xl font-bold text-cortex-text-primary">{title}</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Slide counter */}
          <div className="text-sm text-cortex-text-muted font-mono">
            {currentSlide + 1} / {totalSlides}
          </div>

          {/* Auto-advance indicator */}
          {autoAdvance && (
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                isPaused
                  ? 'bg-cortex-warning/20 text-cortex-warning border border-cortex-warning/40'
                  : 'bg-cortex-success/20 text-cortex-success border border-cortex-success/40'
              )}
              title={isPaused ? 'Resume auto-advance' : 'Pause auto-advance'}
            >
              {isPaused ? '⏸️ Paused' : '▶️ Auto'}
            </button>
          )}

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="px-3 py-1 rounded-lg text-xs font-medium bg-cortex-primary/20 text-cortex-primary border border-cortex-primary/40 hover:bg-cortex-primary/30 transition-colors"
            title="Toggle fullscreen (F)"
          >
            {isFullscreen ? '⛶ Exit Full' : '⛶ Fullscreen'}
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg text-xs font-medium bg-cortex-error/20 text-cortex-error border border-cortex-error/40 hover:bg-cortex-error/30 transition-colors"
            title="Close slideshow (Esc)"
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Slide content */}
      <div
        className={cn(
          'absolute inset-0 pt-20 pb-16',
          slide.bgColor || 'bg-gradient-to-br from-cortex-bg-primary to-cortex-bg-secondary'
        )}
        style={{
          color: slide.textColor || undefined
        }}
      >
        {renderSlideContent()}
      </div>

      {/* Navigation controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-cortex-bg-tertiary/80 backdrop-blur-sm border-t border-cortex-border/30 px-6 py-4">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-1 bg-cortex-border/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-cortex-accent transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => goToSlide(0)}
              disabled={currentSlide === 0}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                currentSlide === 0
                  ? 'bg-cortex-bg-secondary/30 text-cortex-text-muted cursor-not-allowed'
                  : 'bg-cortex-bg-secondary text-cortex-text-primary hover:bg-cortex-bg-hover'
              )}
              title="First slide (Home)"
            >
              ⏮️ First
            </button>

            <button
              onClick={prevSlide}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-cortex-bg-secondary text-cortex-text-primary hover:bg-cortex-bg-hover transition-colors"
              title="Previous slide (←)"
            >
              ← Previous
            </button>
          </div>

          {/* Slide thumbnails / dots */}
          <div className="flex items-center space-x-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={cn(
                  'w-3 h-3 rounded-full transition-all duration-200',
                  idx === currentSlide
                    ? 'bg-cortex-accent scale-125'
                    : 'bg-cortex-border/40 hover:bg-cortex-border/60'
                )}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={nextSlide}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-cortex-primary text-black hover:bg-cortex-primary-light transition-colors"
              title="Next slide (→ or Space)"
            >
              Next →
            </button>

            <button
              onClick={() => goToSlide(totalSlides - 1)}
              disabled={currentSlide === totalSlides - 1}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                currentSlide === totalSlides - 1
                  ? 'bg-cortex-bg-secondary/30 text-cortex-text-muted cursor-not-allowed'
                  : 'bg-cortex-bg-secondary text-cortex-text-primary hover:bg-cortex-bg-hover'
              )}
              title="Last slide (End)"
            >
              Last ⏭️
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="absolute top-20 right-6 bg-cortex-bg-tertiary/60 backdrop-blur-sm border border-cortex-border/30 rounded-lg px-4 py-3 text-xs text-cortex-text-muted space-y-1">
        <div className="font-bold text-cortex-text-primary mb-2">⌨️ Shortcuts</div>
        <div><kbd className="px-1 bg-cortex-bg-secondary rounded">→</kbd> Next</div>
        <div><kbd className="px-1 bg-cortex-bg-secondary rounded">←</kbd> Previous</div>
        <div><kbd className="px-1 bg-cortex-bg-secondary rounded">F</kbd> Fullscreen</div>
        <div><kbd className="px-1 bg-cortex-bg-secondary rounded">P</kbd> Pause</div>
        <div><kbd className="px-1 bg-cortex-bg-secondary rounded">Esc</kbd> Close</div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-fade-in-delay {
          animation: fade-in 0.6s ease-out 0.3s both;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.5s ease-out both;
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        kbd {
          font-family: monospace;
          font-size: 0.85em;
        }
      `}</style>
    </div>
  );
};

export default DemoSlideshow;
