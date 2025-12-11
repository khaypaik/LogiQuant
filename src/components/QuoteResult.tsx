'use client';

import { useState } from 'react';
import { QuoteResult as QuoteResultType } from '@/types';

interface QuoteResultProps {
  result: QuoteResultType | null;
}

// 사용 방법 컴포넌트
function UsageGuide() {
  return (
    <div className="text-center">
      <div className="mb-6">
        <svg
          className="w-16 h-16 mx-auto text-blue-500 dark:text-blue-400 mb-4 transition-colors duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-200">
          사용 방법
        </h2>
        <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
          간단한 3단계로 예상 배송비를 확인하세요
        </p>
      </div>

      <div className="space-y-4 text-left">
        <div className="flex items-start">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4">
            <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1 transition-colors duration-200">
              화물 정보 입력
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
              왼쪽 폼에 화물의 가로, 세로, 높이(cm)와 실중량(kg)을 입력하세요. 슬라이더를 사용하거나 직접 입력할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4">
            <span className="text-blue-600 dark:text-blue-400 font-bold">2</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1 transition-colors duration-200">
              배송 방식 선택
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
              해운, 항공-CJ, 항공-롯데 중 배송 방식을 선택하고, 배송 지역(수도권/제주/기타)을 선택하세요.
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4">
            <span className="text-blue-600 dark:text-blue-400 font-bold">3</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1 transition-colors duration-200">
              견적 확인
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
              '요금 계산' 버튼을 클릭하면 예상 배송비와 상세 내역이 표시됩니다. 계산 과정도 투명하게 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 transition-colors duration-200">
          <p className="text-sm text-blue-800 dark:text-blue-200 transition-colors duration-200">
            <span className="font-semibold">💡 팁:</span> 슬라이더를 드래그하면 빠르게 값을 조정할 수 있어요!
          </p>
        </div>
      </div>
    </div>
  );
}

export default function QuoteResult({ result }: QuoteResultProps) {
  const [showUsageGuide, setShowUsageGuide] = useState(false);
  if (!result) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-2 border-blue-200 dark:border-blue-700 transition-colors duration-200">
        <UsageGuide />
      </div>
    );
  }

  if (!result.success) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 rounded-lg p-6 shadow-md transition-colors duration-200">
        <div className="flex items-center mb-4">
          <svg
            className="w-8 h-8 text-red-600 dark:text-red-400 mr-3 transition-colors duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-xl font-bold text-red-800 dark:text-red-300 transition-colors duration-200">계산 불가</h2>
        </div>
        <p className="text-red-700 dark:text-red-300 mb-4 transition-colors duration-200">{result.reason}</p>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md border border-red-200 dark:border-red-800 transition-colors duration-200">
          <p className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">
            입력하신 화물이 지원 범위를 초과합니다. 업체에 직접 문의하여 견적을 받아주세요.
          </p>
        </div>
      </div>
    );
  }

  const { finalPrice, breakdown, warnings, calculationDetails } = result;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-2 border-blue-200 dark:border-blue-700 transition-colors duration-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-200">견적 결과</h2>
        <button
          onClick={() => setShowUsageGuide(!showUsageGuide)}
          className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          aria-label="사용 방법 보기"
          title="사용 방법 보기"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </div>

      {/* 사용 방법 토글 */}
      {showUsageGuide && (
        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <UsageGuide />
        </div>
      )}

      {/* 최종 요금 */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-lg p-6 mb-6 text-center transition-colors duration-200">
        <div className="text-sm font-medium mb-2 opacity-90">예상 요금</div>
        <div className="text-4xl font-bold">
          {finalPrice?.toLocaleString()}원
        </div>
      </div>

      {/* 계산 과정 상세 정보 */}
      {calculationDetails && (
        <div className="mb-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center transition-colors duration-200">
            <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            계산 과정
          </h3>

          {/* 입력 정보 */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600 transition-colors duration-200">
            <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2 transition-colors duration-200">입력 정보</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">크기:</span>{' '}
                <span className="font-medium text-gray-800 dark:text-gray-200 transition-colors duration-200">
                  {calculationDetails.input.dimensions.widthCm} × {calculationDetails.input.dimensions.depthCm} × {calculationDetails.input.dimensions.heightCm} cm
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">실중량:</span>{' '}
                <span className="font-medium text-gray-800 dark:text-gray-200 transition-colors duration-200">{calculationDetails.input.weightKg} kg</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">배송 방식:</span>{' '}
                <span className="font-medium text-gray-800 dark:text-gray-200 transition-colors duration-200">
                  {calculationDetails.input.mode === 'AIR_CJ' ? '항공 - CJ' : 
                   calculationDetails.input.mode === 'AIR_LOTTE' ? '항공 - 롯데' : '해운'}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">지역:</span>{' '}
                <span className="font-medium text-gray-800 dark:text-gray-200 transition-colors duration-200">
                  {calculationDetails.input.region === 'SUDO' ? '수도권' : 
                   calculationDetails.input.region === 'JEJU' ? '제주' : '기타 지역'}
                </span>
              </div>
            </div>
          </div>

          {/* 부피 및 무게 정보 */}
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-700 transition-colors duration-200">
            <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2 transition-colors duration-200">부피 및 무게 계산</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-300 transition-colors duration-200">부피:</span>
                <span className="font-medium text-blue-900 dark:text-blue-100 transition-colors duration-200">
                  {calculationDetails.volume.volumeCm3.toLocaleString()} ㎤
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-300 transition-colors duration-200">부피중량:</span>
                <span className="font-medium text-blue-900 dark:text-blue-100 transition-colors duration-200">
                  {calculationDetails.volume.volumeWeightKg.toFixed(2)} kg
                  <span className="text-xs ml-1">(부피 ÷ 6,000)</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-300 transition-colors duration-200">실중량:</span>
                <span className="font-medium text-blue-900 dark:text-blue-100 transition-colors duration-200">
                  {calculationDetails.volume.actualWeightKg} kg
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-blue-300 dark:border-blue-600 transition-colors duration-200">
                <span className="text-blue-900 dark:text-blue-100 font-semibold transition-colors duration-200">적용 무게:</span>
                <span className="font-bold text-blue-900 dark:text-blue-100 transition-colors duration-200">
                  {calculationDetails.volume.chargeableWeightKg.toFixed(2)} kg
                  <span className="text-xs ml-1 font-normal">
                    ({calculationDetails.volume.weightUsed === 'actual' ? '실중량 적용' : '부피중량 적용'})
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* 국제 배송비 계산 */}
          <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 border border-green-200 dark:border-green-700 transition-colors duration-200">
            <h4 className="font-medium text-green-900 dark:text-green-200 mb-2 transition-colors duration-200">국제 배송비 계산</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700 dark:text-green-300 transition-colors duration-200">적용 무게:</span>
                <span className="font-medium text-green-900 dark:text-green-100 transition-colors duration-200">
                  {calculationDetails.baseShipping.weightUsed.toFixed(2)} kg
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700 dark:text-green-300 transition-colors duration-200">계산 방법:</span>
                <span className="font-medium text-green-900 dark:text-green-100 transition-colors duration-200">
                  {calculationDetails.baseShipping.method}
                </span>
              </div>
              <div className="pt-2 border-t border-green-300 dark:border-green-600 transition-colors duration-200">
                <div className="text-green-700 dark:text-green-300 mb-1 transition-colors duration-200">계산 과정:</div>
                <div className="text-green-900 dark:text-green-100 font-mono text-xs bg-white dark:bg-gray-800 p-2 rounded border border-green-200 dark:border-green-700 transition-colors duration-200">
                  {calculationDetails.baseShipping.calculation}
                </div>
              </div>
              <div className="flex justify-between pt-2 border-t border-green-300 dark:border-green-600 transition-colors duration-200">
                <span className="text-green-900 dark:text-green-100 font-semibold transition-colors duration-200">국제 배송비:</span>
                <span className="font-bold text-green-900 dark:text-green-100 transition-colors duration-200">
                  {breakdown?.baseShipping.toLocaleString()}원
                </span>
              </div>
            </div>
          </div>

          {/* 국내 배송비 계산 (있는 경우) */}
          {calculationDetails.domesticShipping?.required && (
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 border border-purple-200 dark:border-purple-700 transition-colors duration-200">
              <h4 className="font-medium text-purple-900 dark:text-purple-200 mb-2 transition-colors duration-200">국내 배송비 (경동택배) 계산</h4>
              <div className="space-y-2 text-sm">
                <div className="text-purple-700 dark:text-purple-300 transition-colors duration-200">
                  <span className="font-medium">필요한 이유:</span>{' '}
                  {calculationDetails.domesticShipping.reason}
                </div>
                {calculationDetails.domesticShipping.calculation && (
                  <div className="pt-2 border-t border-purple-300 dark:border-purple-600 transition-colors duration-200">
                    <div className="text-purple-700 dark:text-purple-300 mb-1 transition-colors duration-200">계산 과정:</div>
                    <div className="text-purple-900 dark:text-purple-100 font-mono text-xs bg-white dark:bg-gray-800 p-2 rounded border border-purple-200 dark:border-purple-700 transition-colors duration-200">
                      {calculationDetails.domesticShipping.calculation}
                    </div>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-purple-300 dark:border-purple-600 transition-colors duration-200">
                  <span className="text-purple-900 dark:text-purple-100 font-semibold transition-colors duration-200">국내 배송비:</span>
                  <span className="font-bold text-purple-900 dark:text-purple-100 transition-colors duration-200">
                    {breakdown?.domesticShipping.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 상세 내역 요약 */}
      {breakdown && (
        <div className="space-y-3 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 transition-colors duration-200">요금 내역</h3>
          
          <div className="flex justify-between items-center py-2 transition-colors duration-200">
            <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">국제 배송비</span>
            <span className="font-medium text-gray-800 dark:text-gray-200 transition-colors duration-200">
              {breakdown.baseShipping.toLocaleString()}원
            </span>
          </div>

          {breakdown.domesticShipping > 0 && (
            <div className="flex justify-between items-center py-2 transition-colors duration-200">
              <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">국내 배송비 (경동택배)</span>
              <span className="font-medium text-gray-800 dark:text-gray-200 transition-colors duration-200">
                {breakdown.domesticShipping.toLocaleString()}원
              </span>
            </div>
          )}

          {breakdown.extraCharge > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">추가금</span>
              <span className="font-medium text-gray-800 dark:text-gray-200 transition-colors duration-200">
                {breakdown.extraCharge.toLocaleString()}원
              </span>
            </div>
          )}

          <div className="flex justify-between items-center py-3 border-t-2 border-gray-300 dark:border-gray-600 mt-2 transition-colors duration-200">
            <span className="text-lg font-bold text-gray-800 dark:text-gray-100 transition-colors duration-200">총 요금</span>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400 transition-colors duration-200">
              {finalPrice?.toLocaleString()}원
            </span>
          </div>
        </div>
      )}

      {/* 경고 메시지 */}
      {warnings && warnings.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 transition-colors duration-200">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5 transition-colors duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1 transition-colors duration-200">주의사항</h4>
              <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300 transition-colors duration-200">
                {warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 안내 문구 */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center transition-colors duration-200">
          * 위 요금은 예상 금액이며, 실제 배송비는 업체 사정에 따라 달라질 수 있습니다.
        </p>
      </div>
    </div>
  );
}

