'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

interface AdSenseProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  fullWidthResponsive?: boolean;
  className?: string;
}

/**
 * 구글 애드센스 광고 컴포넌트
 * 
 * @param adSlot - 광고 슬롯 ID (구글 애드센스에서 생성한 광고 단위 ID)
 * @param adFormat - 광고 형식 ('auto' 권장)
 * @param fullWidthResponsive - 전체 너비 반응형 여부
 * @param className - 추가 CSS 클래스
 */
export default function AdSense({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  className = '',
}: AdSenseProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // 광고 초기화는 컨테이너가 렌더링되고 너비가 확보된 후에 실행
    const initializeAd = () => {
      if (isInitialized.current) return;
      
      if (typeof window === 'undefined') return;
      if (!adRef.current) return;
      
      // 컨테이너의 너비 확인
      const containerWidth = adRef.current.offsetWidth;
      if (containerWidth === 0) {
        // 너비가 0이면 다음 프레임에서 다시 시도
        requestAnimationFrame(initializeAd);
        return;
      }

      // adsbygoogle 스크립트가 로드되었는지 확인
      if (!(window as any).adsbygoogle) {
        // 스크립트가 아직 로드되지 않았으면 잠시 후 다시 시도
        setTimeout(initializeAd, 100);
        return;
      }

      try {
        // 광고 초기화
        const insElement = adRef.current.querySelector('.adsbygoogle') as HTMLElement;
        if (insElement && !insElement.dataset.adsbygoogleStatus) {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
          isInitialized.current = true;
        }
      } catch (err) {
        // 에러는 조용히 무시 (개발 환경에서만 표시)
        if (process.env.NODE_ENV === 'development') {
          console.warn('AdSense initialization warning:', err);
        }
      }
    };

    // DOM이 완전히 렌더링된 후 초기화 시도
    const timeoutId = setTimeout(() => {
      initializeAd();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [adSlot]);

  return (
    <div ref={adRef} className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-5216568727644747"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
      />
    </div>
  );
}

