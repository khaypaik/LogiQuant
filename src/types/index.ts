/**
 * 배송 방식 타입
 */
export type ShippingMode = 'AIR_CJ' | 'AIR_LOTTE' | 'SEA';

/**
 * 지역 타입
 */
export type Region = 'SUDO' | 'OTHER' | 'JEJU';

/**
 * 견적 입력 파라미터 인터페이스
 */
export interface QuoteInput {
  widthCm: number;      // 가로 (cm)
  depthCm: number;      // 세로 (cm)
  heightCm: number;     // 높이 (cm)
  weightKg: number;     // 실중량 (kg)
  mode: ShippingMode;   // 배송 방식
  region?: Region;      // 지역 (기본값: 'SUDO')
}

/**
 * 견적 계산 결과 인터페이스
 */
export interface QuoteResult {
  success: boolean;                    // 계산 성공 여부
  finalPrice?: number;                 // 최종 요금 (100원 단위 올림 완료)
  breakdown?: {                        // 상세 내역
    baseShipping: number;              // 국제 배송비
    domesticShipping: number;          // 국내(경동) 배송비
    extraCharge: number;               // 도서산간 등 추가금
  };
  calculationDetails?: {               // 계산 과정 상세 정보
    input: {                           // 입력 정보
      dimensions: { widthCm: number; depthCm: number; heightCm: number };
      weightKg: number;
      mode: ShippingMode;
      region: Region;
    };
    volume: {                          // 부피 정보
      volumeCm3: number;
      volumeWeightKg: number;
      actualWeightKg: number;
      chargeableWeightKg: number;
      weightUsed: 'actual' | 'volume'; // 어떤 무게가 적용되었는지
    };
    baseShipping: {                    // 국제 배송비 계산 과정
      method: string;                  // 계산 방법 (테이블/수식)
      weightUsed: number;
      calculation: string;             // 계산 과정 설명
    };
    domesticShipping?: {               // 국내 배송비 계산 과정 (있는 경우)
      required: boolean;
      reason?: string;                 // 필요한 이유
      volumeFee?: number;
      weightFee?: number;
      baseFee?: number;
      regionRate?: number;
      calculation?: string;
    };
  };
  warnings?: string[];                // 경고 메시지
  reason?: string;                     // 실패 시 사유
}

/**
 * 요금표 데이터 구조
 */
export interface RateTableEntry {
  maxWeight: number;  // 최대 무게 (kg)
  price: number;      // 요금 (원)
}

/**
 * 요금표 데이터 타입
 */
export interface ShippingRates {
  AIR_CJ: RateTableEntry[];
  AIR_LOTTE: RateTableEntry[];
  SEA: RateTableEntry[];
}

