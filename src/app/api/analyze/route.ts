import { parseFromLayout } from '../../../lib/parse';
import type { AnalyzeResponse, AnalyzeError } from '../../../lib/types';

export const runtime = 'edge';

const PRIVATE_IP =
  /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.0\.0\.0|\[::1\]|::1$)/i;

function errorJson(code: AnalyzeError['code'], message: string, status: number): Response {
  return Response.json({ error: message, code } satisfies AnalyzeError, { status });
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get('url');

  if (!rawUrl) return errorJson('INVALID_URL', 'url parameter is required', 400);

  let targetUrl: URL;
  try {
    targetUrl = new URL(rawUrl);
  } catch {
    return errorJson('INVALID_URL', 'Malformed URL — include https://', 400);
  }

  if (!['http:', 'https:'].includes(targetUrl.protocol)) {
    return errorJson('INVALID_URL', 'Only http and https URLs are supported', 400);
  }

  if (PRIVATE_IP.test(targetUrl.hostname)) {
    return errorJson('INVALID_URL', 'Private or local addresses are not allowed', 403);
  }

  let html: string;
  try {
    const res = await fetch(targetUrl.href, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,*/*;q=0.9',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      if (
        res.status === 403 &&
        (body.includes('Just a moment') || body.includes('cf-challenge') || body.includes('Checking your browser'))
      ) {
        return errorJson(
          'BLOCKED',
          'This site is protected and blocked bot access. Try a different URL.',
          403,
        );
      }
      return errorJson('FETCH_FAILED', `Site returned HTTP ${res.status}`, 502);
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('html')) {
      return errorJson('FETCH_FAILED', 'URL does not point to an HTML page', 422);
    }

    const buffer = await res.arrayBuffer();
    if (buffer.byteLength > 2_000_000) {
      return errorJson('BLOCKED', 'Page is too large to analyze (max 2MB)', 413);
    }
    html = new TextDecoder().decode(buffer);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('timeout') || msg.includes('abort') || msg.includes('TimeoutError')) {
      return errorJson('FETCH_FAILED', 'Request timed out after 8 seconds', 504);
    }
    return errorJson('FETCH_FAILED', `Could not reach the site: ${msg}`, 502);
  }

  try {
    const { tree, palette } = parseFromLayout(html);
    const body: AnalyzeResponse = {
      url: targetUrl.href,
      tree,
      palette,
      fetchedAt: new Date().toISOString(),
    };
    return Response.json(body, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=3600' },
    });
  } catch {
    return errorJson('PARSE_ERROR', 'Failed to parse the page structure', 500);
  }
}
