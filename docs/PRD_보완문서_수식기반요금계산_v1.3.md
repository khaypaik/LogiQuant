# **📄 PRD 보완 문서 (개선판 v1.3)**

문서 제목: 수식 기반 요금 계산 로직 고도화 및 Agent 개발 가이드  
작성일: 2025.12.08  
버전: v1.3 (v1.2 기반 논리 보완 및 Agent 가이드 추가)

## ---

**1\. 개요 및 변경 사항 (v1.3)**

* **모호성 제거:** 구간 연결, 반올림, 에러 처리 등 개발 시 발생할 수 있는 10가지 엣지 케이스에 대한 정책 확정.  
* **Agent 가이드 추가:** AI 코딩 도구(Cursor Agent)가 문맥을 정확히 이해하고 코드를 생성할 수 있도록 System Prompt 및 Step-by-Step 가이드 수록.

## ---

**2\. 정책 결정 사항 (모범 답안 반영)**

개발 혼선을 방지하기 위해 아래와 같이 정책을 확정합니다.

1. **구간 연속성:** 테이블 구간(\~10kg)과 수식 구간(10.5kg\~)은 별도 로직으로 분리하되, **수식 구간의 시작점은 테이블 마지막 요금과 무관하게 독자적인 수식을 따른다.** (단, 급격한 역전을 막기 위해 보정 상수 활용)  
2. **금액 절삭:** 최종 계산된 모든 요금은 **100원 단위로 올림(Ceil)** 처리한다. (예: 12,340원 → 12,400원)  
3. **지역 판별:** 프론트엔드에서 우편번호 API 연동 후, 도서산간/제주/수도권 여부를 region 파라미터로 넘긴다. (초기값은 sudo로 가정)  
4. **부피 무게:** 항공/해운 모두 국제운송표준(IATA)에 따라 (가로×세로×높이)/6000을 적용하며, **실중량과 부피중량 중 큰 값**을 기준으로 운임을 계산한다.  
5. **해운 구간 처리:** 100kg 경계값은 \*\*100kg 포함(\<=)\*\*까지 기존 요율, 100.5kg부터 신규 요율을 적용한다.  
6. **경동택배 부피:** 화물 형상과 관계없이 Bounding Box(가로×세로×높이) 부피를 기준으로 한다.  
7. **2차 배송 자동 전환:** 해운 화물 중 실중량 \> 20kg 또는 가로+세로+높이 \> 160cm인 경우 자동으로 경동택배 요금을 합산한다.  
8. **Lookup Data:** 0\~10kg 구간 데이터는 constants/shipping\_rates.json 파일로 분리하여 관리한다.  
9. **에러 처리:** 범위 초과 시 단순 에러가 아닌 { workable: false, msg: "견적 문의 필요" } 형태의 객체를 반환한다.  
10. **자료형:** 모든 내부 계산은 number로 하되, 최종 리턴값은 Integer(원 단위)로 변환한다.

## ---

**3\. 상세 요금 계산 로직 (수정됨)**

### **3.1 공통 유틸리티**

* **올림 처리:** Math.ceil(amount / 100\) \* 100 (100원 단위 올림)  
* **무게 적용:** chargeableWeight \= Math.max(actualWeight, (w\*l\*h)/6000)

### **3.2 항공 운송 (CJ/롯데)**

* **0 \~ 10kg:** Lookup Table 참조 (JSON 파일)  
* **10kg 초과:**  
  * **공식:** BaseFee \+ (AdditionalSteps \* RatePerStep) \+ Calibration  
  * **CJ:** 26,650원 \+ (0.5kg당 1,430원) \+ 보정(4,900원)  
  * **롯데:** 26,200원 \+ (0.5kg당 1,400원) \+ 보정(없음)

### **3.3 해운 운송 (Diamond)**

* **0 \~ 10kg:** Lookup Table 참조  
* **10kg 초과 \~ 100kg 이하:**  
  * 기본금: 17,700원 (10kg 기준)  
  * 증가액: 0.5kg당 1,133원  
* **100kg 초과:**  
  * 기본금: 119,700원 (100kg 기준)  
  * 증가액: 0.5kg당 550원

### **3.4 경동택배 (2차 배송)**

* **비교 로직:** Max(부피 환산 요금, 무게 환산 요금) × 지역 할증(1.2 or 1.25)  
* **부피 요금:**  
  * 기준: 5,000,000㎤ (5CBM)까지 테이블 참조  
  * 초과: 303,000원 \+ (10,000㎤ 당 600원)  
* **무게 요금:**  
  * 기준: 1,000kg까지 테이블 참조  
  * 초과: 99,400원 \+ (10kg 당 800원)

## ---

**4\. Cursor Agent 개발 가이드 (New Strategy)**

이 섹션은 Cursor의 Composer(Agent) 모드에 입력할 **프롬프트 전략**을 정의합니다.

### **4.1 System Instruction (초기 설정)**

Agent에게 아래 역할을 먼저 부여하십시오.

Role: 당신은 물류 및 핀테크 도메인 전문 시니어 백엔드 개발자입니다.  
Context: TypeScript 기반의 화물 요금 계산기(calculator.ts)를 작성해야 합니다.  
Constraint:

1. 모든 금전 계산은 부동소수점 오류 방지를 위해 계산 과정에서는 정밀도를 유지하고, 최종 반환 시에만 100원 단위로 올림 처리(Math.ceil)하십시오.  
2. 하드코딩을 피하고, 요율 상수(RATES)와 계산 로직(Functions)을 엄격히 분리하십시오.  
3. 입력값이 정의된 한계(LIMITS)를 넘으면 Error를 던지는 대신 { success: false, reason: string }을 반환하여 UI가 대응하도록 하십시오.

### **4.2 Step-by-Step Prompting (바이브 코딩 순서)**

**Step 1\. 상수 및 타입 정의**

"PRD 문서의 3.1\~3.4 항목을 참조하여 types.ts와 constants.ts를 먼저 정의해줘. 특히 RATES 객체는 항공/해운/경동 각각의 BASE, STEP, RATE를 포함해야 하며, 유지보수가 쉽도록 구조화해줘."

**Step 2\. 단위 테스트 작성 (TDD)**

"로직 구현 전, PRD의 '5.6 확장된 테스트 케이스'와 '정책 결정 사항(100원 단위 올림 등)'을 반영한 Jest 테스트 파일 calculator.test.ts를 작성해줘. 경동택배의 부피/무게 비교 로직과 해운의 100kg 분기점이 핵심 검증 대상이야."

**Step 3\. 핵심 로직 구현**

"이제 테스트를 통과하는 calculator.ts의 메인 함수들을 구현해줘.

* calcAirPrice: 10kg 기준으로 테이블/수식 분기  
* calcSeaPrice: 100kg 기준으로 요율 분기  
* calcKyungdong: 부피/무게 Max값 비교 및 지역 할증 적용  
* calculateTotalQuote: 위 함수들을 조합하여 최종 견적 생성 (해운일 경우 경동택배비 자동 합산 로직 포함)"

**Step 4\. 검증 및 리팩토링**

"작성된 코드가 테스트 케이스 3번(해운 150kg \+ 경동 이관)을 정확히 통과하는지 확인하고, 중복된 수식 계산 로직(예: step 계산)이 있다면 별도 유틸리티 함수로 분리해줘."

## ---

**5\. 데이터 구조 예시 (TypeScript)**

TypeScript

// types.ts  
export type ShippingMode \= 'AIR\_CJ' | 'AIR\_LOTTE' | 'SEA';  
export type Region \= 'SUDO' | 'OTHER' | 'JEJU';

export interface QuoteInput {  
  widthCm: number;  
  depthCm: number;  
  heightCm: number;  
  weightKg: number;  
  mode: ShippingMode;  
  region?: Region; // Default 'SUDO'  
}

export interface QuoteResult {  
  success: boolean;  
  finalPrice: number; // 100원 단위 올림 완료된 최종가  
  breakdown: {  
    baseShipping: number; // 국제 배송비  
    domesticShipping: number; // 국내(경동) 배송비  
    extraCharge: number; // 도서산간 등 추가금  
  };  
  warnings?: string\[\]; // "범위 초과로 인해 견적 문의 필요" 등  
}

