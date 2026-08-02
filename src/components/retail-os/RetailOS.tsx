"use client";

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Package, 
  TrendingDown, 
  BarChart3, 
  FileText, 
  Sparkles, 
  RefreshCw 
} from 'lucide-react';
import Overview from './Overview';
import Sales from './Sales';
import Expenses from './Expenses';
import Analytics from './Analytics';
import Reports from './Reports';
import AIAssistant from './AIAssistant';
import DataSource from './DataSource';

type SubTab = 
  | 'overview' 
  | 'sales' 
  | 'expenses' 
  | 'analytics' 
  | 'reports' 
  | 'ai-assistant' 
  | 'sync';

export default function RetailOS() {
  const [subTab, setSubTab] = useState<SubTab>('overview');

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    { id: 'sales' as const, label: 'Sales Ledger', icon: TrendingUp },
    { id: 'expenses' as const, label: 'Expenses Outlays', icon: TrendingDown },
    { id: 'analytics' as const, label: 'Analytics Insights', icon: BarChart3 },
    { id: 'reports' as const, label: 'Reports Exporter', icon: FileText },
    { id: 'ai-assistant' as const, label: 'AI Assistant', icon: Sparkles },
    { id: 'sync' as const, label: 'Data Source', icon: RefreshCw },
  ];

  const renderSubContent = () => {
    switch (subTab) {
      case 'overview':
        return <Overview />;
      case 'sales':
        return <Sales />;
      case 'expenses':
        return <Expenses />;
      case 'analytics':
        return <Analytics />;
      case 'reports':
        return <Reports />;
      case 'ai-assistant':
        return <AIAssistant />;
      case 'sync':
        return <DataSource />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="bg-zinc-950/45 text-white min-h-screen">
      {/* Sub Navigation Bar */}
      <div className="border-b border-white/5 bg-zinc-950/80 sticky top-[64px] z-30">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-6 overflow-x-auto whitespace-nowrap scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id)}
                className={`py-4 border-b-2 text-xs font-semibold tracking-wide transition-all flex items-center gap-2 cursor-pointer ${
                  isActive 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subcontent Viewer */}
      <div className="max-w-7xl mx-auto py-8">
        {renderSubContent()}
      </div>
    </div>
  );
}
