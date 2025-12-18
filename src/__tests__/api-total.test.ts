import { GET } from '@/app/api/v1/total/route';

describe('GET /api/v1/total', () => {
  it('기본값(해운)으로 text/plain 숫자만 반환해야 함', async () => {
    const req = new Request('http://localhost/api/v1/total?w=50&d=40&h=30&kg=10');
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/plain');

    const body = await res.text();
    expect(body).toMatch(/^\d+$/);
  });

  it('필수 파라미터 누락 시 400 INVALID_INPUT 반환해야 함', async () => {
    const req = new Request('http://localhost/api/v1/total?w=50&d=40&h=30');
    const res = await GET(req);

    expect(res.status).toBe(400);
    expect(await res.text()).toBe('INVALID_INPUT');
  });

  it('debug=1이면 JSON 에러를 반환해야 함', async () => {
    const req = new Request('http://localhost/api/v1/total?w=0&d=40&h=30&kg=10&debug=1');
    const res = await GET(req);

    expect(res.status).toBe(400);
    expect(res.headers.get('content-type')).toContain('application/json');

    const json = await res.json();
    expect(json).toHaveProperty('error', 'INVALID_INPUT');
  });
});


