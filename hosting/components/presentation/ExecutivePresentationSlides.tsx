'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  TrendingUp,
  Users,
  Zap,
  Target,
  Brain,
  DollarSign,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Rocket
} from 'lucide-react';

// Simple Card component
const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`rounded-lg ${className}`}>
    {children}
  </div>
);

// Slide Data Types
interface SlideProps {
  onNext: () => void;
  onPrev: () => void;
  currentSlide: number;
  totalSlides: number;
}

// Slide 1: Executive Summary
const ExecutiveSummarySlide: React.FC<SlideProps> = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-12 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold mb-4">Cortex DC Platform</h1>
        <p className="text-3xl text-blue-200">AI-Powered Technical Success for Domain Consultants</p>
        <div className="mt-6 inline-block px-6 py-2 bg-green-500 rounded-full text-xl font-semibold">
          ✅ MVP LIVE: henryreedai.web.app
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8 w-full max-w-6xl mt-12">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="h-8 w-8 text-yellow-400" />
            <h3 className="text-xl font-bold">Time Savings</h3>
          </div>
          <p className="text-4xl font-bold text-yellow-400">70%</p>
          <p className="text-sm text-gray-300 mt-2">Pre-call prep time reduction</p>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="h-8 w-8 text-green-400" />
            <h3 className="text-xl font-bold">Win Rate</h3>
          </div>
          <p className="text-4xl font-bold text-green-400">80%+</p>
          <p className="text-sm text-gray-300 mt-2">From 55% baseline</p>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="h-8 w-8 text-emerald-400" />
            <h3 className="text-xl font-bold">ROI</h3>
          </div>
          <p className="text-4xl font-bold text-emerald-400">678%</p>
          <p className="text-sm text-gray-300 mt-2">3-year return</p>
        </Card>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-6 w-full max-w-4xl text-left">
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h4 className="font-semibold mb-2">📊 Deals per DC/Year</h4>
          <div className="flex items-center gap-3">
            <span className="text-gray-400">12-15</span>
            <ChevronRight className="h-4 w-4 text-green-400" />
            <span className="text-green-400 font-bold">20-25</span>
            <span className="text-sm text-green-400">+60%</span>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h4 className="font-semibold mb-2">⏱️ Deal Cycle Length</h4>
          <div className="flex items-center gap-3">
            <span className="text-gray-400">90 days</span>
            <ChevronRight className="h-4 w-4 text-green-400" />
            <span className="text-green-400 font-bold">60-65 days</span>
            <span className="text-sm text-green-400">-30%</span>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h4 className="font-semibold mb-2">📝 Report Generation</h4>
          <div className="flex items-center gap-3">
            <span className="text-gray-400">3-5 hours</span>
            <ChevronRight className="h-4 w-4 text-green-400" />
            <span className="text-green-400 font-bold">5 minutes</span>
            <span className="text-sm text-green-400">-95%</span>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h4 className="font-semibold mb-2">🎯 Knowledge Access</h4>
          <div className="flex items-center gap-3">
            <span className="text-gray-400">Tribal/Siloed</span>
            <ChevronRight className="h-4 w-4 text-green-400" />
            <span className="text-green-400 font-bold">Instant/AI</span>
            <span className="text-sm text-green-400">100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Slide 2: The Problem We Solve
const ProblemSpaceSlide: React.FC<SlideProps> = () => {
  const problems = [
    {
      title: "Time Waste",
      icon: Clock,
      color: "red",
      issues: [
        "Manual research: 2-4 hrs",
        "Report writing: 3-5 hrs",
        "Admin tasks: 10+ hrs/week"
      ],
      cost: "$78K/year"
    },
    {
      title: "Knowledge Gaps",
      icon: AlertCircle,
      color: "orange",
      issues: [
        "No customer context",
        "Generic security knowledge",
        "Missing tech environment",
        "No historical data"
      ],
      cost: "$75K/year"
    },
    {
      title: "Process Issues",
      icon: Target,
      color: "yellow",
      issues: [
        "Inconsistent approach",
        "No standardization",
        "Lost tribal knowledge",
        "Can't scale best practices"
      ],
      cost: "$125K/year"
    },
    {
      title: "Quality Concerns",
      icon: BarChart3,
      color: "purple",
      issues: [
        "Inconsistent reports",
        "Technical jargon",
        "Missing executive summary",
        "No professional templates"
      ],
      cost: "$39K/year"
    }
  ];

  const colorMap: Record<string, { bg: string; border: string; text: string }> = {
    red: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400" },
    orange: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400" },
    yellow: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400" },
    purple: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400" }
  };

  return (
    <div className="h-full flex flex-col p-12 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-3">The Problem We Solve</h1>
        <p className="text-xl text-gray-400">Domain Consultants lose $817K/year in potential value</p>
      </div>

      <div className="grid grid-cols-2 gap-6 flex-1">
        {problems.map((problem, idx) => {
          const colors = colorMap[problem.color];
          const Icon = problem.icon;
          return (
            <Card key={idx} className={`${colors.bg} border ${colors.border} p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <Icon className={`h-8 w-8 ${colors.text}`} />
                <h3 className="text-2xl font-bold">{problem.title}</h3>
              </div>

              <ul className="space-y-2 mb-4">
                {problem.issues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300">
                    <span className={`${colors.text} mt-1`}>•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>

              <div className={`mt-auto pt-4 border-t ${colors.border}`}>
                <span className="text-sm text-gray-400">Annual Cost per DC:</span>
                <p className={`text-3xl font-bold ${colors.text}`}>{problem.cost}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 text-center bg-red-500/10 border border-red-500/30 rounded-lg p-6">
        <p className="text-2xl font-bold text-red-400">
          Total Impact: $817,000 per Domain Consultant annually
        </p>
        <p className="text-gray-400 mt-2">Due to inefficient processes and knowledge gaps</p>
      </div>
    </div>
  );
};

// Slide 3: TRR Workflow Comparison
const WorkflowComparisonSlide: React.FC<SlideProps> = () => {
  return (
    <div className="h-full flex flex-col p-12 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <h1 className="text-5xl font-bold text-center mb-8">TRR Workflow Transformation</h1>

      <div className="grid grid-cols-2 gap-8 flex-1">
        {/* Traditional Way */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-500 rounded-full p-2">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold">Traditional Way</h2>
          </div>

          <div className="space-y-4">
            {[
              { step: 1, text: "DC spends 2-4 hours researching customer manually", time: "2-4 hrs" },
              { step: 2, text: "Creates TRR document in Word/Google Docs", time: "30 min" },
              { step: 3, text: "Emails manager for approval", time: "5 min" },
              { step: 4, text: "Manager reviews when they have time (days later)", time: "2-3 days" },
              { step: 5, text: "Back-and-forth via email for changes", time: "1-2 days" },
              { step: 6, text: "Manual report creation takes 3-5 hours", time: "3-5 hrs" },
              { step: 7, text: "Email report to customer, hope they open it", time: "10 min" }
            ].map(({ step, text, time }) => (
              <div key={step} className="flex items-start gap-3 p-3 bg-black/20 rounded">
                <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {step}
                </span>
                <div className="flex-1">
                  <p className="text-gray-300">{text}</p>
                  <p className="text-red-400 text-sm mt-1">{time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-red-500/30">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Time:</span>
              <span className="text-3xl font-bold text-red-400">6-12 hours</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-400">Win Rate:</span>
              <span className="text-3xl font-bold text-red-400">55%</span>
            </div>
          </div>
        </div>

        {/* The Cortex Way */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-500 rounded-full p-2">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold">The Cortex Way</h2>
          </div>

          <div className="space-y-4">
            {[
              { step: 1, text: "DC creates TRR in platform (5 minutes)", time: "5 min" },
              { step: 2, text: "AI generates customer brief automatically (background)", time: "2-3 min" },
              { step: 3, text: "AI provides threat intelligence for industry", time: "30 sec" },
              { step: 4, text: "DC adds findings with AI-assisted CVSS scoring", time: "10 min" },
              { step: 5, text: "Submit for approval → Manager notified instantly", time: "1 min" },
              { step: 6, text: "Manager approves with one click", time: "<1 min" },
              { step: 7, text: "AI generates professional report", time: "5 min" },
              { step: 8, text: "Secure share link sent to customer with tracking", time: "1 min" }
            ].map(({ step, text, time }) => (
              <div key={step} className="flex items-start gap-3 p-3 bg-black/20 rounded">
                <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {step}
                </span>
                <div className="flex-1">
                  <p className="text-gray-300">{text}</p>
                  <p className="text-green-400 text-sm mt-1">{time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-green-500/30">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Time:</span>
              <span className="text-3xl font-bold text-green-400">20-30 min</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-400">Win Rate:</span>
              <span className="text-3xl font-bold text-green-400">80%+</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-2xl font-bold text-blue-400">
          Result: 95% time savings + 25 point win rate improvement
        </p>
      </div>
    </div>
  );
};

// Import additional slides
import {
  AIIntelligenceSlide,
  ROICalculatorSlide,
  StatusRoadmapSlide,
  CallToActionSlide
} from './AdditionalSlides';

// Main Presentation Component
export const ExecutivePresentationSlides: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    ExecutiveSummarySlide,
    ProblemSpaceSlide,
    WorkflowComparisonSlide,
    AIIntelligenceSlide,
    ROICalculatorSlide,
    StatusRoadmapSlide,
    CallToActionSlide
  ];

  const totalSlides = slides.length;
  const CurrentSlideComponent = slides[currentSlide];

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft') handlePrev();
  };

  return (
    <div
      className="fixed inset-0 bg-black focus:outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Slide Content */}
      <div className="h-full w-full">
        <CurrentSlideComponent
          onNext={handleNext}
          onPrev={handlePrev}
          currentSlide={currentSlide}
          totalSlides={totalSlides}
        />
      </div>

      {/* Navigation Controls */}
      <div className="fixed bottom-8 left-0 right-0 flex items-center justify-center gap-4">
        <button
          onClick={handlePrev}
          disabled={currentSlide === 0}
          className="p-3 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-full backdrop-blur-sm transition-all"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>

        <div className="px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white font-semibold">
          {currentSlide + 1} / {totalSlides}
        </div>

        <button
          onClick={handleNext}
          disabled={currentSlide === totalSlides - 1}
          className="p-3 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-full backdrop-blur-sm transition-all"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="fixed bottom-24 left-0 right-0 flex items-center justify-center gap-2">
        {Array.from({ length: totalSlides }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === currentSlide
                ? 'w-8 bg-blue-500'
                : 'w-2 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Keyboard Hint */}
      <div className="fixed top-4 right-4 text-white/50 text-sm">
        Use ← → arrow keys or click buttons to navigate
      </div>
    </div>
  );
};

export default ExecutivePresentationSlides;
