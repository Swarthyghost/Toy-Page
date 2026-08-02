"use client";

import React from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Package, 
  AlertOctagon, 
  BarChart, 
  PieChart, 
  LineChart,
  FileCheck
} from 'lucide-react';

export default function AIAssistant() {
  const futureCapabilities = [
    {
      title: "Sales Trend Analysis",
      desc: "Uses predictive analytics models to map macro sales trends and isolate customer lifetime conversion cycles.",
      icon: TrendingUp,
      badge: "Future Model v1"
    },
    {
      title: "Inventory Forecasting",
      desc: "Simulates consumer patterns to anticipate future demand spikes, ensuring seamless warehouse preparation.",
      icon: Package,
      badge: "Future Model v1"
    },
    {
      title: "Reorder Recommendations",
      desc: "Dynamically flags depletion metrics and auto-generates restock recommendations before stockout events occur.",
      icon: AlertOctagon,
      badge: "Future Model v1"
    },
    {
      title: "Slow-Moving Item Detection",
      desc: "Scans low-performance lines and proposes optimized markdown discounts to clean storage space.",
      icon: BarChart,
      badge: "Future Model v1"
    },
    {
      title: "Monthly Comparisons",
      desc: "Auto-compiles periodic performance statements comparing margins, discounts, and delivery costs side by side.",
      icon: PieChart,
      badge: "Future Model v1"
    },
    {
      title: "Profit Margin Insights",
      desc: "Identifies platform overhead leaks (delivery fees/discounts) and recommends target pricing offsets.",
      icon: LineChart,
      badge: "Future Model v1"
    },
    {
      title: "Performance Reports",
      desc: "Compiles complete executive PDF outlines detailing net gains, platform ratios, and operations summaries.",
      icon: FileCheck,
      badge: "Future Model v1"
    }
  ];

  return (
    <div className="px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <Sparkles size={16} />
        </div>
        <div>
          <h2 className="text-xl font-bold font-display text-white">AI Assistant Insights</h2>
          <p className="text-zinc-500 text-xs mt-0.5">Explore the upcoming predictive modules and data projections.</p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {futureCapabilities.map((cap, idx) => {
          const Icon = cap.icon;
          return (
            <div key={idx} className="bg-zinc-900 border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-primary/20 hover:shadow-primary/5 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/5 flex items-center justify-center text-zinc-400">
                    <Icon size={16} />
                  </div>
                  <span className="text-[8px] uppercase font-bold tracking-wider text-primary bg-primary/5 border border-primary/10 px-2.5 py-1 rounded-full">
                    {cap.badge}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-display">{cap.title}</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed mt-2">{cap.desc}</p>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-white/5">
                <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 block">Status: Under Development</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
