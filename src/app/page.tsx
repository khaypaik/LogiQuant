'use client';

import { useState } from 'react';
import Image from 'next/image';
import QuoteForm from '@/components/QuoteForm';
import QuoteResult from '@/components/QuoteResult';
import DarkModeToggle from '@/components/DarkModeToggle';
import AdSense from '@/components/AdSense';
import { QuoteInput, QuoteResult as QuoteResultType } from '@/types';
import { calculateQuote } from '@/lib/calculator';

export default function Home() {
  const [result, setResult] = useState<QuoteResultType | null>(null);

  const handleSubmit = (input: QuoteInput) => {
    // 계산을 동기적으로 처리하여 깜빡임 방지
    const calculatedResult = calculateQuote(input);
    setResult(calculatedResult);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 transition-colors duration-200">
      <DarkModeToggle />
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4 px-4">
            <Image
              src="/LogiQuant-monogram.png"
              alt="LogiQuant - 화물 요금 계산기"
              width={300}
              height={300}
              priority
              className="w-full max-w-xs md:max-w-sm lg:max-w-md h-auto transition-opacity duration-200"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200 text-sm md:text-base">
            수식 기반 예상 해외 배송비 계산 시스템 - 로지퀀트(LogiQuant)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 입력 폼 */}
          <div>
            <QuoteForm onSubmit={handleSubmit} result={result} />
          </div>

          {/* 결과 표시 */}
          <div className="sticky top-4">
            <QuoteResult result={result} />
            {/* 계산 결과 아래 광고 배치 */}
            {result && result.success && (
              <div className="mt-6">
                <AdSense 
                  adSlot="1953996830" 
                  adFormat="auto"
                  fullWidthResponsive={true}
                  className="rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

        {/* 정보 섹션 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 transition-colors duration-200">지원 범위</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">크기 (각 변):</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400 transition-colors duration-200">0.1cm ~ 500cm</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">부피:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400 transition-colors duration-200">1㎤ ~ 10,000,000㎤</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">무게:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400 transition-colors duration-200">0.01kg ~ 3,000kg</span>
            </div>
          </div>
        </div>

        {/* 페이지 하단 광고 */}
        <div className="mt-8">
          <AdSense 
            adSlot="7482473927" 
            adFormat="auto"
            fullWidthResponsive={true}
            className="rounded-lg"
          />
        </div>
      </div>
    </main>
  );
}
