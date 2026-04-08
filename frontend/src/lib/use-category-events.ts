'use client';

import { useEffect } from 'react';

/**
 * 카테고리 변경 SSE 구독 — 이벤트 수신 시 콜백 실행
 */
export function useCategoryEvents(onUpdate: () => void) {
  useEffect(() => {
    const es = new EventSource('/api/sse/categories');

    es.onmessage = () => {
      onUpdate();
    };

    es.onerror = () => {
      // 연결 끊기면 브라우저가 자동 재연결
    };

    return () => es.close();
  }, [onUpdate]);
}
