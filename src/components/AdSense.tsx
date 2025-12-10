'use client';

import { useEffect } from 'react';
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
  useEffect(() => {
    try {
      // 광고 초기화 (adsbygoogle이 로드된 후 실행)
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense initialization error:', err);
    }
  }, []);

  return (
    <div className={`ad-container ${className}`}>
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

