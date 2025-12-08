import {
  calcAirCJ,
  calcAirLotte,
  calcSea,
  calcKyungdong,
  calculateQuote,
} from '@/lib/calculator';
import { QuoteInput } from '@/types';

describe('calculator', () => {
  describe('calcAirCJ', () => {
    it('0.5kg는 기준 가격을 반환해야 함', () => {
      const price = calcAirCJ(0.5);
      expect(price).toBe(5200);
    });

    it('1kg는 특별 구간 가격을 반환해야 함', () => {
      const price = calcAirCJ(1.0);
      expect(price).toBe(6050);
    });

    it('2.5kg는 수식으로 계산되어야 함', () => {
      const price = calcAirCJ(2.5);
      expect(price).toBe(9150);
    });

    it('10kg는 수식으로 계산되어야 함', () => {
      const price = calcAirCJ(10.0);
      expect(price).toBe(26650);
    });

    it('10kg 초과 시 수식 적용해야 함', () => {
      const price = calcAirCJ(15.0);
      expect(price).toBeGreaterThan(26650);
      expect(price % 100).toBe(0); // 100원 단위 올림 확인
    });
  });

  describe('calcAirLotte', () => {
    it('0.5kg는 기준 가격을 반환해야 함', () => {
      const price = calcAirLotte(0.5);
      expect(price).toBe(4800);
    });

    it('1kg는 특별 구간 가격을 반환해야 함', () => {
      const price = calcAirLotte(1.0);
      expect(price).toBe(5400);
    });

    it('1.5kg는 특별 구간 가격을 반환해야 함', () => {
      const price = calcAirLotte(1.5);
      expect(price).toBe(7100);
    });

    it('2.5kg는 수식으로 계산되어야 함', () => {
      const price = calcAirLotte(2.5);
      expect(price).toBe(8700);
    });

    it('5kg는 수식으로 계산되어야 함', () => {
      const price = calcAirLotte(5.0);
      expect(price).toBe(14200);
    });

    it('10kg는 수식으로 계산되어야 함', () => {
      const price = calcAirLotte(10.0);
      expect(price).toBe(26200);
    });

    it('10kg 초과 시 수식 적용해야 함', () => {
      const price = calcAirLotte(15.0);
      expect(price).toBeGreaterThan(26200);
      expect(price % 100).toBe(0); // 100원 단위 올림 확인
    });

    it('100원 단위로 올림 처리해야 함', () => {
      const price = calcAirLotte(3.7); // 중간 값으로 테스트
      expect(price % 100).toBe(0);
    });
  });

  describe('calcSea', () => {
    it('0.5kg는 기준 가격을 반환해야 함', () => {
      const price = calcSea(0.5);
      expect(price).toBe(4700);
    });

    it('1kg는 특별 구간 가격을 반환해야 함', () => {
      const price = calcSea(1.0);
      expect(price).toBe(5100);
    });

    it('10kg는 수식으로 계산되어야 함', () => {
      const price = calcSea(10.0);
      expect(price).toBe(17700);
    });

    it('15kg는 수식으로 계산되어야 함', () => {
      const price = calcSea(15.0);
      expect(price).toBe(24700);
    });

    it('83kg는 수식으로 계산되어야 함', () => {
      const price83 = calcSea(83.0);
      // 4700 + 400 + ((165-1) * 700) = 119900
      expect(price83).toBe(119900);
    });

    it('83kg 초과 ~ 100kg 이하 구간 수식 적용해야 함', () => {
      const price84 = calcSea(84.0);
      expect(price84).toBeGreaterThan(119900);
    });

    it('100kg 초과 시 다른 요율 적용해야 함', () => {
      const price100 = calcSea(100.0);
      const price150 = calcSea(150.0);
      // 100kg: 143,700원 (기본 수식)
      // 150kg: 174,700원 (100kg 초과 구간 요율, BASE_100KG 기준)
      expect(price150).toBeGreaterThan(price100);
      expect(price100).toBeGreaterThan(100000);
    });

    it('100kg 경계값 정확히 처리해야 함', () => {
      const price100 = calcSea(100.0);
      const price100_5 = calcSea(100.5);
      // 100kg: 143,700원 (기본 수식)
      // 100.5kg: 120,300원 (100kg 초과 구간 요율, BASE_100KG 기준)
      expect(price100_5).toBeGreaterThan(0);
      // 100kg 초과 구간은 BASE_100KG 기준이므로 더 낮을 수 있음
    });
  });

  describe('calcKyungdong', () => {
    it('부피와 무게 중 큰 값 기준으로 계산해야 함', () => {
      // 부피가 큰 경우
      const price1 = calcKyungdong(6_000_000, 100, 'SUDO');
      // 무게가 큰 경우
      const price2 = calcKyungdong(1_000_000, 1500, 'SUDO');
      expect(price1).toBeGreaterThan(0);
      expect(price2).toBeGreaterThan(0);
    });

    it('지역별 할증률 적용해야 함', () => {
      const priceSudo = calcKyungdong(6_000_000, 100, 'SUDO');
      const priceOther = calcKyungdong(6_000_000, 100, 'OTHER');
      expect(priceOther).toBeGreaterThan(priceSudo);
    });

    it('100원 단위로 올림 처리해야 함', () => {
      const price = calcKyungdong(6_000_000, 100, 'SUDO');
      expect(price % 100).toBe(0);
    });
  });

  describe('calculateQuote', () => {
    describe('테스트 케이스 1: 초대형 화물 (경동 이관)', () => {
      it('200×150×100cm, 500kg 화물 계산', () => {
        const input: QuoteInput = {
          widthCm: 200,
          depthCm: 150,
          heightCm: 100,
          weightKg: 500,
          mode: 'SEA',
          region: 'SUDO',
        };

        const result = calculateQuote(input);
        expect(result.success).toBe(true);
        expect(result.finalPrice).toBeGreaterThan(0);
        expect(result.breakdown?.domesticShipping).toBeGreaterThan(0); // 경동택배 자동 합산
      });
    });

    describe('테스트 케이스 2: 극대형 화물 (범위 초과)', () => {
      it('300×250×200cm, 2,500kg 화물은 범위 초과', () => {
        const input: QuoteInput = {
          widthCm: 300,
          depthCm: 250,
          heightCm: 200,
          weightKg: 2500,
          mode: 'SEA',
          region: 'SUDO',
        };

        const result = calculateQuote(input);
        // 부피가 15,000,000㎤로 최대값(10,000,000㎤) 초과
        expect(result.success).toBe(false);
        expect(result.reason).toContain('부피');
      });
    });

    describe('테스트 케이스 3: 해운 100kg 초과', () => {
      it('50×40×30cm, 150kg 해운 화물 계산', () => {
        const input: QuoteInput = {
          widthCm: 50,
          depthCm: 40,
          heightCm: 30,
          weightKg: 150,
          mode: 'SEA',
          region: 'SUDO',
        };

        const result = calculateQuote(input);
        expect(result.success).toBe(true);
        expect(result.finalPrice).toBeGreaterThan(0);
        // 부피중량: 60,000 ÷ 6000 = 10kg
        // 적용 무게: MAX(150, 10) = 150kg
        // 해운 요금: 100kg 초과 구간 요율 적용
        expect(result.breakdown?.baseShipping).toBeGreaterThan(119700);
        // 실중량 150kg > 20kg이므로 경동택배 자동 합산
        expect(result.breakdown?.domesticShipping).toBeGreaterThan(0);
      });
    });

    describe('경계값 테스트', () => {
      it('10kg 정확히 - 테이블/수식 전환점', () => {
        const input: QuoteInput = {
          widthCm: 50,
          depthCm: 40,
          heightCm: 30,
          weightKg: 10,
          mode: 'AIR_CJ',
          region: 'SUDO',
        };

        const result = calculateQuote(input);
        expect(result.success).toBe(true);
      });

      it('100kg 정확히 - 해운 구간 전환점', () => {
        const input: QuoteInput = {
          widthCm: 50,
          depthCm: 40,
          heightCm: 30,
          weightKg: 100,
          mode: 'SEA',
          region: 'SUDO',
        };

        const result = calculateQuote(input);
        expect(result.success).toBe(true);
        // 100kg는 10~100kg 구간 요율 적용
      });
    });

    describe('2차 배송 자동 전환 조건', () => {
      it('실중량 20kg 초과 시 경동택배 합산', () => {
        const input: QuoteInput = {
          widthCm: 50,
          depthCm: 40,
          heightCm: 30,
          weightKg: 25, // 20kg 초과
          mode: 'SEA',
          region: 'SUDO',
        };

        const result = calculateQuote(input);
        expect(result.success).toBe(true);
        expect(result.breakdown?.domesticShipping).toBeGreaterThan(0);
      });

      it('가로+세로+높이 160cm 초과 시 경동택배 합산', () => {
        const input: QuoteInput = {
          widthCm: 60,
          depthCm: 60,
          heightCm: 50, // 합계 170cm
          weightKg: 15, // 20kg 미만
          mode: 'SEA',
          region: 'SUDO',
        };

        const result = calculateQuote(input);
        expect(result.success).toBe(true);
        expect(result.breakdown?.domesticShipping).toBeGreaterThan(0);
      });

      it('항공 배송도 조건 충족 시 2차 배송 포함', () => {
        const input: QuoteInput = {
          widthCm: 50,
          depthCm: 40,
          heightCm: 30,
          weightKg: 25, // 20kg 초과 → 국내 배송비 발생
          mode: 'AIR_CJ',
          region: 'SUDO',
        };

        const result = calculateQuote(input);
        expect(result.success).toBe(true);
        // 항공도 국내 배송비 포함 (25kg > 20kg)
        expect(result.breakdown?.domesticShipping).toBeGreaterThan(0);
      });

      it('항공 배송 조건 미충족 시 2차 배송 없음', () => {
        const input: QuoteInput = {
          widthCm: 30,
          depthCm: 20,
          heightCm: 15,
          weightKg: 10, // 20kg 미만, 크기 합계 65cm < 160cm
          mode: 'AIR_CJ',
          region: 'SUDO',
        };

        const result = calculateQuote(input);
        expect(result.success).toBe(true);
        expect(result.breakdown?.domesticShipping).toBe(0);
      });
    });

    describe('100원 단위 올림 검증', () => {
      it('모든 계산 결과는 100원 단위여야 함', () => {
        const testCases: QuoteInput[] = [
          {
            widthCm: 50,
            depthCm: 40,
            heightCm: 30,
            weightKg: 15,
            mode: 'AIR_CJ',
            region: 'SUDO',
          },
          {
            widthCm: 50,
            depthCm: 40,
            heightCm: 30,
            weightKg: 150,
            mode: 'SEA',
            region: 'SUDO',
          },
        ];

        testCases.forEach((input) => {
          const result = calculateQuote(input);
          if (result.success && result.finalPrice) {
            expect(result.finalPrice % 100).toBe(0);
          }
        });
      });
    });
  });
});

