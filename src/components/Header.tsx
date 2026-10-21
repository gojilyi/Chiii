/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Code2, Film, FolderKanban, Download } from 'lucide-react';
import { PWAInstallButton } from './pwa/PWAInstallButton';

interface HeaderProps {
  activeTab: 'editor' | 'home' | 'flutter_code' | 'drafts' | 'auto_lessons';
  setActiveTab: (tab: 'editor' | 'home' | 'flutter_code' | 'drafts' | 'auto_lessons') => void;
  onNewProject: () => void;
  onExportClick?: () => void;
  hasActiveProject?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onNewProject,
  onExportClick,
  hasActiveProject,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#121316]/95 backdrop-blur-md border-b border-[#2B2C30] px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        
        {/* Zone 1: Single text element wordmark with brand identity */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#006C4C] to-[#004A33] flex items-center justify-center text-white shadow-sm border border-[#00875F]/30">
            <span className="font-amiri text-lg font-bold">ع</span>
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-[#E3E2E6] whitespace-nowrap block">
              الشيخ العيد
            </span>
            <span className="text-[11px] text-[#8E9192] -mt-1 block">
              استوديو المونتاج الهادف
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#C4C7C8]">
          <button
            onClick={() => setActiveTab('home')}
            className={`whitespace-nowrap transition-colors flex items-center gap-2 py-1 ${
              activeTab === 'home'
                ? 'text-[#89F8C7] border-b-2 border-[#89F8C7]'
                : 'hover:text-[#E3E2E6]'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>الرئيسية والمقاسات</span>
          </button>

          {hasActiveProject && (
            <button
              onClick={() => setActiveTab('editor')}
              className={`whitespace-nowrap transition-colors flex items-center gap-2 py-1 ${
                activeTab === 'editor'
                  ? 'text-[#89F8C7] border-b-2 border-[#89F8C7]'
                  : 'hover:text-[#E3E2E6]'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>محرر الفيديو النشط</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('auto_lessons')}
            className={`whitespace-nowrap transition-colors flex items-center gap-2 py-1 ${
              activeTab === 'auto_lessons'
                ? 'text-[#89F8C7] border-b-2 border-[#89F8C7]'
                : 'hover:text-[#E3E2E6]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#FFDF9E]" />
            <span>قائمة إيصال السالك والدروس</span>
          </button>

          <button
            onClick={() => setActiveTab('flutter_code')}
            className={`whitespace-nowrap transition-colors flex items-center gap-2 py-1 ${
              activeTab === 'flutter_code'
                ? 'text-[#89F8C7] border-b-2 border-[#89F8C7]'
                : 'hover:text-[#E3E2E6]'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>كود وهيكلية Flutter</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action & Offline PWA Install */}
        <div className="flex items-center gap-2.5 shrink-0">
          <PWAInstallButton />

          {activeTab === 'editor' && onExportClick ? (
            <button
              onClick={onExportClick}
              className="px-4 py-2 text-xs font-semibold text-[#002114] bg-[#89F8C7] hover:bg-[#72dbb0] rounded-xl transition-all shadow-sm flex items-center gap-2 whitespace-nowrap active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير وأمر FFmpeg</span>
            </button>
          ) : (
            <button
              onClick={onNewProject}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#006C4C] hover:bg-[#00573c] rounded-xl transition-all shadow-sm flex items-center gap-2 whitespace-nowrap active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#89F8C7]" />
              <span>مشروع جديد</span>
            </button>
          )}
        </div>

      </div>

      {/* Mobile Horizontal Navigation Tabs (md:hidden) */}
      <div className="md:hidden flex items-center gap-2 pt-2 pb-0.5 overflow-x-auto no-scrollbar text-xs border-t border-[#2B2C30]/50 mt-2">
        <button
          onClick={() => setActiveTab('home')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors shrink-0 ${
            activeTab === 'home'
              ? 'bg-[#006C4C] text-white font-bold'
              : 'text-[#8E9192] hover:text-[#E3E2E6]'
          }`}
        >
          <FolderKanban className="w-3.5 h-3.5" />
          <span>الرئيسية</span>
        </button>

        {hasActiveProject && (
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'editor'
                ? 'bg-[#006C4C] text-white font-bold'
                : 'text-[#8E9192] hover:text-[#E3E2E6]'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>المحرر النشط</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('auto_lessons')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors shrink-0 ${
            activeTab === 'auto_lessons'
              ? 'bg-[#006C4C] text-white font-bold'
              : 'text-[#8E9192] hover:text-[#E3E2E6]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FFDF9E]" />
          <span>الدروس التلقائية</span>
        </button>

        <button
          onClick={() => setActiveTab('flutter_code')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors shrink-0 ${
            activeTab === 'flutter_code'
              ? 'bg-[#006C4C] text-white font-bold'
              : 'text-[#8E9192] hover:text-[#E3E2E6]'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>كود Flutter</span>
        </button>
      </div>
    </header>
  );
};
