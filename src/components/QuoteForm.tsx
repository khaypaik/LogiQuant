'use client';

import { useState } from 'react';
import { QuoteInput, ShippingMode, Region, QuoteResult as QuoteResultType } from '@/types';
import { calcVolumeWeight } from '@/lib/utils';
import { LIMITS } from '@/lib/constants';

interface QuoteFormProps {
  onSubmit: (input: QuoteInput) => void;
  result: QuoteResultType | null;
}

export default function QuoteForm({ onSubmit, result }: QuoteFormProps) {
  const [formData, setFormData] = useState<QuoteInput>({
    widthCm: 50,
    depthCm: 40,
    heightCm: 30,
    weightKg: 10,
    mode: 'SEA',
    region: 'SUDO',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 부피중량 자동 계산
  const volumeWeight = calcVolumeWeight(
    formData.widthCm,
    formData.depthCm,
    formData.heightCm
  );

  // 입력값 유효성 검사
  const validateField = (name: string, value: number): string | null => {
    switch (name) {
      case 'widthCm':
      case 'depthCm':
      case 'heightCm':
        if (value < 0.1 || value > LIMITS.MAX_DIMENSION_CM) {
          return `${name === 'widthCm' ? '가로' : name === 'depthCm' ? '세로' : '높이'}는 0.1cm 이상 ${LIMITS.MAX_DIMENSION_CM}cm 이하여야 합니다.`;
        }
        break;
      case 'weightKg':
        if (value < 0.01 || value > LIMITS.MAX_WEIGHT_KG) {
          return `무게는 0.01kg 이상 ${LIMITS.MAX_WEIGHT_KG.toLocaleString()}kg 이하여야 합니다.`;
        }
        break;
    }
    return null;
  };

  const handleChange = (name: keyof QuoteInput, value: string | number) => {
    // mode와 region은 문자열이므로 숫자 변환하지 않음
    if (name === 'mode') {
      setFormData((prev) => {
        const newData = {
          ...prev,
          mode: value as ShippingMode,
        };
        // 배송 방식 변경 시 자동 재계산
        setTimeout(() => {
          if (isFormValid(newData)) {
            onSubmit(newData);
          }
        }, 0);
        return newData;
      });
      return;
    }
    
    if (name === 'region') {
      setFormData((prev) => {
        const newData = {
          ...prev,
          region: value as Region,
        };
        // 지역 변경 시 자동 재계산
        setTimeout(() => {
          if (isFormValid(newData)) {
            onSubmit(newData);
          }
        }, 0);
        return newData;
      });
      return;
    }
    
    // 숫자 필드는 변환 및 유효성 검사
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    
    // 실시간 유효성 검사
    const error = validateField(name, numValue);
    setErrors((prev) => ({
      ...prev,
      [name]: error || '',
    }));

    setFormData((prev) => ({
      ...prev,
      [name]: numValue,
    }));
  };

  // 폼 유효성 검사 함수
  const isFormValid = (data: QuoteInput): boolean => {
    // 전체 유효성 검사
    const newErrors: Record<string, string> = {};
    Object.keys(data).forEach((key) => {
      if (key !== 'mode' && key !== 'region') {
        const error = validateField(key, data[key as keyof QuoteInput] as number);
        if (error) newErrors[key] = error;
      }
    });

    // 부피 검증
    const volumeCm3 = data.widthCm * data.depthCm * data.heightCm;
    if (volumeCm3 < 1 || volumeCm3 > LIMITS.MAX_VOLUME_CM3) {
      newErrors.volume = `부피는 1㎤ 이상 ${LIMITS.MAX_VOLUME_CM3.toLocaleString()}㎤ 이하여야 합니다.`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    return true;
  };

  // 계산 트리거 함수 (엔터 키 또는 제출 버튼에서 사용)
  const triggerCalculation = () => {
    if (isFormValid(formData)) {
      onSubmit(formData);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerCalculation();
  };

  // 엔터 키 입력 핸들러
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      triggerCalculation();
    }
  };

  // 견적 요약 표시
  const renderSummary = () => {
    if (!result || !result.success || !result.finalPrice) {
      return null;
    }

    const baseShipping = result.breakdown?.baseShipping || 0;
    const domesticShipping = result.breakdown?.domesticShipping || 0;

    // 배송 방식에 따른 라벨 결정
    const shippingModeLabel = formData.mode === 'SEA' ? '해운' : '항공';

    return (
      <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg shadow-sm animate-fade-in">
        <div className="text-sm font-semibold text-blue-900 text-center">
          <span className="text-sm font-medium text-blue-700">예상 배송비: </span>
          <span className="text-base text-blue-800 font-bold">{baseShipping.toLocaleString()}원</span>
          <span className="text-xs text-blue-600 font-normal">({shippingModeLabel})</span>
          {domesticShipping > 0 && (
            <>
              <span className="mx-2 text-blue-600 font-normal">+</span>
              <span className="text-base text-blue-800 font-bold">{domesticShipping.toLocaleString()}원</span>
              <span className="text-xs text-blue-600 font-normal">(경동)</span>
            </>
          )}
          <span className="mx-2 text-blue-600 font-normal">=</span>
          <span className="text-xl text-blue-900 font-extrabold">{result.finalPrice.toLocaleString()}원</span>
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md transition-shadow hover:shadow-lg">
        <h2 className="text-xl font-bold mb-4">화물 정보 입력</h2>
        
        {/* 크기 입력 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            크기 (cm)
          </label>
          <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="widthCm" className="block text-sm font-medium text-gray-700 mb-1">
              가로 (cm)
            </label>
            <input
              type="number"
              id="widthCm"
              step="0.1"
              min="0.1"
              max={LIMITS.MAX_DIMENSION_CM}
              value={formData.widthCm}
              onChange={(e) => handleChange('widthCm', e.target.value)}
              onKeyDown={handleKeyDown}
              className={`w-full px-3 py-2 bg-white text-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 ${
                errors.widthCm ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.widthCm && (
              <p className="text-red-500 text-xs mt-1">{errors.widthCm}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="depthCm" className="block text-sm font-medium text-gray-700 mb-1">
              세로 (cm)
            </label>
            <input
              type="number"
              id="depthCm"
              step="0.1"
              min="0.1"
              max={LIMITS.MAX_DIMENSION_CM}
              value={formData.depthCm}
              onChange={(e) => handleChange('depthCm', e.target.value)}
              onKeyDown={handleKeyDown}
              className={`w-full px-3 py-2 bg-white text-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 ${
                errors.depthCm ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.depthCm && (
              <p className="text-red-500 text-xs mt-1">{errors.depthCm}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="heightCm" className="block text-sm font-medium text-gray-700 mb-1">
              높이 (cm)
            </label>
            <input
              type="number"
              id="heightCm"
              step="0.1"
              min="0.1"
              max={LIMITS.MAX_DIMENSION_CM}
              value={formData.heightCm}
              onChange={(e) => handleChange('heightCm', e.target.value)}
              onKeyDown={handleKeyDown}
              className={`w-full px-3 py-2 bg-white text-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 ${
                errors.heightCm ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.heightCm && (
              <p className="text-red-500 text-xs mt-1">{errors.heightCm}</p>
            )}
          </div>
          </div>
          
          {/* 견적 요약 표시 - 크기 입력 필드 바로 아래 */}
          {renderSummary()}
        </div>

        {/* 부피 및 부피중량 표시 */}
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <div className="text-sm text-gray-600">
            <span className="font-medium">부피:</span>{' '}
            {(formData.widthCm * formData.depthCm * formData.heightCm).toLocaleString()} ㎤
          </div>
          <div className="text-sm text-gray-600 mt-1">
            <span className="font-medium">부피중량:</span>{' '}
            {volumeWeight.toFixed(2)} kg
          </div>
        </div>

        {/* 무게 입력 */}
        <div className="mb-4">
          <label htmlFor="weightKg" className="block text-sm font-medium text-gray-700 mb-1">
            실중량 (kg)
          </label>
          <input
            type="number"
            id="weightKg"
            step="0.01"
            min="0.01"
            max={LIMITS.MAX_WEIGHT_KG}
            value={formData.weightKg}
            onChange={(e) => handleChange('weightKg', e.target.value)}
            className={`w-full px-3 py-2 bg-white text-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 ${
              errors.weightKg ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.weightKg && (
            <p className="text-red-500 text-xs mt-1">{errors.weightKg}</p>
          )}
        </div>

        {/* 적용 무게 표시 */}
        <div className="mb-4 p-3 bg-blue-50 rounded-md">
          <div className="text-sm text-blue-800">
            <span className="font-medium">적용 무게:</span>{' '}
            {Math.max(formData.weightKg, volumeWeight).toFixed(2)} kg
            {volumeWeight > formData.weightKg && (
              <span className="ml-2 text-xs">(부피중량 적용)</span>
            )}
          </div>
        </div>

        {/* 배송 방식 선택 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            배송 방식
          </label>
          <div className="space-y-2">
            <label className={`flex items-center p-3 rounded-md border-2 cursor-pointer transition-all ${
              formData.mode === 'SEA' 
                ? 'bg-blue-50 border-blue-500 text-blue-900' 
                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            }`}>
              <input
                type="radio"
                name="mode"
                value="SEA"
                checked={formData.mode === 'SEA'}
                onChange={(e) => handleChange('mode', e.target.value as ShippingMode)}
                className="mr-3"
              />
              <span className="font-medium">해운 (DIAMOND 등급)</span>
            </label>
            <label className={`flex items-center p-3 rounded-md border-2 cursor-pointer transition-all ${
              formData.mode === 'AIR_CJ' 
                ? 'bg-blue-50 border-blue-500 text-blue-900' 
                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            }`}>
              <input
                type="radio"
                name="mode"
                value="AIR_CJ"
                checked={formData.mode === 'AIR_CJ'}
                onChange={(e) => handleChange('mode', e.target.value as ShippingMode)}
                className="mr-3"
              />
              <span className="font-medium">항공 - CJ (DIAMOND 등급)</span>
            </label>
            <label className={`flex items-center p-3 rounded-md border-2 cursor-pointer transition-all ${
              formData.mode === 'AIR_LOTTE' 
                ? 'bg-blue-50 border-blue-500 text-blue-900' 
                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            }`}>
              <input
                type="radio"
                name="mode"
                value="AIR_LOTTE"
                checked={formData.mode === 'AIR_LOTTE'}
                onChange={(e) => handleChange('mode', e.target.value as ShippingMode)}
                className="mr-3"
              />
              <span className="font-medium">항공 - 롯데 (DIAMOND 등급)</span>
            </label>
          </div>
        </div>

        {/* 지역 선택 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            지역
          </label>
          <select
            value={formData.region}
            onChange={(e) => handleChange('region', e.target.value as Region)}
            className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="SUDO">수도권</option>
            <option value="OTHER">기타 지역</option>
            <option value="JEJU">제주</option>
          </select>
        </div>

        {errors.volume && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{errors.volume}</p>
          </div>
        )}

        {/* 제출 버튼 */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium transition-colors"
        >
          요금 계산
        </button>
      </div>
    </form>
  );
}

