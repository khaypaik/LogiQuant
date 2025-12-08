'use client';

import { QuoteResult as QuoteResultType } from '@/types';

interface QuoteResultProps {
  result: QuoteResultType | null;
}

export default function QuoteResult({ result }: QuoteResultProps) {
  if (!result) {
    return null;
  }

  if (!result.success) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 shadow-md">
        <div className="flex items-center mb-4">
          <svg
            className="w-8 h-8 text-red-600 mr-3"
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
          <h2 className="text-xl font-bold text-red-800">계산 불가</h2>
        </div>
        <p className="text-red-700 mb-4">{result.reason}</p>
        <div className="bg-white p-4 rounded-md border border-red-200">
          <p className="text-sm text-gray-700">
            입력하신 화물이 지원 범위를 초과합니다. 업체에 직접 문의하여 견적을 받아주세요.
          </p>
        </div>
      </div>
    );
  }

  const { finalPrice, breakdown, warnings, calculationDetails } = result;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">견적 결과</h2>

      {/* 최종 요금 */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6 mb-6 text-center">
        <div className="text-sm font-medium mb-2 opacity-90">예상 요금</div>
        <div className="text-4xl font-bold">
          {finalPrice?.toLocaleString()}원
        </div>
      </div>

      {/* 계산 과정 상세 정보 */}
      {calculationDetails && (
        <div className="mb-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            계산 과정
          </h3>

          {/* 입력 정보 */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-700 mb-2">입력 정보</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">크기:</span>{' '}
                <span className="font-medium">
                  {calculationDetails.input.dimensions.widthCm} × {calculationDetails.input.dimensions.depthCm} × {calculationDetails.input.dimensions.heightCm} cm
                </span>
              </div>
              <div>
                <span className="text-gray-600">실중량:</span>{' '}
                <span className="font-medium">{calculationDetails.input.weightKg} kg</span>
              </div>
              <div>
                <span className="text-gray-600">배송 방식:</span>{' '}
                <span className="font-medium">
                  {calculationDetails.input.mode === 'AIR_CJ' ? '항공 - CJ' : 
                   calculationDetails.input.mode === 'AIR_LOTTE' ? '항공 - 롯데' : '해운'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">지역:</span>{' '}
                <span className="font-medium">
                  {calculationDetails.input.region === 'SUDO' ? '수도권' : 
                   calculationDetails.input.region === 'JEJU' ? '제주' : '기타 지역'}
                </span>
              </div>
            </div>
          </div>

          {/* 부피 및 무게 정보 */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">부피 및 무게 계산</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">부피:</span>
                <span className="font-medium text-blue-900">
                  {calculationDetails.volume.volumeCm3.toLocaleString()} ㎤
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">부피중량:</span>
                <span className="font-medium text-blue-900">
                  {calculationDetails.volume.volumeWeightKg.toFixed(2)} kg
                  <span className="text-xs ml-1">(부피 ÷ 6,000)</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">실중량:</span>
                <span className="font-medium text-blue-900">
                  {calculationDetails.volume.actualWeightKg} kg
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-blue-300">
                <span className="text-blue-900 font-semibold">적용 무게:</span>
                <span className="font-bold text-blue-900">
                  {calculationDetails.volume.chargeableWeightKg.toFixed(2)} kg
                  <span className="text-xs ml-1 font-normal">
                    ({calculationDetails.volume.weightUsed === 'actual' ? '실중량 적용' : '부피중량 적용'})
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* 국제 배송비 계산 */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-medium text-green-900 mb-2">국제 배송비 계산</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">적용 무게:</span>
                <span className="font-medium text-green-900">
                  {calculationDetails.baseShipping.weightUsed.toFixed(2)} kg
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">계산 방법:</span>
                <span className="font-medium text-green-900">
                  {calculationDetails.baseShipping.method}
                </span>
              </div>
              <div className="pt-2 border-t border-green-300">
                <div className="text-green-700 mb-1">계산 과정:</div>
                <div className="text-green-900 font-mono text-xs bg-white p-2 rounded border border-green-200">
                  {calculationDetails.baseShipping.calculation}
                </div>
              </div>
              <div className="flex justify-between pt-2 border-t border-green-300">
                <span className="text-green-900 font-semibold">국제 배송비:</span>
                <span className="font-bold text-green-900">
                  {breakdown?.baseShipping.toLocaleString()}원
                </span>
              </div>
            </div>
          </div>

          {/* 국내 배송비 계산 (있는 경우) */}
          {calculationDetails.domesticShipping?.required && (
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h4 className="font-medium text-purple-900 mb-2">국내 배송비 (경동택배) 계산</h4>
              <div className="space-y-2 text-sm">
                <div className="text-purple-700">
                  <span className="font-medium">필요한 이유:</span>{' '}
                  {calculationDetails.domesticShipping.reason}
                </div>
                {calculationDetails.domesticShipping.calculation && (
                  <div className="pt-2 border-t border-purple-300">
                    <div className="text-purple-700 mb-1">계산 과정:</div>
                    <div className="text-purple-900 font-mono text-xs bg-white p-2 rounded border border-purple-200">
                      {calculationDetails.domesticShipping.calculation}
                    </div>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-purple-300">
                  <span className="text-purple-900 font-semibold">국내 배송비:</span>
                  <span className="font-bold text-purple-900">
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
          <h3 className="text-lg font-semibold text-gray-700 mb-3">요금 내역</h3>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600">국제 배송비</span>
            <span className="font-medium text-gray-800">
              {breakdown.baseShipping.toLocaleString()}원
            </span>
          </div>

          {breakdown.domesticShipping > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-600">국내 배송비 (경동택배)</span>
              <span className="font-medium text-gray-800">
                {breakdown.domesticShipping.toLocaleString()}원
              </span>
            </div>
          )}

          {breakdown.extraCharge > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-600">추가금</span>
              <span className="font-medium text-gray-800">
                {breakdown.extraCharge.toLocaleString()}원
              </span>
            </div>
          )}

          <div className="flex justify-between items-center py-3 border-t-2 border-gray-300 mt-2">
            <span className="text-lg font-bold text-gray-800">총 요금</span>
            <span className="text-xl font-bold text-blue-600">
              {finalPrice?.toLocaleString()}원
            </span>
          </div>
        </div>
      )}

      {/* 경고 메시지 */}
      {warnings && warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-yellow-600 mr-2 mt-0.5"
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
              <h4 className="font-medium text-yellow-800 mb-1">주의사항</h4>
              <ul className="list-disc list-inside text-sm text-yellow-700">
                {warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 안내 문구 */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          * 위 요금은 예상 금액이며, 실제 배송비는 업체 사정에 따라 달라질 수 있습니다.
        </p>
      </div>
    </div>
  );
}

