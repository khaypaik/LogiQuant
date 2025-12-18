import { ShippingRates } from '@/types';

/**
 * 입력값 한계 상수
 */
export const LIMITS = {
  MAX_DIMENSION_CM: 500,           // 최대 크기 (각 변)
  MAX_VOLUME_CM3: 10_000_000,      // 최대 부피 (10㎥)
  MAX_WEIGHT_KG: 3_000,            // 최대 무게 (3톤)
  MAX_VOLUME_WEIGHT_KG: 1_666.67,  // 최대 부피중량 (10M㎤÷6000)
} as const;

/**
 * 배송사별 요율 상수
 */
export const RATES = {
  AIR_CJ: {
    BASE_0_5KG: 5_200,              // 0.5kg 기준 요금
    FIRST_STEP_RATE: 850,           // 0.5kg → 1kg 구간 증가액
    SECOND_STEP_RATE: 1_500,         // 1kg → 1.5kg 구간 증가액
    RATE_1_5_TO_4: 800,              // 1.5kg → 4kg 구간: 0.5kg당 증가액
    RATE_4_TO_4_5: 1_000,           // 4kg → 4.5kg 구간 증가액
    RATE_4_5_TO_5: 2_100,            // 4.5kg → 5kg 구간 증가액
    RATE_AFTER_5: 1_200,             // 5kg 이후: 0.5kg당 증가액
    BASE_10KG: 26_650,               // 10kg 기준 요금 (10kg 초과 구간용)
    RATE_PER_0_5KG: 1_430,           // 10kg 초과 구간: 0.5kg당 증가액
    CALIBRATION: 4_900,              // 10kg 초과 구간 보정 상수
  },
  AIR_LOTTE: {
    BASE_0_5KG: 4_800,              // 0.5kg 기준 요금
    FIRST_STEP_RATE: 600,           // 0.5kg → 1kg 구간 증가액
    SECOND_STEP_RATE: 1_700,         // 1kg → 1.5kg 구간 증가액
    RATE_1_5_TO_4: 800,              // 1.5kg → 4kg 구간: 0.5kg당 증가액
    RATE_4_TO_4_5: 1_000,           // 4kg → 4.5kg 구간 증가액
    RATE_4_5_TO_5: 2_100,            // 4.5kg → 5kg 구간 증가액
    RATE_AFTER_5: 1_200,             // 5kg 이후: 0.5kg당 증가액
    BASE_10KG: 26_200,               // 10kg 기준 요금 (10kg 초과 구간용)
    RATE_PER_0_5KG: 1_400,           // 10kg 초과 구간: 0.5kg당 증가액
    CALIBRATION: 0,                  // 보정 상수 없음
  },
  SEA: {
    BASE_0_5KG: 4_700,              // 0.5kg 기준 요금
    FIRST_STEP_RATE: 400,           // 0.5kg → 1kg 구간 증가액 (특별)
    RATE_PER_0_5KG: 700,            // 1kg 이후: 0.5kg당 증가액
    BASE_100KG: 119_700,            // 100kg 기준 요금 (83kg 이후 수식 전환점)
    RATE_OVER_100: 550,              // 100kg 초과 구간: 0.5kg당 증가액
  },
  KYUNGDONG: {
    VOLUME: {
      BASE_5M: 303_000,             // 5M㎤ 기준 요금
      RATE_PER_10K: 600,            // 10,000㎤당 증가액
    },
    WEIGHT: {
      BASE_1000KG: 99_400,          // 1,000kg 기준 요금
      RATE_PER_10KG: 800,           // 10kg당 증가액
    },
    REGION_RATES: {
      SUDO: 1.20,                   // 수도권 할증률
      OTHER: 1.25,                  // 기타 지역 할증률
      JEJU: 1.25,                   // 제주 할증률 (기타와 동일)
    },
  },
} as const;

/**
 * 2차 배송 자동 전환 조건
 */
export const DOMESTIC_SHIPPING_THRESHOLD = {
  WEIGHT_KG: 20,                    // 실중량 기준 (kg)
  SUM_OF_SIDES_CM: 160,             // 가로+세로+높이 합계 기준 (cm)
} as const;

/**
 * 요율/계산 로직 버전 (API 응답 헤더로 노출하여 추적 가능하게 함)
 * - 가성비 목적: DB/관리자 없이도 "언제 규칙이 바뀌었는지"를 추적할 수 있음
 */
export const RATES_VERSION = '2025-12-18' as const;

