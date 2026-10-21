/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-[#202226] border border-amber-500/50 px-3.5 py-2 text-xs font-medium text-amber-300 shadow-2xl animate-in slide-in-from-bottom-3 duration-200">
      <div className="w-6 h-6 rounded-lg bg-amber-950/60 flex items-center justify-center shrink-0">
        <WifiOff className="w-3.5 h-3.5 text-amber-400" />
      </div>
      <div>
        <div className="font-bold text-[#E3E2E6] flex items-center gap-1.5">
          <span>وضع العمل بدون إنترنت (Offline Mode)</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        </div>
        <p className="text-[11px] text-[#8E9192]">
          جميع أدوات المونتاج، استبدال الصوت، وتوليد أوامر التصدير تعمل محلياً على جهازك
        </p>
      </div>
    </div>
  );
};
