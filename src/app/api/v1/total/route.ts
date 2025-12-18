import { calculateQuote } from '@/lib/calculator';
import { RATES_VERSION } from '@/lib/constants';
import type { QuoteInput, Region, ShippingMode } from '@/types';

function asNumber(value: string | null): number | null {
  if (value == null) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return n;
}

function parseMode(raw: string | null): ShippingMode {
  // 기본값은 '해운(SEA)' - 브라우저 AI Assistant 토큰 최소화를 위한 기본값
  if (!raw) return 'SEA';

  // 토큰 절약용 축약 지원 (선택)
  if (raw === 's') return 'SEA';
  if (raw === 'cj') return 'AIR_CJ';
  if (raw === 'lo') return 'AIR_LOTTE';

  // 명시적 값도 지원
  if (raw === 'SEA' || raw === 'AIR_CJ' || raw === 'AIR_LOTTE') return raw;
  return 'SEA';
}

function parseRegion(raw: string | null): Region {
  if (!raw) return 'SUDO';
  if (raw === 'SUDO' || raw === 'OTHER' || raw === 'JEJU') return raw;
  return 'SUDO';
}

function jsonError(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const sp = url.searchParams;

  // w,d,h,kg: 토큰 최소화를 위한 짧은 파라미터
  const widthCm = asNumber(sp.get('w'));
  const depthCm = asNumber(sp.get('d'));
  const heightCm = asNumber(sp.get('h'));
  const weightKg = asNumber(sp.get('kg'));

  const debug = sp.get('debug') === '1';
  const mode = parseMode(sp.get('m'));
  const region = parseRegion(sp.get('r'));

  if (widthCm == null || depthCm == null || heightCm == null || weightKg == null) {
    if (debug) {
      return jsonError(400, {
        error: 'INVALID_INPUT',
        reason: 'Required query params: w, d, h, kg',
      });
    }
    return new Response('INVALID_INPUT', {
      status: 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  const input: QuoteInput = {
    widthCm,
    depthCm,
    heightCm,
    weightKg,
    mode,
    region,
  };

  const result = calculateQuote(input);

  if (!result.success || typeof result.finalPrice !== 'number') {
    if (debug) {
      return jsonError(400, {
        error: 'INVALID_INPUT',
        reason: result.reason ?? 'Calculation failed',
      });
    }
    return new Response('INVALID_INPUT', {
      status: 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  // 가성비: CDN 캐시를 허용해서 반복 요청 비용을 줄임 (URL 쿼리 기준으로 캐시됨)
  return new Response(String(result.finalPrice), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
      'X-LogiQuant-Rates-Version': RATES_VERSION,
    },
  });
}


