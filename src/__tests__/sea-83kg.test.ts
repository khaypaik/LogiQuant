import { calcSea, roundToHundred } from '@/lib/calculator';

describe('calcSea - 수식 기반 계산 검증', () => {
  it('0.5kg는 기준 가격 4,700원을 반환해야 함', () => {
    const price = calcSea(0.5);
    expect(price).toBe(4700);
  });

  it('1kg는 5,100원을 반환해야 함', () => {
    const price = calcSea(1.0);
    expect(price).toBe(5100);
  });

  it('10kg는 17,700원을 반환해야 함', () => {
    const price = calcSea(10.0);
    expect(price).toBe(17700);
  });

  it('15kg는 24,700원을 반환해야 함', () => {
    const price = calcSea(15.0);
    expect(price).toBe(24700);
  });

  it('83kg는 수식으로 계산되어야 함', () => {
    const price = calcSea(83);
    // 4700 + 400 + ((165-1) * 700) = 4700 + 400 + 114800 = 119900
    // 100원 단위 올림: 119900
    expect(price).toBe(119900);
  });

  it('83kg 초과는 수식 계산해야 함', () => {
    const price83 = calcSea(83);
    const price84 = calcSea(84);
    expect(price84).toBeGreaterThan(price83);
  });

  it('100kg는 수식 계산 결과여야 함', () => {
    const price = calcSea(100);
    // 100kg는 100kg 초과 구간이 아니므로 기본 수식 적용
    expect(price).toBeGreaterThan(100000);
  });

  it('100kg 초과는 별도 수식 적용해야 함', () => {
    const price100 = calcSea(100);
    const price150 = calcSea(150);
    expect(price150).toBeGreaterThan(price100);
  });
});

