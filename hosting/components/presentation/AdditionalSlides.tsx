'use client';

import React from 'react';
import {
  Brain,
  Zap,
  Database,
  Shield,
  BarChart3,
  TrendingUp,
  DollarSign,
  Clock,
  Users,
  CheckCircle,
  Rocket
} from 'lucide-react';

// Simple Card component
const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`rounded-lg ${className}`}>
    {children}
  </div>
);

interface SlideProps {
  onNext: () => void;
  onPrev: () => void;
  currentSlide: number;
  totalSlides: number;
}

// Slide 4: AI Intelligence Capabilities
export const AIIntelligenceSlide: React.FC<SlideProps> = () => {
  const aiProcessors = [
    {
      title: "Customer Intelligence",
      icon: Users,
      color: "blue",
      features: [
        "Company research in 2-3 min",
        "Stakeholder analysis",
        "Breach history lookup",
        "Compliance identification"
      ],
      status: "🟡 40% Complete"
    },
    {
      title: "Threat Intelligence",
      icon: Shield,
      color: "red",
      features: [
        "Industry-specific threats",
        "MITRE ATT&CK mapping",
        "Real attack examples",
        "Risk quantification"
      ],
      status: "🔴 25% Complete"
    },
    {
      title: "Environment Analysis",
      icon: Database,
      color: "green",
      features: [
        "Tech stack discovery",
        "Integration mapping",
        "Scope estimation",
        "Gap identification"
      ],
      status: "🔴 15% Complete"
    },
    {
      title: "Historical Patterns",
      icon: BarChart3,
      color: "purple",
      features: [
        "Similar engagements",
        "Win/loss analysis",
        "Success benchmarks",
        "Best practices"
      ],
      status: "🔴 10% Complete"
    },
    {
      title: "Success Criteria",
      icon: TrendingUp,
      color: "yellow",
      features: [
        "C-level language",
        "ROI calculation",
        "KPI definition",
        "Test scenarios"
      ],
      status: "🔴 0% Complete"
    },
    {
      title: "Content Generation",
      icon: Brain,
      color: "indigo",
      features: [
        "Executive summary",
        "Technical report",
        "Professional format",
        "One-click PDF"
      ],
      status: "🟡 45% Complete"
    }
  ];

  const colorMap: Record<string, { bg: string; border: string; icon: string }> = {
    blue: { bg: "bg-blue-500/10", border: "border-blue-500/30", icon: "text-blue-400" },
    red: { bg: "bg-red-500/10", border: "border-red-500/30", icon: "text-red-400" },
    green: { bg: "bg-green-500/10", border: "border-green-500/30", icon: "text-green-400" },
    purple: { bg: "bg-purple-500/10", border: "border-purple-500/30", icon: "text-purple-400" },
    yellow: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", icon: "text-yellow-400" },
    indigo: { bg: "bg-indigo-500/10", border: "border-indigo-500/30", icon: "text-indigo-400" }
  };

  return (
    <div className="h-full flex flex-col p-12 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-3">The 6 AI Processors</h1>
        <p className="text-xl text-purple-200">Powered by Vertex AI & Gemini Pro</p>
      </div>

      <div className="grid grid-cols-3 gap-6 flex-1">
        {aiProcessors.map((processor, idx) => {
          const colors = colorMap[processor.color];
          const Icon = processor.icon;
          return (
            <Card key={idx} className={`${colors.bg} border ${colors.border} p-5`}>
              <div className="flex items-center gap-3 mb-4">
                <Icon className={`h-7 w-7 ${colors.icon}`} />
                <h3 className="text-xl font-bold">{processor.title}</h3>
              </div>

              <ul className="space-y-2 mb-4 flex-1">
                {processor.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <CheckCircle className={`h-4 w-4 ${colors.icon} mt-0.5 flex-shrink-0`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-3 border-t border-white/10">
                <span className="text-xs text-gray-400">{processor.status}</span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-purple-400" />
          <div>
            <p className="font-semibold">Processing Time: 2-3 minutes</p>
            <p className="text-sm text-gray-400">Background processing - DCs never wait</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Zap className="h-8 w-8 text-yellow-400" />
          <div>
            <p className="font-semibold">AI Confidence: 87% avg</p>
            <p className="text-sm text-gray-400">Based on data quality & coverage</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Slide 5: ROI Calculator Interactive
export const ROICalculatorSlide: React.FC<SlideProps> = () => {
  return (
    <div className="h-full flex flex-col p-12 bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 text-white">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-3">Business Impact & ROI</h1>
        <p className="text-xl text-green-200">Investment vs Return Analysis</p>
      </div>

      <div className="grid grid-cols-2 gap-8 flex-1">
        {/* Investment */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-red-400" />
            Investment
          </h2>

          <div className="space-y-4">
            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Platform Development</span>
                <span className="text-2xl font-bold text-red-400">$500K</span>
              </div>
              <p className="text-sm text-gray-400">One-time investment</p>
            </div>

            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Annual Operations</span>
                <span className="text-2xl font-bold text-red-400">$200K</span>
              </div>
              <p className="text-sm text-gray-400">Per year</p>
            </div>

            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Team Training</span>
                <span className="text-2xl font-bold text-red-400">$50K</span>
              </div>
              <p className="text-sm text-gray-400">One-time investment</p>
            </div>

            <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-4 mt-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Year 1 Total</span>
                <span className="text-3xl font-bold text-red-400">$750K</span>
              </div>
            </div>
          </div>
        </div>

        {/* Returns */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-green-400" />
            Year 1 Benefits
          </h2>

          <div className="space-y-4">
            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Time Savings</span>
                <span className="text-2xl font-bold text-green-400">$780K</span>
              </div>
              <p className="text-sm text-gray-400">520 hrs/DC × 10 DCs × $150/hr</p>
            </div>

            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Additional Deals Won</span>
                <span className="text-2xl font-bold text-green-400">$6.0M</span>
              </div>
              <p className="text-sm text-gray-400">5 extra deals/DC × 30% margin</p>
            </div>

            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Faster Deal Cycles</span>
                <span className="text-2xl font-bold text-green-400">$1.5M</span>
              </div>
              <p className="text-sm text-gray-400">30 days saved × opportunity cost</p>
            </div>

            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Knowledge Retention</span>
                <span className="text-2xl font-bold text-green-400">$500K</span>
              </div>
              <p className="text-sm text-gray-400">Avoided rehiring/retraining</p>
            </div>

            <div className="bg-green-500/20 border border-green-500/40 rounded-lg p-4 mt-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Benefits</span>
                <span className="text-3xl font-bold text-green-400">$9.2M</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <Card className="bg-blue-500/10 border-blue-500/30 p-4 text-center">
          <p className="text-sm text-gray-400 mb-1">Net Benefit Year 1</p>
          <p className="text-3xl font-bold text-blue-400">$8.4M</p>
        </Card>

        <Card className="bg-yellow-500/10 border-yellow-500/30 p-4 text-center">
          <p className="text-sm text-gray-400 mb-1">ROI Year 1</p>
          <p className="text-3xl font-bold text-yellow-400">1,123%</p>
        </Card>

        <Card className="bg-purple-500/10 border-purple-500/30 p-4 text-center">
          <p className="text-sm text-gray-400 mb-1">Payback Period</p>
          <p className="text-3xl font-bold text-purple-400">4.6 months</p>
        </Card>
      </div>
    </div>
  );
};

// Slide 6: Current Status & Roadmap
export const StatusRoadmapSlide: React.FC<SlideProps> = () => {
  const features = [
    { name: "Authentication & RBAC", status: "complete", completion: 100 },
    { name: "TRR Core Workflows", status: "complete", completion: 95 },
    { name: "Real-time Collaboration", status: "complete", completion: 85 },
    { name: "POV Management", status: "progress", completion: 60 },
    { name: "AI Intelligence", status: "progress", completion: 40 },
    { name: "Reporting", status: "progress", completion: 50 },
    { name: "Analytics & Insights", status: "planned", completion: 10 },
    { name: "Integrations", status: "planned", completion: 5 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete": return { bg: "bg-green-500", text: "text-green-400" };
      case "progress": return { bg: "bg-yellow-500", text: "text-yellow-400" };
      case "planned": return { bg: "bg-red-500", text: "text-red-400" };
      default: return { bg: "bg-gray-500", text: "text-gray-400" };
    }
  };

  return (
    <div className="h-full flex flex-col p-12 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 text-white">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-3">Current Status & Roadmap</h1>
        <p className="text-xl text-gray-400">MVP Live → Enterprise Ready in 6 Months</p>
      </div>

      <div className="grid grid-cols-2 gap-8 flex-1">
        {/* Current Status */}
        <div>
          <h2 className="text-3xl font-bold mb-6">Feature Status</h2>
          <div className="space-y-4">
            {features.map((feature, idx) => {
              const colors = getStatusColor(feature.status);
              return (
                <div key={idx} className="bg-white/5 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{feature.name}</span>
                    <span className={`text-sm ${colors.text}`}>{feature.completion}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`${colors.bg} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${feature.completion}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-gray-400">Complete (95-100%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <span className="text-gray-400">In Progress (25-75%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-gray-400">Planned (0-25%)</span>
            </div>
          </div>
        </div>

        {/* Roadmap */}
        <div>
          <h2 className="text-3xl font-bold mb-6">Next 6 Months</h2>
          <div className="space-y-4">
            {[
              {
                phase: "Q1 2025",
                title: "AI Intelligence Foundation",
                items: [
                  "Customer Intelligence Generator",
                  "Threat Intelligence Feed",
                  "Risk Analysis Engine",
                  "POV AI Generation"
                ],
                status: "🟡 In Progress"
              },
              {
                phase: "Q2 2025",
                title: "Advanced Features",
                items: [
                  "Historical Pattern Matching",
                  "Playbook Generator",
                  "Success Criteria AI",
                  "Environment Analyzer"
                ],
                status: "🔴 Planned"
              },
              {
                phase: "Q3 2025",
                title: "Integrations & Scale",
                items: [
                  "Salesforce Connector",
                  "Slack/Teams Integration",
                  "Advanced Analytics",
                  "Mobile Native App"
                ],
                status: "🔴 Planned"
              }
            ].map((phase, idx) => (
              <div key={idx} className="bg-white/5 rounded-lg p-5 border border-white/10">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-sm text-gray-400">{phase.phase}</span>
                    <h3 className="text-xl font-bold">{phase.title}</h3>
                  </div>
                  <span className="text-sm">{phase.status}</span>
                </div>
                <ul className="space-y-1">
                  {phase.items.map((item, i) => (
                    <li key={i} className="text-sm text-gray-400 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Rocket className="h-8 w-8 text-blue-400" />
          <div>
            <p className="font-semibold">Production Launch Target</p>
            <p className="text-sm text-gray-400">Enterprise Ready by July 2025</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Critical Path</p>
          <p className="text-2xl font-bold text-blue-400">180 days</p>
        </div>
      </div>
    </div>
  );
};

// Slide 7: Call to Action
export const CallToActionSlide: React.FC<SlideProps> = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-12 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold mb-4">Ready to Transform Your DC Team?</h1>
        <p className="text-2xl text-purple-200">Join the AI-powered future of technical success</p>
      </div>

      <div className="grid grid-cols-2 gap-8 w-full max-w-5xl mb-12">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-8">
          <h2 className="text-3xl font-bold mb-4">What You Get</h2>
          <ul className="space-y-3">
            {[
              "70% time savings on prep work",
              "80%+ win rate (from 55%)",
              "30% faster deal cycles",
              "95% report generation time savings",
              "Instant AI-powered intelligence",
              "Institutional knowledge capture"
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
                <span className="text-lg">{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-8">
          <h2 className="text-3xl font-bold mb-4">The Numbers</h2>
          <div className="space-y-4">
            <div className="bg-black/20 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Investment</p>
              <p className="text-3xl font-bold">$750K</p>
              <p className="text-sm text-gray-400 mt-1">Year 1 total cost</p>
            </div>
            <div className="bg-green-500/20 border border-green-500/40 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Return</p>
              <p className="text-4xl font-bold text-green-400">$9.2M</p>
              <p className="text-sm text-gray-400 mt-1">Year 1 total benefits</p>
            </div>
            <div className="bg-blue-500/20 border border-blue-500/40 rounded-lg p-4">
              <p className="text-gray-400 text-sm">ROI</p>
              <p className="text-4xl font-bold text-blue-400">1,123%</p>
              <p className="text-sm text-gray-400 mt-1">4.6 month payback</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="text-center space-y-6">
        <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-4 rounded-full">
          <p className="text-2xl font-bold">Live Demo Available Now</p>
        </div>
        <p className="text-xl text-blue-200">
          Visit <span className="font-mono bg-white/10 px-3 py-1 rounded">henryreedai.web.app</span> to try it yourself
        </p>

        <div className="flex items-center justify-center gap-8 mt-8 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span>Schedule Demo</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span>Request Pilot</span>
          </div>
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            <span>Start Trial</span>
          </div>
        </div>
      </div>
    </div>
  );
};
