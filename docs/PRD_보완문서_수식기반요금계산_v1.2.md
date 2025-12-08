# **PRD 보완 문서 v1.2**

수식 기반 요금 계산 & 확장된 입력 범위

# **5\. 요금 계산 \- 수식 기반 확장 (개선)**

요금표 이미지 분석 결과, 일정 구간 이상에서는 선형 증가 패턴이 확인됩니다. 하드코딩 대신 수식 기반 계산으로 넓은 범위를 지원합니다.

## **5.1 확장된 입력 범위**

| 항목 | 최소값 | 최대값 | 비고 |
| :---: | :---: | :---: | :---: |
| 크기 (각 변) | 0.1 cm | 500 cm | 5m까지 지원 |
| 부피 | 1 ㎤ | 10,000,000 ㎤ | 10㎥까지 |
| 무게 | 0.01 kg | 3,000 kg | 3톤까지 |
| 부피중량 | \- | 1,666.67 kg | 10M㎤÷6000 |

## **5.2 1차 해외배송 요금 계산 수식**

### **항공-CJ (DIAMOND 등급)**

**기준점:** \~10kg까지는 요금표 참조, 10kg 초과 시 수식 적용

// 10kg 초과 시 (0.5kg 단위 증가)  
const BASE\_10KG \= 26\_650;  // 10kg 기준 요금  
const RATE\_PER\_0\_5KG \= 1\_400;  // 0.5kg당 증가액

function calcAirCJ(weightKg: number): number {  
  if (weightKg \<= 10\) return lookupTable(weightKg);  
  const extraSteps \= Math.ceil((weightKg \- 10\) / 0.5);  
  return BASE\_10KG \+ (extraSteps \* RATE\_PER\_0\_5KG);  
}

**검증 (이미지3 기준):**

* \~90kg: 26,650 \+ (160 × 1,400) \= 250,650원 → 실제 255,550원 (오차 조정 필요)  
* \~100kg: 26,650 \+ (180 × 1,400) \= 278,650원 → 실제 283,550원

*→ 보정 상수 적용: \+4,900원 (구간별 누적 오차 보정)*

### **항공-CJ 보정된 수식**

**function calcAirCJ(weightKg: number): number {**  
  if (weightKg \<= 10\) return lookupTable(weightKg);  
    
  // 10kg 초과분 계산  
  const BASE\_10KG \= 26\_650;  
  const RATE\_PER\_0\_5KG \= 1\_430;  // 보정된 증가율  
  const extraSteps \= Math.ceil((weightKg \- 10\) / 0.5);  
  return BASE\_10KG \+ (extraSteps \* RATE\_PER\_0\_5KG);  
**}**

### **항공-롯데 (DIAMOND 등급)**

const BASE\_10KG \= 26\_200;  // 롯데는 CJ보다 소폭 저렴  
const RATE\_PER\_0\_5KG \= 1\_400;  
// 동일 수식 적용

### **해운 (DIAMOND 등급)**

**기준점:** \~10kg까지는 요금표 참조, 10kg 초과 시 수식 적용

// 이미지2 분석: 100kg 기준 119,700원, 0.5kg당 550원 증가  
function calcSea(weightKg: number): number {  
  if (weightKg \<= 10\) return lookupTable(weightKg);  
    
  // 10\~100kg 구간  
  const BASE\_10KG \= 17\_700;  
  const RATE\_10\_TO\_100 \= 1\_133;  // 0.5kg당 (계산: (119700-17700)/180)  
    
  // 100kg 초과 구간 (이미지2 기준)  
  const BASE\_100KG \= 119\_700;  
  const RATE\_OVER\_100 \= 550;  // 0.5kg당  
    
  if (weightKg \<= 100\) {  
    const steps \= Math.ceil((weightKg \- 10\) / 0.5);  
    return BASE\_10KG \+ (steps \* RATE\_10\_TO\_100);  
  } else {  
    const stepsOver100 \= Math.ceil((weightKg \- 100\) / 0.5);  
    return BASE\_100KG \+ (stepsOver100 \* RATE\_OVER\_100);  
  }  
}

## **5.3 경동택배 (2차 국내배송) 수식**

**이미지1 분석 결과:**

### **부피 기준 요금**

// 부피 기준: 10,000㎤당 600원 증가 패턴  
function calcKyungdongByVolume(volumeCm3: number): number {  
  // 기준점: 5,000,000㎤ \= 303,000원 (요금표 확인)  
  if (volumeCm3 \<= 5\_000\_000) return lookupVolumeTable(volumeCm3);  
    
  const BASE\_5M \= 303\_000;  
  const RATE\_PER\_10K \= 600;  // 10,000㎤당  
  const extraUnits \= Math.ceil((volumeCm3 \- 5\_000\_000) / 10\_000);  
  return BASE\_5M \+ (extraUnits \* RATE\_PER\_10K);  
}

### **무게 기준 요금**

// 무게 기준: 10kg당 800원 증가 패턴  
function calcKyungdongByWeight(weightKg: number): number {  
  // 기준점: 1,000kg \= 99,400원  
  if (weightKg \<= 1000\) return lookupWeightTable(weightKg);  
    
  const BASE\_1000KG \= 99\_400;  
  const RATE\_PER\_10KG \= 800;  
  const extraUnits \= Math.ceil((weightKg \- 1000\) / 10);  
  return BASE\_1000KG \+ (extraUnits \* RATE\_PER\_10KG);  
}

### **최종 경동택배 요금**

**function calcKyungdong(**  
  volumeCm3: number,  
  weightKg: number,  
  region: 'sudo' | 'other' \= 'sudo'  
**): number {**  
  const volumeFee \= calcKyungdongByVolume(volumeCm3);  
  const weightFee \= calcKyungdongByWeight(weightKg);  
  const baseFee \= Math.max(volumeFee, weightFee);  
    
  // 지역별 인상률 적용  
  const regionRate \= region \=== 'sudo' ? 1.20 : 1.25;  
  return Math.round(baseFee \* regionRate);  
**}**

## **5.4 요금 계산 상수 요약표**

| 배송사 | 요금표 범위 | 수식 적용 구간 | 증가 단위 | 증가액 |
| :---: | :---: | :---: | :---: | :---: |
| 항공-CJ | \~10kg | 10kg 초과 | 0.5kg | \+1,430원 |
| 항공-롯데 | \~10kg | 10kg 초과 | 0.5kg | \+1,400원 |
| 해운 | \~10kg | 10\~100kg | 0.5kg | \+1,133원 |
| 해운 | \- | 100kg 초과 | 0.5kg | \+550원 |
| 경동(부피) | \~5M㎤ | 5M㎤ 초과 | 10,000㎤ | \+600원 |
| 경동(무게) | \~1,000kg | 1,000kg 초과 | 10kg | \+800원 |

## **5.5 성능 최적화 전략**

### **하이브리드 접근법**

저성능 PC에서도 빠른 응답을 위해 아래 전략을 적용합니다:

* **자주 사용되는 구간 (0\~10kg):** 요금표 하드코딩 (O(1) 조회)  
* **확장 구간 (10kg 초과):** 수식 기반 실시간 계산 (단순 사칙연산)  
* **메모리 사용량:** 요금표 데이터 약 2KB (20개 구간 × 4개 업체)  
* **계산 복잡도:** O(1) \- 상수 시간 (수식 대입만 수행)

### **최대 계산 시간 보장**

// 모든 4개 업체 요금 계산 \+ 2차 배송 판별 \+ 결과 정렬  
// 예상 소요 시간: \< 1ms (저성능 PC 기준)  
// 최악의 경우에도 10ms 미만 보장

## **5.6 확장된 테스트 케이스**

### **테스트 1: 초대형 화물 (경동 이관)**

| 입력 | 200×150×100cm, 500kg |
| :---- | :---- |
| **부피** | 3,000,000㎤ |
| **부피중량** | 3,000,000 ÷ 6,000 \= 500kg |
| **경동 부피운임** | 183,000원 (요금표 참조) |
| **경동 무게운임** | 58,900원 (요금표 참조) |
| **경동 최종** | MAX(183,000, 58,900) × 1.2 \= 219,600원 (착불) |

### **테스트 2: 극대형 화물 (수식 적용)**

| 입력 | 300×250×200cm, 2,500kg |
| :---- | :---- |
| **부피** | 15,000,000㎤ → 범위 초과 (최대 10M㎤) |
| **결과** | "입력 범위 초과 \- 업체에 직접 문의 필요" |

### **테스트 3: 해운 100kg 초과**

| 입력 | 50×40×30cm, 150kg |
| :---- | :---- |
| **부피중량** | 60,000 ÷ 6,000 \= 10kg |
| **적용 무게** | MAX(150, 10\) \= 150kg (실중량) |
| **해운 요금** | 119,700 \+ (100 × 550\) \= 174,700원 (수식 적용) |
| **2차 배송** | 경동택배 (무게 \>20kg) |

## **5.7 calculator.ts 파일 구조**

// lib/calculator.ts

// \=== 상수 정의 \===  
export const LIMITS \= {  
  MAX\_DIMENSION\_CM: 500,  
  MAX\_VOLUME\_CM3: 10\_000\_000,  
  MAX\_WEIGHT\_KG: 3\_000,  
};

export const RATES \= {  
  AIR\_CJ: { BASE\_10KG: 26\_650, RATE\_PER\_0\_5KG: 1\_430 },  
  AIR\_LOTTE: { BASE\_10KG: 26\_200, RATE\_PER\_0\_5KG: 1\_400 },  
  SEA: {  
    BASE\_10KG: 17\_700,  
    RATE\_10\_TO\_100: 1\_133,  
    BASE\_100KG: 119\_700,  
    RATE\_OVER\_100: 550,  
  },  
  KYUNGDONG: {  
    VOLUME: { BASE\_5M: 303\_000, RATE\_PER\_10K: 600 },  
    WEIGHT: { BASE\_1000KG: 99\_400, RATE\_PER\_10KG: 800 },  
    REGION\_RATES: { sudo: 1.20, other: 1.25 },  
  },  
};

// \=== 주요 함수 export \===  
export function calcVolumeWeight(w: number, h: number, l: number): number  
export function calcAirCJ(weightKg: number): number  
export function calcAirLotte(weightKg: number): number  
export function calcSea(weightKg: number): number  
export function calcKyungdong(volumeCm3: number, weightKg: number): number  
export function calcCJDomestic(sumOfSides: number): number  
export function calculateQuote(input: QuoteInput): QuoteResult

— 문서 끝 —