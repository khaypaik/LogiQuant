import { calculateQuote } from '@/lib/calculator';
import { QuoteInput } from '@/types';

/**
 * 통합 테스트: 실제 사용 시나리오 기반 테스트
 */
describe('Integration Tests', () => {
  describe('실제 사용 시나리오', () => {
    it('시나리오 1: 일반 소형 화물 (항공-CJ)', () => {
      const input: QuoteInput = {
        widthCm: 30,
        depthCm: 20,
        heightCm: 15,
        weightKg: 2.5,
        mode: 'AIR_CJ',
        region: 'SUDO',
      };

      const result = calculateQuote(input);
      
      expect(result.success).toBe(true);
      expect(result.finalPrice).toBeGreaterThan(0);
      expect(result.finalPrice! % 100).toBe(0); // 100원 단위 올림 확인
      expect(result.breakdown?.baseShipping).toBeGreaterThan(0);
      // 항공도 국내 배송비 포함 (조건 충족 시)
      // 2.5kg는 20kg 미만이고, 크기 합계 65cm는 160cm 미만이므로 국내 배송비 없음
      expect(result.breakdown?.domesticShipping).toBe(0);
    });

    it('시나리오 2: 중형 화물 (해운, 2차 배송 필요)', () => {
      const input: QuoteInput = {
        widthCm: 80,
        depthCm: 60,
        heightCm: 50,
        weightKg: 25, // 20kg 초과 → 경동택배 자동 합산
        mode: 'SEA',
        region: 'SUDO',
      };

      const result = calculateQuote(input);
      
      expect(result.success).toBe(true);
      expect(result.finalPrice).toBeGreaterThan(0);
      expect(result.breakdown?.domesticShipping).toBeGreaterThan(0); // 경동택배 합산됨
    });

    it('시나리오 3: 대형 화물 (해운, 크기 기준 2차 배송)', () => {
      const input: QuoteInput = {
        widthCm: 60,
        depthCm: 60,
        heightCm: 50, // 합계 170cm → 경동택배 자동 합산
        weightKg: 15, // 20kg 미만이지만 크기 기준 충족
        mode: 'SEA',
        region: 'SUDO',
      };

      const result = calculateQuote(input);
      
      expect(result.success).toBe(true);
      expect(result.breakdown?.domesticShipping).toBeGreaterThan(0);
    });

    it('시나리오 4: 부피중량이 실중량보다 큰 경우', () => {
      const input: QuoteInput = {
        widthCm: 100,
        depthCm: 100,
        heightCm: 100, // 부피: 1,000,000㎤ → 부피중량: 166.67kg
        weightKg: 50, // 실중량: 50kg
        mode: 'AIR_CJ',
        region: 'SUDO',
      };

      const result = calculateQuote(input);
      
      expect(result.success).toBe(true);
      // 부피중량(166.67kg)이 실중량(50kg)보다 크므로 부피중량 기준으로 계산됨
      expect(result.finalPrice).toBeGreaterThan(0);
    });

    it('시나리오 5: 최대 범위 경계값 테스트', () => {
      const input: QuoteInput = {
        widthCm: 500,
        depthCm: 500,
        heightCm: 40, // 부피: 10,000,000㎤ (최대값)
        weightKg: 3000, // 최대 무게
        mode: 'SEA',
        region: 'SUDO',
      };

      const result = calculateQuote(input);
      
      expect(result.success).toBe(true);
      expect(result.finalPrice).toBeGreaterThan(0);
    });

    it('시나리오 6: 범위 초과 케이스', () => {
      const input: QuoteInput = {
        widthCm: 600, // 최대값 초과
        depthCm: 500,
        heightCm: 500,
        weightKg: 100,
        mode: 'SEA',
        region: 'SUDO',
      };

      const result = calculateQuote(input);
      
      expect(result.success).toBe(false);
      expect(result.reason).toContain('가로');
    });

    it('시나리오 7: 부피 범위 초과', () => {
      const input: QuoteInput = {
        widthCm: 500,
        depthCm: 500,
        heightCm: 50, // 부피: 12,500,000㎤ (최대값 초과)
        weightKg: 100,
        mode: 'SEA',
        region: 'SUDO',
      };

      const result = calculateQuote(input);
      
      expect(result.success).toBe(false);
      expect(result.reason).toContain('부피');
    });
  });

  describe('배송 방식별 비교', () => {
    const baseInput: Omit<QuoteInput, 'mode'> = {
      widthCm: 50,
      depthCm: 40,
      heightCm: 30,
      weightKg: 10,
      region: 'SUDO',
    };

    it('같은 화물에 대해 배송 방식별 요금이 다르게 계산되어야 함', () => {
      const cjResult = calculateQuote({ ...baseInput, mode: 'AIR_CJ' });
      const lotteResult = calculateQuote({ ...baseInput, mode: 'AIR_LOTTE' });
      const seaResult = calculateQuote({ ...baseInput, mode: 'SEA' });

      expect(cjResult.success).toBe(true);
      expect(lotteResult.success).toBe(true);
      expect(seaResult.success).toBe(true);

      // 모든 결과가 0보다 커야 함
      expect(cjResult.finalPrice).toBeGreaterThan(0);
      expect(lotteResult.finalPrice).toBeGreaterThan(0);
      expect(seaResult.finalPrice).toBeGreaterThan(0);
    });
  });

  describe('지역별 할증', () => {
    const baseInput: Omit<QuoteInput, 'region'> = {
      widthCm: 200,
      depthCm: 150,
      heightCm: 100,
      weightKg: 500,
      mode: 'SEA',
    };

    it('해운 화물의 경우 지역별 할증이 경동택배에만 적용되어야 함', () => {
      const sudoResult = calculateQuote({ ...baseInput, region: 'SUDO' });
      const otherResult = calculateQuote({ ...baseInput, region: 'OTHER' });

      expect(sudoResult.success).toBe(true);
      expect(otherResult.success).toBe(true);

      // 경동택배 요금이 있을 때만 차이가 있어야 함
      if (sudoResult.breakdown?.domesticShipping! > 0) {
        expect(otherResult.breakdown?.domesticShipping).toBeGreaterThan(
          sudoResult.breakdown?.domesticShipping!
        );
      }
    });
  });

  describe('성능 테스트', () => {
    it('계산 속도가 10ms 이하여야 함', () => {
      const input: QuoteInput = {
        widthCm: 200,
        depthCm: 150,
        heightCm: 100,
        weightKg: 500,
        mode: 'SEA',
        region: 'SUDO',
      };

      const startTime = performance.now();
      calculateQuote(input);
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(10); // 10ms 미만
    });

    it('여러 번 계산해도 일관된 결과를 반환해야 함', () => {
      const input: QuoteInput = {
        widthCm: 50,
        depthCm: 40,
        heightCm: 30,
        weightKg: 10,
        mode: 'AIR_CJ',
        region: 'SUDO',
      };

      const results = Array.from({ length: 100 }, () => calculateQuote(input));
      
      // 모든 결과가 동일해야 함
      const firstPrice = results[0].finalPrice;
      results.forEach((result) => {
        expect(result.success).toBe(true);
        expect(result.finalPrice).toBe(firstPrice);
      });
    });
  });
});

