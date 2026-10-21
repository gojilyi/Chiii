/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DownloadCloud, Smartphone, X, Check } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone PWA, hide button
  if (isInstalled) {
    return (
      <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#006C4C]/20 border border-[#006C4C]/40 text-[11px] font-medium text-[#89F8C7]">
        <Check className="w-3.5 h-3.5 text-[#89F8C7]" />
        <span>مثبّت ويعمل بدون نت</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#006C4C] to-[#00875F] hover:from-[#00573c] hover:to-[#006C4C] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition active:scale-95 border border-[#89F8C7]/30"
        title="تثبيت التطبيق على جهازك للعمل بدون اتصال بالإنترنت"
      >
        <DownloadCloud className="w-3.5 h-3.5 text-[#89F8C7]" />
        <span className="hidden sm:inline">تثبيت للعمل دون إنترنت</span>
        <span className="sm:hidden">تثبيت PWA</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl border border-[#006C4C]/60 bg-[#1A1C1E] px-3 py-1.5 text-xs font-semibold text-[#89F8C7] hover:bg-[#202226] transition active:scale-95"
          title="تثبيت التطبيق على الآيفون والآيباد"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>تثبيت في الآيفون</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-sm rounded-2xl border border-[#2B2C30] bg-[#1A1C1E] p-6 shadow-2xl text-right">
              <div className="flex items-center justify-between pb-3 border-b border-[#2B2C30]">
                <h3 className="text-base font-bold text-[#E3E2E6] flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#89F8C7]" />
                  <span>تثبيت في آيفون / آيباد</span>
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-7 h-7 rounded-lg bg-[#292A2E] text-[#8E9192] hover:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-[#C4C7C8] leading-relaxed">
                <div className="p-2.5 rounded-xl bg-[#202226] border border-[#2B2C30] flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#006C4C] text-white flex items-center justify-center shrink-0 font-mono text-[11px]">1</span>
                  <span>اضغط على زر <strong>المشاركة (Share)</strong> في شريط متصفح Safari بالأسفل.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#202226] border border-[#2B2C30] flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#006C4C] text-white flex items-center justify-center shrink-0 font-mono text-[11px]">2</span>
                  <span>مرر للأسفل واختر <strong>«إضافة إلى الصفحة الرئيسية» (Add to Home Screen)</strong>.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#202226] border border-[#2B2C30] flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#006C4C] text-white flex items-center justify-center shrink-0 font-mono text-[11px]">3</span>
                  <span>سيعمل التطبيق كبرنامج كامل ومستقل حتى دون اتصال بالإنترنت!</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-[#006C4C] py-2 text-xs font-bold text-white hover:bg-[#00573c] transition"
              >
                فهمت ذلك
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback button if prompt is not ready yet: always display a helpful indicator button
  return (
    <button
      onClick={() => {
        alert('لتثبيت التطبيق للعمل دون إنترنت:\n\n• على أجهزة الكمبيوتر وChrome: اضغط على أيقونة التثبيت في شريط العنوان أعلى المتصفح.\n• على هواتف Android: اضغط على القائمة (ثلاث نقاط) ثم «تثبيت التطبيق».\n• على هواتف iPhone: اضغط زر المشاركة ثم «إضافة للشاشة الرئيسية».');
      }}
      className="flex items-center gap-1.5 rounded-xl bg-[#1E2024] hover:bg-[#25272B] border border-[#2B2C30] px-3 py-1.5 text-xs font-semibold text-[#89F8C7] transition active:scale-95 shadow-sm"
      title="معلومات التثبيت والعمل بدون نت"
    >
      <DownloadCloud className="w-3.5 h-3.5 text-[#89F8C7]" />
      <span className="hidden sm:inline">العمل دون إنترنت</span>
    </button>
  );
};
