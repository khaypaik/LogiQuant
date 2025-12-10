'use client';

import { useState } from 'react';
import QuoteForm from '@/components/QuoteForm';
import QuoteResult from '@/components/QuoteResult';
import DarkModeToggle from '@/components/DarkModeToggle';
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
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-200">
            화물 요금 계산기
          </h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
            수식 기반 화물 요금 계산 시스템
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
      </div>
    </main>
  );
}
