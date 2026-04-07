import { test, expect, type APIRequestContext } from '@playwright/test';

const API = 'http://localhost:4000/api';

let authCookie = '';
const createdIds: number[] = [];

/**
 * 관리자 로그인 후 쿠키 획득 (rate limit 대응: 최대 3회 재시도, 간격 두고)
 */
async function login(request: APIRequestContext) {
  if (authCookie) return;

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await request.post(`${API}/auth/login`, {
      data: {
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'admin123',
      },
    });

    if (res.status() === 429) {
      // rate limit — 잠시 대기 후 재시도
      await new Promise((r) => setTimeout(r, 61000));
      continue;
    }

    const cookies = res.headers()['set-cookie'] || '';
    const match = cookies.match(/access_token=([^;]+)/);
    if (match) {
      authCookie = `access_token=${match[1]}`;
      return;
    }
  }
}

function authHeaders() {
  return { Cookie: authCookie };
}

// 테스트 후 생성된 카테고리 정리
test.afterAll(async ({ request }) => {
  // 역순으로 삭제 (소분류 먼저)
  for (const id of [...createdIds].reverse()) {
    await request.delete(`${API}/categories/${id}`, {
      headers: authHeaders(),
    });
  }
});

test.describe('Categories API CRUD', () => {
  test.beforeAll(async ({ request }) => {
    await login(request);
  });

  let parentId: number;
  let childId: number;

  test('대분류 카테고리를 생성할 수 있다', async ({ request }) => {
    const res = await request.post(`${API}/categories`, {
      headers: authHeaders(),
      data: {
        name: 'E2E 테스트 대분류',
        slug: 'e2e-test-parent',
        sort_order: 99,
      },
    });

    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.name).toBe('E2E 테스트 대분류');
    expect(body.data.slug).toBe('e2e-test-parent');
    expect(body.data.parent_id).toBeNull();

    parentId = body.data.id;
    createdIds.push(parentId);
  });

  test('소분류 카테고리를 생성할 수 있다', async ({ request }) => {
    const res = await request.post(`${API}/categories`, {
      headers: authHeaders(),
      data: {
        name: 'E2E 테스트 소분류',
        slug: 'e2e-test-child',
        parent_id: parentId,
        sort_order: 0,
      },
    });

    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.parent_id).toBe(parentId);

    childId = body.data.id;
    createdIds.push(childId);
  });

  test('3단계 카테고리는 생성할 수 없다', async ({ request }) => {
    const res = await request.post(`${API}/categories`, {
      headers: authHeaders(),
      data: {
        name: '3단계 불가',
        slug: 'e2e-test-grandchild',
        parent_id: childId,
      },
    });

    expect(res.ok()).toBeFalsy();
    expect(res.status()).toBe(400);
  });

  test('중복 slug로 생성할 수 없다', async ({ request }) => {
    const res = await request.post(`${API}/categories`, {
      headers: authHeaders(),
      data: {
        name: '중복 slug',
        slug: 'e2e-test-parent',
      },
    });

    expect(res.ok()).toBeFalsy();
    expect(res.status()).toBe(409);
  });

  test('카테고리 트리를 조회할 수 있다', async ({ request }) => {
    const res = await request.get(`${API}/categories`);

    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);

    // 생성한 대분류가 트리에 포함되어야 함
    const parent = body.data.find((c: { slug: string }) => c.slug === 'e2e-test-parent');
    expect(parent).toBeTruthy();
    expect(parent.children).toHaveLength(1);
    expect(parent.children[0].slug).toBe('e2e-test-child');
  });

  test('카테고리를 수정할 수 있다', async ({ request }) => {
    const res = await request.patch(`${API}/categories/${childId}`, {
      headers: authHeaders(),
      data: { name: 'E2E 수정된 소분류' },
    });

    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.data.name).toBe('E2E 수정된 소분류');
  });

  test('하위 카테고리가 있으면 대분류를 삭제할 수 없다', async ({ request }) => {
    const res = await request.delete(`${API}/categories/${parentId}`, {
      headers: authHeaders(),
    });

    expect(res.ok()).toBeFalsy();
    expect(res.status()).toBe(400);
  });

  test('소분류를 삭제할 수 있다', async ({ request }) => {
    const res = await request.delete(`${API}/categories/${childId}`, {
      headers: authHeaders(),
    });

    expect(res.ok()).toBeTruthy();
    // 정리 목록에서 제거
    const idx = createdIds.indexOf(childId);
    if (idx !== -1) createdIds.splice(idx, 1);
  });

  test('소분류 삭제 후 대분류를 삭제할 수 있다', async ({ request }) => {
    const res = await request.delete(`${API}/categories/${parentId}`, {
      headers: authHeaders(),
    });

    expect(res.ok()).toBeTruthy();
    const idx = createdIds.indexOf(parentId);
    if (idx !== -1) createdIds.splice(idx, 1);
  });
});

test.describe('Categories API - 인증', () => {
  test('인증 없이 카테고리를 생성할 수 없다', async ({ request }) => {
    const res = await request.post(`${API}/categories`, {
      data: { name: '인증없음', slug: 'no-auth' },
    });

    expect(res.status()).toBe(401);
  });

  test('인증 없이 카테고리 트리를 조회할 수 있다 (public)', async ({ request }) => {
    const res = await request.get(`${API}/categories`);
    expect(res.ok()).toBeTruthy();
  });
});

test.describe('Post-Category 연동', () => {
  let catId: number;
  let postSlug: string;

  test.beforeAll(async ({ request }) => {
    await login(request);

    // 테스트용 카테고리 생성
    const catRes = await request.post(`${API}/categories`, {
      headers: authHeaders(),
      data: { name: 'E2E 포스트 카테고리', slug: 'e2e-post-cat', sort_order: 98 },
    });
    catId = (await catRes.json()).data.id;
    createdIds.push(catId);
  });

  test('카테고리를 지정하여 글을 생성할 수 있다', async ({ request }) => {
    postSlug = `e2e-test-post-${Date.now()}`;
    const res = await request.post(`${API}/posts`, {
      headers: authHeaders(),
      data: {
        title: 'E2E 카테고리 테스트 글',
        slug: postSlug,
        content: '테스트 내용입니다.',
        category_id: catId,
        published: true,
      },
    });

    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.data.category_id).toBe(catId);
  });

  test('카테고리 slug로 글을 필터링할 수 있다', async ({ request }) => {
    const res = await request.get(`${API}/posts?category=e2e-post-cat`);

    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.data.length).toBeGreaterThanOrEqual(1);
    expect(body.data.some((p: { slug: string }) => p.slug === postSlug)).toBe(true);
  });

  test('글의 카테고리 정보가 포함되어 조회된다', async ({ request }) => {
    const res = await request.get(`${API}/posts/${postSlug}`);

    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.data.categoryEntity).toBeTruthy();
    expect(body.data.categoryEntity.name).toBe('E2E 포스트 카테고리');
  });

  test('카테고리 트리에 post_count가 반영된다', async ({ request }) => {
    const res = await request.get(`${API}/categories`);
    const body = await res.json();

    const cat = body.data
      .flatMap((p: { children: { slug: string }[] }) => [p, ...p.children])
      .find((c: { slug: string }) => c.slug === 'e2e-post-cat');

    expect(cat).toBeTruthy();
    expect(cat.post_count).toBeGreaterThanOrEqual(1);
  });

  test('글이 있는 카테고리는 삭제할 수 없다', async ({ request }) => {
    const res = await request.delete(`${API}/categories/${catId}`, {
      headers: authHeaders(),
    });

    expect(res.ok()).toBeFalsy();
    expect(res.status()).toBe(400);
  });

  // 정리: 글 삭제 후 카테고리 삭제
  test.afterAll(async ({ request }) => {
    if (postSlug) {
      await request.delete(`${API}/posts/${postSlug}`, {
        headers: authHeaders(),
      });
    }
  });
});
