import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';

/**
 * remark 플러그인: `-` 마커로 작성된 리스트에 data-dash 속성 추가
 * `* item` → 불렛(•), `- item` → 대시(–)로 구분 렌더링
 */
export function remarkDashList() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: Root, file: any) => {
    const source = String(file?.value || '');
    if (!source) return;

    visit(tree, 'list', (node) => {
      if ('ordered' in node && node.ordered) return;
      if (!node.position) return;

      const offset = node.position.start.offset;
      if (offset === undefined) return;

      // 리스트 시작 위치에서 앞쪽 공백을 건너뛰고 마커 문자 찾기
      let i = offset;
      while (i < source.length && (source[i] === ' ' || source[i] === '\t')) i++;

      if (source[i] === '-') {
        const data = (node.data || {}) as Record<string, unknown>;
        data.hProperties = { 'data-dash': '' };
        node.data = data;
      }
    });
  };
}
