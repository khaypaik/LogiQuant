/**
 * 금액을 100원 단위로 올림 처리
 * @param amount 원 단위 금액
 * @returns 100원 단위로 올림된 금액
 */
export function roundToHundred(amount: number): number {
  return Math.ceil(amount / 100) * 100;
}

/**
 * 부피중량 계산 (IATA 표준: 가로×세로×높이 ÷ 6000)
 * @param widthCm 가로 (cm)
 * @param depthCm 세로 (cm)
 * @param heightCm 높이 (cm)
 * @returns 부피중량 (kg)
 */
export function calcVolumeWeight(
  widthCm: number,
  depthCm: number,
  heightCm: number
): number {
  const volumeCm3 = widthCm * depthCm * heightCm;
  return volumeCm3 / 6000;
}

/**
 * 실중량과 부피중량 중 큰 값을 반환 (적용 무게)
 * @param actualWeight 실중량 (kg)
 * @param volumeWeight 부피중량 (kg)
 * @returns 적용 무게 (kg)
 */
export function calcChargeableWeight(
  actualWeight: number,
  volumeWeight: number
): number {
  return Math.max(actualWeight, volumeWeight);
}

