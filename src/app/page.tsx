'use client';

import { useState } from 'react';
import QuoteForm from '@/components/QuoteForm';
import QuoteResult from '@/components/QuoteResult';
import { QuoteInput, QuoteResult as QuoteResultType } from '@/types';
import { calculateQuote } from '@/lib/calculator';

export default function Home() {
  const [result, setResult] = useState<QuoteResultType | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleSubmit = (input: QuoteInput) => {
    setIsCalculating(true);
    
    // 계산 수행 (비동기로 처리하여 UI 반응성 향상)
    setTimeout(() => {
      const calculatedResult = calculateQuote(input);
      setResult(calculatedResult);
      setIsCalculating(false);
    }, 100);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            화물 요금 계산기
          </h1>
          <p className="text-gray-600">
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
            {isCalculating ? (
              <div className="bg-white rounded-lg shadow-md p-6 text-center animate-fade-in">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">계산 중...</p>
              </div>
            ) : (
              <QuoteResult result={result} />
            )}
          </div>
        </div>

        {/* 정보 섹션 */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">지원 범위</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">크기 (각 변):</span>
              <span className="ml-2 text-gray-600">0.1cm ~ 500cm</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">부피:</span>
              <span className="ml-2 text-gray-600">1㎤ ~ 10,000,000㎤</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">무게:</span>
              <span className="ml-2 text-gray-600">0.01kg ~ 3,000kg</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
