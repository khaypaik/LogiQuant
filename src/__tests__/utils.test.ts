import {
  roundToHundred,
  calcVolumeWeight,
  calcChargeableWeight,
} from '@/lib/utils';

describe('utils', () => {
  describe('roundToHundred', () => {
    it('100원 단위로 올림 처리해야 함', () => {
      expect(roundToHundred(12340)).toBe(12400);
      expect(roundToHundred(12300)).toBe(12300);
      expect(roundToHundred(12301)).toBe(12400);
      expect(roundToHundred(12399)).toBe(12400);
    });

    it('소수점이 있어도 올림 처리해야 함', () => {
      expect(roundToHundred(12345.67)).toBe(12400);
    });
  });

  describe('calcVolumeWeight', () => {
    it('부피중량을 정확히 계산해야 함', () => {
      // 50×40×30cm = 60,000㎤ → 10kg
      expect(calcVolumeWeight(50, 40, 30)).toBe(10);
      
      // 200×150×100cm = 3,000,000㎤ → 500kg
      expect(calcVolumeWeight(200, 150, 100)).toBe(500);
    });
  });

  describe('calcChargeableWeight', () => {
    it('실중량과 부피중량 중 큰 값을 반환해야 함', () => {
      expect(calcChargeableWeight(150, 10)).toBe(150);
      expect(calcChargeableWeight(10, 150)).toBe(150);
      expect(calcChargeableWeight(100, 100)).toBe(100);
    });
  });
});

