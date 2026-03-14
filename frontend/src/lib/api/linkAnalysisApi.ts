import { useMutation } from '@tanstack/react-query';
import { fetchClient } from './fetchClient';
import type { LinkAnalysisResponse } from '@/lib/types/linkAnalysis';

/**
 * AI 링크 분석 (POST /api/link-analysis/analyze)
 */
async function analyzeLink(url: string): Promise<LinkAnalysisResponse> {
  return fetchClient<LinkAnalysisResponse>('/api/link-analysis/analyze', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}

/**
 * [분석 Hook] AI로 링크를 분석하여 제목/설명/태그/폴더를 추천받습니다.
 */
export function useAnalyzeLink() {
  return useMutation({
    mutationFn: analyzeLink,
  });
}
