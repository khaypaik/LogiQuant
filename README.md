# 화물 요금 계산기 웹앱

수식 기반 화물 요금 계산 시스템입니다. 항공(CJ/롯데), 해운, 경동택배 요금을 계산하고, 확장된 입력 범위를 지원합니다.

## 주요 기능

- **다양한 배송 방식 지원**
  - 항공 - CJ (DIAMOND 등급)
  - 항공 - 롯데 (DIAMOND 등급)
  - 해운 (DIAMOND 등급)
  - 경동택배 (2차 국내배송)

- **확장된 입력 범위**
  - 크기 (각 변): 0.1cm ~ 500cm
  - 부피: 1㎤ ~ 10,000,000㎤ (10㎥)
  - 무게: 0.01kg ~ 3,000kg (3톤)

- **수식 기반 계산**
  - 0~10kg: 요금표 조회 (O(1))
  - 10kg 초과: 수식 기반 실시간 계산
  - 100원 단위 올림 처리

- **자동 2차 배송 판별**
  - 해운 화물 중 실중량 >20kg 또는 가로+세로+높이 >160cm 시 경동택배 자동 합산

## 기술 스택

- **프레임워크**: Next.js 16+ (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS 3.x
- **테스팅**: Jest + React Testing Library

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
npm run build
npm start
```

### 테스트 실행

```bash
npm test
```

## 프로젝트 구조

```
LogiQuant/
├── docs/                          # PRD 문서
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx              # 메인 계산 페이지
│   │   └── globals.css           # Tailwind CSS
│   ├── components/                # React 컴포넌트
│   │   ├── QuoteForm.tsx         # 입력 폼 컴포넌트
│   │   └── QuoteResult.tsx       # 결과 표시 컴포넌트
│   ├── lib/                       # 핵심 비즈니스 로직
│   │   ├── calculator.ts         # 요금 계산 메인 로직
│   │   ├── utils.ts              # 유틸리티 함수
│   │   └── constants.ts          # 상수 정의
│   ├── types/                     # TypeScript 타입 정의
│   │   └── index.ts
│   ├── constants/                 # 상수 데이터
│   │   └── shipping-rates.json   # 0~10kg 요금표 데이터
│   └── __tests__/                 # 테스트 파일
│       ├── calculator.test.ts
│       └── utils.test.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── jest.config.js
```

## 요금 계산 로직

### 항공 운송 (CJ/롯데)

- **0 ~ 10kg**: 요금표 조회
- **10kg 초과**: 
  - CJ: 26,650원 + (0.5kg당 1,430원) + 보정(4,900원)
  - 롯데: 26,200원 + (0.5kg당 1,400원)

### 해운 운송

- **0 ~ 10kg**: 요금표 조회
- **10kg 초과 ~ 100kg 이하**: 
  - 기본금: 17,700원 (10kg 기준)
  - 증가액: 0.5kg당 1,133원
- **100kg 초과**: 
  - 기본금: 119,700원 (100kg 기준)
  - 증가액: 0.5kg당 550원

### 경동택배 (2차 배송)

- **비교 로직**: Max(부피 환산 요금, 무게 환산 요금) × 지역 할증(1.2 or 1.25)
- **부피 요금**: 
  - 기준: 5,000,000㎤까지 테이블 참조
  - 초과: 303,000원 + (10,000㎤당 600원)
- **무게 요금**: 
  - 기준: 1,000kg까지 테이블 참조
  - 초과: 99,400원 + (10kg당 800원)

## 테스트 케이스

PRD 문서의 테스트 케이스를 모두 통과합니다:

1. **초대형 화물 (경동 이관)**: 200×150×100cm, 500kg
2. **극대형 화물 (범위 초과)**: 300×250×200cm, 2,500kg
3. **해운 100kg 초과**: 50×40×30cm, 150kg

## 성능

- 계산 속도: <10ms (저성능 PC 기준)
- 메모리 사용량: 요금표 데이터 약 2KB

## 참고 문서

- [PRD 보완 문서 v1.2](./docs/PRD_보완문서_수식기반요금계산_v1.2.md)
- [PRD 보완 문서 v1.3](./docs/PRD_보완문서_수식기반요금계산_v1.3.md)

## 라이선스

ISC

