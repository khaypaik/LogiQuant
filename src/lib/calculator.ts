import { QuoteInput, QuoteResult, ShippingMode, Region, RateTableEntry } from '@/types';
import { LIMITS, RATES, DOMESTIC_SHIPPING_THRESHOLD } from './constants';
import { roundToHundred, calcVolumeWeight, calcChargeableWeight } from './utils';
import shippingRatesData from '@/constants/shipping-rates.json';

const shippingRates = shippingRatesData as {
  AIR_CJ: RateTableEntry[];
  AIR_LOTTE: RateTableEntry[];
  SEA: RateTableEntry[];
};

/**
 * 요금표에서 무게에 해당하는 요금 조회
 * @param weightKg 무게 (kg)
 * @param mode 배송 방식
 * @returns 요금 (원), 없으면 null
 */
function lookupTable(weightKg: number, mode: ShippingMode): number | null {
  const table = shippingRates[mode];
  if (!table) return null;

  // 무게에 해당하는 구간 찾기
  for (let i = table.length - 1; i >= 0; i--) {
    if (weightKg <= table[i].maxWeight) {
      // 테이블 값도 100원 단위로 올림 처리
      return roundToHundred(table[i].price);
    }
  }
  return null;
}

/**
 * 항공-CJ 요금 계산 (DIAMOND 등급 - 수식 기반)
 * 요율표 분석 결과:
 * - 0.5kg: 5,200원 (기준)
 * - 0.5kg → 1kg: +850원
 * - 1kg → 1.5kg: +1,500원
 * - 1.5kg → 4kg: 0.5kg당 +800원 (5단계)
 * - 4kg → 4.5kg: +1,000원
 * - 4.5kg → 5kg: +2,100원
 * - 5kg 이후: 0.5kg당 +1,200원
 * - 10kg 초과: 별도 수식 적용
 * 
 * @param weightKg 무게 (kg)
 * @returns 요금 (원)
 */
export function calcAirCJ(weightKg: number): number {
  const {
    BASE_0_5KG,
    FIRST_STEP_RATE,
    SECOND_STEP_RATE,
    RATE_1_5_TO_4,
    RATE_4_TO_4_5,
    RATE_4_5_TO_5,
    RATE_AFTER_5,
    BASE_10KG,
    RATE_PER_0_5KG,
    CALIBRATION,
  } = RATES.AIR_CJ;

  // 0.5kg 이하
  if (weightKg <= 0.5) {
    return BASE_0_5KG;
  }

  // 10kg 초과 구간: 별도 수식 적용
  if (weightKg > 10) {
    const extraSteps = Math.ceil((weightKg - 10) / 0.5);
    const calculatedPrice = BASE_10KG + (extraSteps * RATE_PER_0_5KG) + CALIBRATION;
    return roundToHundred(calculatedPrice);
  }

  // 0.5kg 초과 ~ 10kg 이하: 기본 수식 적용
  const steps = Math.ceil((weightKg - 0.5) / 0.5);

  if (steps === 1) {
    // 0.5kg → 1kg 구간
    return BASE_0_5KG + FIRST_STEP_RATE;
  } else if (steps === 2) {
    // 1kg → 1.5kg 구간
    return BASE_0_5KG + FIRST_STEP_RATE + SECOND_STEP_RATE;
  } else if (steps <= 7) {
    // 1.5kg → 4kg 구간 (steps 3~7, 5단계)
    const stepsInRange = steps - 2;
    return BASE_0_5KG + FIRST_STEP_RATE + SECOND_STEP_RATE + (stepsInRange * RATE_1_5_TO_4);
  } else if (steps === 8) {
    // 4kg → 4.5kg 구간
    return BASE_0_5KG + FIRST_STEP_RATE + SECOND_STEP_RATE + (5 * RATE_1_5_TO_4) + RATE_4_TO_4_5;
  } else if (steps === 9) {
    // 4.5kg → 5kg 구간
    return BASE_0_5KG + FIRST_STEP_RATE + SECOND_STEP_RATE + (5 * RATE_1_5_TO_4) + RATE_4_TO_4_5 + RATE_4_5_TO_5;
  } else {
    // 5kg 이후 (steps >= 10, 즉 5kg 초과 ~ 10kg 이하)
    const stepsAfter5 = steps - 9;
    return BASE_0_5KG + FIRST_STEP_RATE + SECOND_STEP_RATE + (5 * RATE_1_5_TO_4) + RATE_4_TO_4_5 + RATE_4_5_TO_5 + (stepsAfter5 * RATE_AFTER_5);
  }
}

/**
 * 항공-롯데 요금 계산 (DIAMOND 등급 - 수식 기반)
 * 요율표 분석 결과:
 * - 0.5kg: 4,800원 (기준)
 * - 0.5kg → 1kg: +600원
 * - 1kg → 1.5kg: +1,700원
 * - 1.5kg → 4kg: 0.5kg당 +800원 (5단계)
 * - 4kg → 4.5kg: +1,000원
 * - 4.5kg → 5kg: +2,100원
 * - 5kg 이후: 0.5kg당 +1,200원
 * - 10kg 초과: 별도 수식 적용
 * 
 * @param weightKg 무게 (kg)
 * @returns 요금 (원)
 */
export function calcAirLotte(weightKg: number): number {
  const {
    BASE_0_5KG,
    FIRST_STEP_RATE,
    SECOND_STEP_RATE,
    RATE_1_5_TO_4,
    RATE_4_TO_4_5,
    RATE_4_5_TO_5,
    RATE_AFTER_5,
    BASE_10KG,
    RATE_PER_0_5KG,
    CALIBRATION,
  } = RATES.AIR_LOTTE;

  // 0.5kg 이하
  if (weightKg <= 0.5) {
    return roundToHundred(BASE_0_5KG);
  }

  // 10kg 초과 구간: 별도 수식 적용
  if (weightKg > 10) {
    const extraSteps = Math.ceil((weightKg - 10) / 0.5);
    const calculatedPrice = BASE_10KG + (extraSteps * RATE_PER_0_5KG) + CALIBRATION;
    return roundToHundred(calculatedPrice);
  }

  // 0.5kg 초과 ~ 10kg 이하: 기본 수식 적용
  const steps = Math.ceil((weightKg - 0.5) / 0.5);
  let calculatedPrice = BASE_0_5KG;

  if (steps === 1) {
    // 0.5kg → 1kg 구간
    calculatedPrice += FIRST_STEP_RATE;
  } else if (steps === 2) {
    // 1kg → 1.5kg 구간
    calculatedPrice += FIRST_STEP_RATE + SECOND_STEP_RATE;
  } else if (steps <= 7) {
    // 1.5kg → 4kg 구간 (steps 3~7, 5단계)
    const stepsInRange = steps - 2;
    calculatedPrice += FIRST_STEP_RATE + SECOND_STEP_RATE + (stepsInRange * RATE_1_5_TO_4);
  } else if (steps === 8) {
    // 4kg → 4.5kg 구간
    calculatedPrice += FIRST_STEP_RATE + SECOND_STEP_RATE + (5 * RATE_1_5_TO_4) + RATE_4_TO_4_5;
  } else if (steps === 9) {
    // 4.5kg → 5kg 구간
    calculatedPrice += FIRST_STEP_RATE + SECOND_STEP_RATE + (5 * RATE_1_5_TO_4) + RATE_4_TO_4_5 + RATE_4_5_TO_5;
  } else {
    // 5kg 이후 (steps >= 10, 즉 5kg 초과 ~ 10kg 이하)
    const stepsAfter5 = steps - 9;
    calculatedPrice += FIRST_STEP_RATE + SECOND_STEP_RATE + (5 * RATE_1_5_TO_4) + RATE_4_TO_4_5 + RATE_4_5_TO_5 + (stepsAfter5 * RATE_AFTER_5);
  }

  return roundToHundred(calculatedPrice);
}

/**
 * 해운 요금 계산 (DIAMOND 등급 - 수식 기반)
 * 요율표 분석 결과:
 * - 0.5kg: 4,700원 (기준)
 * - 0.5kg → 1kg: +400원 (특별 구간)
 * - 1kg 이후: 0.5kg당 +700원 (일정)
 * 
 * @param weightKg 무게 (kg)
 * @returns 요금 (원)
 */
export function calcSea(weightKg: number): number {
  const { BASE_0_5KG, FIRST_STEP_RATE, RATE_PER_0_5KG, BASE_100KG, RATE_OVER_100 } = RATES.SEA;

  // 0.5kg 이하
  if (weightKg <= 0.5) {
    return BASE_0_5KG;
  }

  // 100kg 초과 구간: 별도 수식 적용
  if (weightKg > 100) {
    const stepsOver100 = Math.ceil((weightKg - 100) / 0.5);
    const calculatedPrice = BASE_100KG + (stepsOver100 * RATE_OVER_100);
    return roundToHundred(calculatedPrice);
  }

  // 0.5kg 초과 ~ 100kg 이하: 기본 수식 적용
  // 0.5kg 초과분을 0.5kg 단위로 계산
  const steps = Math.ceil((weightKg - 0.5) / 0.5);

  if (steps === 1) {
    // 0.5kg → 1kg 구간 (특별 구간)
    return BASE_0_5KG + FIRST_STEP_RATE;
  } else {
    // 1kg 초과 구간
    // 공식: BASE_0_5KG + FIRST_STEP_RATE + ((steps - 1) × RATE_PER_0_5KG)
    const calculatedPrice = BASE_0_5KG + FIRST_STEP_RATE + ((steps - 1) * RATE_PER_0_5KG);
    return roundToHundred(calculatedPrice);
  }
}

/**
 * 경동택배 부피 기준 요금 계산
 * @param volumeCm3 부피 (㎤)
 * @returns 요금 (원)
 */
function calcKyungdongByVolume(volumeCm3: number): number {
  // 5M㎤까지는 테이블 참조 (현재는 수식만 구현)
  // 실제로는 테이블이 필요하지만, PRD에 따르면 5M㎤ 초과 시 수식 적용
  if (volumeCm3 <= 5_000_000) {
    // 테이블 데이터가 없으므로 임시로 수식 적용
    // 실제 구현 시 테이블 조회 로직 추가 필요
  }

  const { BASE_5M, RATE_PER_10K } = RATES.KYUNGDONG.VOLUME;
  const extraUnits = Math.ceil((volumeCm3 - 5_000_000) / 10_000);
  const calculatedPrice = BASE_5M + (extraUnits * RATE_PER_10K);
  return roundToHundred(calculatedPrice);
}

/**
 * 경동택배 무게 기준 요금 계산
 * @param weightKg 무게 (kg)
 * @returns 요금 (원)
 */
function calcKyungdongByWeight(weightKg: number): number {
  // 1,000kg까지는 테이블 참조 (현재는 수식만 구현)
  // 실제로는 테이블이 필요하지만, PRD에 따르면 1,000kg 초과 시 수식 적용
  if (weightKg <= 1000) {
    // 테이블 데이터가 없으므로 임시로 수식 적용
    // 실제 구현 시 테이블 조회 로직 추가 필요
  }

  const { BASE_1000KG, RATE_PER_10KG } = RATES.KYUNGDONG.WEIGHT;
  const extraUnits = Math.ceil((weightKg - 1000) / 10);
  const calculatedPrice = BASE_1000KG + (extraUnits * RATE_PER_10KG);
  return roundToHundred(calculatedPrice);
}

/**
 * 경동택배 요금 계산
 * @param volumeCm3 부피 (㎤)
 * @param weightKg 무게 (kg)
 * @param region 지역
 * @returns 요금 (원)
 */
export function calcKyungdong(
  volumeCm3: number,
  weightKg: number,
  region: Region = 'SUDO'
): number {
  const volumeFee = calcKyungdongByVolume(volumeCm3);
  const weightFee = calcKyungdongByWeight(weightKg);
  const baseFee = Math.max(volumeFee, weightFee);

  // 지역별 할증률 적용
  const regionRate = RATES.KYUNGDONG.REGION_RATES[region];
  const finalPrice = baseFee * regionRate;
  return roundToHundred(finalPrice);
}

/**
 * 입력값 유효성 검사
 * @param input 입력값
 * @returns 유효성 검사 결과
 */
function validateInput(input: QuoteInput): { valid: boolean; reason?: string } {
  const { widthCm, depthCm, heightCm, weightKg } = input;

  // 크기 검증
  if (widthCm < 0.1 || widthCm > LIMITS.MAX_DIMENSION_CM) {
    return { valid: false, reason: `가로는 0.1cm 이상 ${LIMITS.MAX_DIMENSION_CM}cm 이하여야 합니다.` };
  }
  if (depthCm < 0.1 || depthCm > LIMITS.MAX_DIMENSION_CM) {
    return { valid: false, reason: `세로는 0.1cm 이상 ${LIMITS.MAX_DIMENSION_CM}cm 이하여야 합니다.` };
  }
  if (heightCm < 0.1 || heightCm > LIMITS.MAX_DIMENSION_CM) {
    return { valid: false, reason: `높이는 0.1cm 이상 ${LIMITS.MAX_DIMENSION_CM}cm 이하여야 합니다.` };
  }

  // 부피 검증
  const volumeCm3 = widthCm * depthCm * heightCm;
  if (volumeCm3 < 1 || volumeCm3 > LIMITS.MAX_VOLUME_CM3) {
    return { valid: false, reason: `부피는 1㎤ 이상 ${LIMITS.MAX_VOLUME_CM3.toLocaleString()}㎤ 이하여야 합니다.` };
  }

  // 무게 검증
  if (weightKg < 0.01 || weightKg > LIMITS.MAX_WEIGHT_KG) {
    return { valid: false, reason: `무게는 0.01kg 이상 ${LIMITS.MAX_WEIGHT_KG.toLocaleString()}kg 이하여야 합니다.` };
  }

  return { valid: true };
}

/**
 * 국제 배송비 계산 과정 정보 생성
 */
function getBaseShippingCalculation(mode: ShippingMode, weightKg: number): { method: string; calculation: string } {
  switch (mode) {
    case 'AIR_CJ': {
      const {
        BASE_0_5KG,
        FIRST_STEP_RATE,
        SECOND_STEP_RATE,
        RATE_1_5_TO_4,
        RATE_4_TO_4_5,
        RATE_4_5_TO_5,
        RATE_AFTER_5,
        BASE_10KG,
        RATE_PER_0_5KG,
        CALIBRATION,
      } = RATES.AIR_CJ;

      if (weightKg <= 0.5) {
        return {
          method: '수식 계산 (0.5kg 이하)',
          calculation: `${BASE_0_5KG.toLocaleString()}원 (기준 가격)`,
        };
      }

      if (weightKg > 10) {
        const extraSteps = Math.ceil((weightKg - 10) / 0.5);
        const beforeRound = BASE_10KG + (extraSteps * RATE_PER_0_5KG) + CALIBRATION;
        return {
          method: '수식 계산 (10kg 초과 구간)',
          calculation: `${BASE_10KG.toLocaleString()}원 (10kg 기준) + (${extraSteps}단계 × ${RATE_PER_0_5KG.toLocaleString()}원/0.5kg) + ${CALIBRATION.toLocaleString()}원 보정 = ${beforeRound.toLocaleString()}원 → ${roundToHundred(beforeRound).toLocaleString()}원 (100원 단위 올림)`,
        };
      }

      // 0.5kg 초과 ~ 10kg 이하
      const steps = Math.ceil((weightKg - 0.5) / 0.5);
      let calculation = '';
      let calculatedPrice = BASE_0_5KG;

      if (steps === 1) {
        calculatedPrice = BASE_0_5KG + FIRST_STEP_RATE;
        calculation = `${BASE_0_5KG.toLocaleString()}원 (0.5kg 기준) + ${FIRST_STEP_RATE.toLocaleString()}원 = ${calculatedPrice.toLocaleString()}원`;
      } else if (steps === 2) {
        calculatedPrice = BASE_0_5KG + FIRST_STEP_RATE + SECOND_STEP_RATE;
        calculation = `${BASE_0_5KG.toLocaleString()}원 + ${FIRST_STEP_RATE.toLocaleString()}원 + ${SECOND_STEP_RATE.toLocaleString()}원 = ${calculatedPrice.toLocaleString()}원`;
      } else if (steps <= 7) {
        const stepsInRange = steps - 2;
        calculatedPrice = BASE_0_5KG + FIRST_STEP_RATE + SECOND_STEP_RATE + (stepsInRange * RATE_1_5_TO_4);
        calculation = `${BASE_0_5KG.toLocaleString()}원 + ${FIRST_STEP_RATE.toLocaleString()}원 + ${SECOND_STEP_RATE.toLocaleString()}원 + (${stepsInRange}단계 × ${RATE_1_5_TO_4.toLocaleString()}원) = ${calculatedPrice.toLocaleString()}원`;
      } else if (steps === 8) {
        calculatedPrice = BASE_0_5KG + FIRST_STEP_RATE + SECOND_STEP_RATE + (5 * RATE_1_5_TO_4) + RATE_4_TO_4_5;
        calculation = `${BASE_0_5KG.toLocaleString()}원 + ${FIRST_STEP_RATE.toLocaleString()}원 + ${SECOND_STEP_RATE.toLocaleString()}원 + (5 × ${RATE_1_5_TO_4.toLocaleString()}원) + ${RATE_4_TO_4_5.toLocaleString()}원 = ${calculatedPrice.toLocaleString()}원`;
      } else if (steps === 9) {
        calculatedPrice = BASE_0_5KG + FIRST_STEP_RATE + SECOND_STEP_RATE + (5 * RATE_1_5_TO_4) + RATE_4_TO_4_5 + RATE_4_5_TO_5;
        calculation = `${BASE_0_5KG.toLocaleString()}원 + ${FIRST_STEP_RATE.toLocaleString()}원 + ${SECOND_STEP_RATE.toLocaleString()}원 + (5 × ${RATE_1_5_TO_4.toLocaleString()}원) + ${RATE_4_TO_4_5.toLocaleString()}원 + ${RATE_4_5_TO_5.toLocaleString()}원 = ${calculatedPrice.toLocaleString()}원`;
      } else {
        const stepsAfter5 = steps - 9;
        calculatedPrice = BASE_0_5KG + FIRST_STEP_RATE + SECOND_STEP_RATE + (5 * RATE_1_5_TO_4) + RATE_4_TO_4_5 + RATE_4_5_TO_5 + (stepsAfter5 * RATE_AFTER_5);
        calculation = `${BASE_0_5KG.toLocaleString()}원 + ${FIRST_STEP_RATE.toLocaleString()}원 + ${SECOND_STEP_RATE.toLocaleString()}원 + (5 × ${RATE_1_5_TO_4.toLocaleString()}원) + ${RATE_4_TO_4_5.toLocaleString()}원 + ${RATE_4_5_TO_5.toLocaleString()}원 + (${stepsAfter5}단계 × ${RATE_AFTER_5.toLocaleString()}원) = ${calculatedPrice.toLocaleString()}원`;
      }

      return {
        method: '수식 계산 (0.5kg 초과 ~ 10kg 이하)',
        calculation,
      };
    }
    case 'AIR_LOTTE': {
      const {
        BASE_0_5KG,
        FIRST_STEP_RATE,
        SECOND_STEP_RATE,
        RATE_1_5_TO_4,
        RATE_4_TO_4_5,
        RATE_4_5_TO_5,
        RATE_AFTER_5,
        BASE_10KG,
        RATE_PER_0_5KG,
        CALIBRATION,
      } = RATES.AIR_LOTTE;

      if (weightKg <= 0.5) {
        return {
          method: '수식 계산 (0.5kg 이하)',
          calculation: `${BASE_0_5KG.toLocaleString()}원 (기준 가격)`,
        };
      }

      if (weightKg > 10) {
        const extraSteps = Math.ceil((weightKg - 10) / 0.5);
        const beforeRound = BASE_10KG + (extraSteps * RATE_PER_0_5KG) + CALIBRATION;
        return {
          method: '수식 계산 (10kg 초과)',
          calculation: `${BASE_10KG.toLocaleString()}원 (10kg 기준) + (${extraSteps}단계 × ${RATE_PER_0_5KG.toLocaleString()}원/0.5kg) + ${CALIBRATION.toLocaleString()}원 보정 = ${beforeRound.toLocaleString()}원 → ${roundToHundred(beforeRound).toLocaleString()}원 (100원 단위 올림)`,
        };
      }

      // 0.5kg 초과 ~ 10kg 이하: 기본 수식 적용
      const steps = Math.ceil((weightKg - 0.5) / 0.5);
      let calculationParts: string[] = [];
      let calculatedPrice = BASE_0_5KG;

      if (steps === 1) {
        calculatedPrice += FIRST_STEP_RATE;
        calculationParts.push(`${BASE_0_5KG.toLocaleString()}원 (기준) + ${FIRST_STEP_RATE.toLocaleString()}원 (0.5kg→1kg)`);
      } else if (steps === 2) {
        calculatedPrice += FIRST_STEP_RATE + SECOND_STEP_RATE;
        calculationParts.push(`${BASE_0_5KG.toLocaleString()}원 (기준) + ${FIRST_STEP_RATE.toLocaleString()}원 (0.5kg→1kg) + ${SECOND_STEP_RATE.toLocaleString()}원 (1kg→1.5kg)`);
      } else if (steps <= 7) {
        const stepsInRange = steps - 2;
        calculatedPrice += FIRST_STEP_RATE + SECOND_STEP_RATE + (stepsInRange * RATE_1_5_TO_4);
        calculationParts.push(`${BASE_0_5KG.toLocaleString()}원 (기준) + ${FIRST_STEP_RATE.toLocaleString()}원 (0.5kg→1kg) + ${SECOND_STEP_RATE.toLocaleString()}원 (1kg→1.5kg) + ${stepsInRange}단계 × ${RATE_1_5_TO_4.toLocaleString()}원/0.5kg (1.5kg→${(0.5 + steps * 0.5).toFixed(1)}kg)`);
      } else if (steps === 8) {
        calculatedPrice += FIRST_STEP_RATE + SECOND_STEP_RATE + (5 * RATE_1_5_TO_4) + RATE_4_TO_4_5;
        calculationParts.push(`${BASE_0_5KG.toLocaleString()}원 (기준) + ${FIRST_STEP_RATE.toLocaleString()}원 (0.5kg→1kg) + ${SECOND_STEP_RATE.toLocaleString()}원 (1kg→1.5kg) + 5단계 × ${RATE_1_5_TO_4.toLocaleString()}원/0.5kg (1.5kg→4kg) + ${RATE_4_TO_4_5.toLocaleString()}원 (4kg→4.5kg)`);
      } else if (steps === 9) {
        calculatedPrice += FIRST_STEP_RATE + SECOND_STEP_RATE + (5 * RATE_1_5_TO_4) + RATE_4_TO_4_5 + RATE_4_5_TO_5;
        calculationParts.push(`${BASE_0_5KG.toLocaleString()}원 (기준) + ${FIRST_STEP_RATE.toLocaleString()}원 (0.5kg→1kg) + ${SECOND_STEP_RATE.toLocaleString()}원 (1kg→1.5kg) + 5단계 × ${RATE_1_5_TO_4.toLocaleString()}원/0.5kg (1.5kg→4kg) + ${RATE_4_TO_4_5.toLocaleString()}원 (4kg→4.5kg) + ${RATE_4_5_TO_5.toLocaleString()}원 (4.5kg→5kg)`);
      } else {
        const stepsAfter5 = steps - 9;
        calculatedPrice += FIRST_STEP_RATE + SECOND_STEP_RATE + (5 * RATE_1_5_TO_4) + RATE_4_TO_4_5 + RATE_4_5_TO_5 + (stepsAfter5 * RATE_AFTER_5);
        calculationParts.push(`${BASE_0_5KG.toLocaleString()}원 (기준) + ${FIRST_STEP_RATE.toLocaleString()}원 (0.5kg→1kg) + ${SECOND_STEP_RATE.toLocaleString()}원 (1kg→1.5kg) + 5단계 × ${RATE_1_5_TO_4.toLocaleString()}원/0.5kg (1.5kg→4kg) + ${RATE_4_TO_4_5.toLocaleString()}원 (4kg→4.5kg) + ${RATE_4_5_TO_5.toLocaleString()}원 (4.5kg→5kg) + ${stepsAfter5}단계 × ${RATE_AFTER_5.toLocaleString()}원/0.5kg (5kg→${(0.5 + steps * 0.5).toFixed(1)}kg)`);
      }

      const beforeRound = calculatedPrice;
      const finalPrice = roundToHundred(beforeRound);
      return {
        method: '수식 계산 (0.5kg~10kg)',
        calculation: `${calculationParts.join(' = ')} = ${beforeRound.toLocaleString()}원 → ${finalPrice.toLocaleString()}원 (100원 단위 올림)`,
      };
    }
    case 'SEA': {
      const { BASE_0_5KG, FIRST_STEP_RATE, RATE_PER_0_5KG, BASE_100KG, RATE_OVER_100 } = RATES.SEA;

      if (weightKg <= 0.5) {
        return {
          method: '수식 계산 (0.5kg 이하)',
          calculation: `${BASE_0_5KG.toLocaleString()}원 (기준 가격)`,
        };
      }

      if (weightKg > 100) {
        const stepsOver100 = Math.ceil((weightKg - 100) / 0.5);
        const beforeRound = BASE_100KG + (stepsOver100 * RATE_OVER_100);
        return {
          method: '수식 계산 (100kg 초과 구간)',
          calculation: `${BASE_100KG.toLocaleString()}원 (100kg 기준) + (${stepsOver100}단계 × ${RATE_OVER_100.toLocaleString()}원/0.5kg) = ${beforeRound.toLocaleString()}원 → ${roundToHundred(beforeRound).toLocaleString()}원 (100원 단위 올림)`,
        };
      }

      // 0.5kg 초과 ~ 100kg 이하
      const steps = Math.ceil((weightKg - 0.5) / 0.5);
      
      if (steps === 1) {
        return {
          method: '수식 계산 (0.5kg → 1kg 구간)',
          calculation: `${BASE_0_5KG.toLocaleString()}원 (0.5kg 기준) + ${FIRST_STEP_RATE.toLocaleString()}원 (특별 구간) = ${(BASE_0_5KG + FIRST_STEP_RATE).toLocaleString()}원`,
        };
      } else {
        const beforeRound = BASE_0_5KG + FIRST_STEP_RATE + ((steps - 1) * RATE_PER_0_5KG);
        return {
          method: '수식 계산 (1kg 초과 구간)',
          calculation: `${BASE_0_5KG.toLocaleString()}원 (0.5kg 기준) + ${FIRST_STEP_RATE.toLocaleString()}원 (첫 구간) + (${steps - 1}단계 × ${RATE_PER_0_5KG.toLocaleString()}원/0.5kg) = ${beforeRound.toLocaleString()}원 → ${roundToHundred(beforeRound).toLocaleString()}원 (100원 단위 올림)`,
        };
      }
    }
  }
}

/**
 * 최종 견적 계산
 * @param input 입력 파라미터
 * @returns 계산 결과
 */
export function calculateQuote(input: QuoteInput): QuoteResult {
  // 입력값 유효성 검사
  const validation = validateInput(input);
  if (!validation.valid) {
    return {
      success: false,
      reason: validation.reason || '입력값이 유효하지 않습니다.',
    };
  }

  const { widthCm, depthCm, heightCm, weightKg, mode, region = 'SUDO' } = input;

  // 부피 및 부피중량 계산
  const volumeCm3 = widthCm * depthCm * heightCm;
  const volumeWeight = calcVolumeWeight(widthCm, depthCm, heightCm);
  const chargeableWeight = calcChargeableWeight(weightKg, volumeWeight);
  const weightUsed = chargeableWeight === weightKg ? 'actual' : 'volume';

  // 국제 배송비 계산
  let baseShipping: number;
  let baseShippingCalc: { method: string; calculation: string };
  
  switch (mode) {
    case 'AIR_CJ':
      baseShipping = calcAirCJ(chargeableWeight);
      baseShippingCalc = getBaseShippingCalculation('AIR_CJ', chargeableWeight);
      break;
    case 'AIR_LOTTE':
      baseShipping = calcAirLotte(chargeableWeight);
      baseShippingCalc = getBaseShippingCalculation('AIR_LOTTE', chargeableWeight);
      break;
    case 'SEA':
      baseShipping = calcSea(chargeableWeight);
      baseShippingCalc = getBaseShippingCalculation('SEA', chargeableWeight);
      break;
    default:
      return {
        success: false,
        reason: '지원하지 않는 배송 방식입니다.',
      };
  }

  // 2차 배송 (경동택배) 필요 여부 확인
  // 해운과 항공 모두 국내 배송비 포함
  const sumOfSides = widthCm + depthCm + heightCm;
  const needsDomesticShipping =
    (mode === 'SEA' || mode === 'AIR_CJ' || mode === 'AIR_LOTTE') &&
    (weightKg > DOMESTIC_SHIPPING_THRESHOLD.WEIGHT_KG ||
      sumOfSides > DOMESTIC_SHIPPING_THRESHOLD.SUM_OF_SIDES_CM);

  let domesticShipping = 0;
  let domesticShippingDetails: any = undefined;

  if (needsDomesticShipping) {
    domesticShipping = calcKyungdong(volumeCm3, weightKg, region);
    
    // 경동택배 계산 과정
    const volumeFee = calcKyungdongByVolume(volumeCm3);
    const weightFee = calcKyungdongByWeight(weightKg);
    const baseFee = Math.max(volumeFee, weightFee);
    const regionRate = RATES.KYUNGDONG.REGION_RATES[region];
    const beforeRound = baseFee * regionRate;
    
    const reasons: string[] = [];
    if (weightKg > DOMESTIC_SHIPPING_THRESHOLD.WEIGHT_KG) {
      reasons.push(`실중량 ${weightKg}kg > ${DOMESTIC_SHIPPING_THRESHOLD.WEIGHT_KG}kg`);
    }
    if (sumOfSides > DOMESTIC_SHIPPING_THRESHOLD.SUM_OF_SIDES_CM) {
      reasons.push(`가로+세로+높이 ${sumOfSides}cm > ${DOMESTIC_SHIPPING_THRESHOLD.SUM_OF_SIDES_CM}cm`);
    }

    domesticShippingDetails = {
      required: true,
      reason: reasons.join(', '),
      volumeFee,
      weightFee,
      baseFee,
      regionRate,
      calculation: `부피 요금: ${volumeFee.toLocaleString()}원, 무게 요금: ${weightFee.toLocaleString()}원 → MAX(${volumeFee.toLocaleString()}, ${weightFee.toLocaleString()}) = ${baseFee.toLocaleString()}원 × ${regionRate} (${region === 'SUDO' ? '수도권' : region === 'JEJU' ? '제주' : '기타 지역'} 할증) = ${beforeRound.toLocaleString()}원 → ${domesticShipping.toLocaleString()}원 (100원 단위 올림)`,
    };
  } else {
    domesticShippingDetails = {
      required: false,
    };
  }

  // 최종 요금은 100원 단위로 올림 처리
  const finalPrice = roundToHundred(baseShipping + domesticShipping);

  return {
    success: true,
    finalPrice: finalPrice,
    breakdown: {
      baseShipping,
      domesticShipping,
      extraCharge: 0, // 현재는 추가금 없음
    },
    calculationDetails: {
      input: {
        dimensions: { widthCm, depthCm, heightCm },
        weightKg,
        mode,
        region,
      },
      volume: {
        volumeCm3,
        volumeWeightKg: volumeWeight,
        actualWeightKg: weightKg,
        chargeableWeightKg: chargeableWeight,
        weightUsed,
      },
      baseShipping: {
        method: baseShippingCalc.method,
        weightUsed: chargeableWeight,
        calculation: baseShippingCalc.calculation,
      },
      domesticShipping: domesticShippingDetails,
    },
  };
}

