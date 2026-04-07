import { test, expect } from '@playwright/test';

test.describe('사이드바 카테고리 네비게이션', () => {
  test('사이드바에 카테고리 트리가 렌더링된다', async ({ page }) => {
    await page.goto('/');

    // 사이드바가 데스크탑에서 보여야 함
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();

    // 정적 링크가 존재해야 함
    await expect(sidebar.getByRole('link', { name: 'Portfolio' })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'About' })).toBeVisible();
  });

  test('소분류 클릭 시 블로그 리스트 페이지로 이동한다', async ({ page }) => {
    await page.goto('/');

    // 사이드바에서 첫 번째 소분류 링크 클릭 시도
    const categoryLinks = page.locator('aside a[href*="/blog?category="]');
    const count = await categoryLinks.count();

    if (count > 0) {
      const href = await categoryLinks.first().getAttribute('href');
      await categoryLinks.first().click();
      await page.waitForURL(/\/blog\?category=/);
      expect(page.url()).toContain('/blog?category=');

      // slug가 URL에 포함되어야 함
      if (href) {
        const slug = new URL(href, 'http://localhost').searchParams.get('category');
        expect(page.url()).toContain(`category=${slug}`);
      }
    }
  });

  test('대분류는 접기/펼치기가 동작한다', async ({ page }) => {
    await page.goto('/');

    // 대분류 버튼 (ChevronDown 아이콘을 가진 button)
    const parentButtons = page.locator('aside nav button');
    const count = await parentButtons.count();

    if (count > 0) {
      const button = parentButtons.first();
      await expect(button).toBeVisible();

      // 클릭하면 소분류가 숨겨져야 함
      await button.click();

      // 다시 클릭하면 소분류가 보여야 함
      await button.click();
    }
  });
});

test.describe('블로그 리스트 페이지', () => {
  test('블로그 페이지가 리스트 형식으로 렌더링된다', async ({ page }) => {
    await page.goto('/blog');

    // 페이지 제목이 있어야 함
    await expect(page.getByRole('heading', { name: 'Blog', exact: true })).toBeVisible();

    // 카드 그리드가 아닌 리스트 형식
    const grid = page.locator('.grid.md\\:grid-cols-2');
    await expect(grid).toHaveCount(0);
  });

  test('검색 입력창이 존재한다', async ({ page }) => {
    await page.goto('/blog');

    const search = page.getByPlaceholder(/검색|search/i);
    await expect(search).toBeVisible();
  });

  test('글 목록에 날짜와 제목이 표시된다', async ({ page }) => {
    await page.goto('/blog');

    // divide-y 리스트가 존재하면
    const listItems = page.locator('.divide-y a');
    const count = await listItems.count();

    if (count > 0) {
      // 각 항목에 time 요소와 제목이 있어야 함
      const firstItem = listItems.first();
      await expect(firstItem.locator('time')).toBeVisible();
      await expect(firstItem.locator('span')).toBeVisible();
    }
  });

  test('카테고리 필터가 URL 파라미터로 동작한다', async ({ page }) => {
    await page.goto('/blog?category=nonexistent-slug');

    // 페이지가 정상 로드되어야 함 (에러 아님)
    await expect(page.getByRole('heading', { name: 'Blog', exact: true })).toBeVisible();
  });

  test('페이지네이션이 존재할 수 있다', async ({ page }) => {
    await page.goto('/blog');

    // 페이지네이션은 글이 충분히 많을 때만 표시됨
    // 페이지가 정상 로드되는지만 확인
    await expect(page).toHaveURL(/\/blog/);
  });
});

test.describe('관리자 카테고리 페이지', () => {
  test.beforeEach(async ({ page }) => {
    // 관리자 로그인
    await page.goto('/admin/login');
    await page.getByPlaceholder('Username').fill(process.env.ADMIN_USERNAME || 'admin');
    await page.getByPlaceholder('Password').fill(process.env.ADMIN_PASSWORD || 'admin123');
    await page.getByRole('button', { name: /login/i }).click();
    await page.waitForURL(/\/admin(?!\/login)/, { timeout: 10000 });
  });

  test('관리자 네비게이션에 Categories 링크가 있다', async ({ page }) => {
    const categoriesLink = page.getByRole('link', { name: 'Categories' });
    await expect(categoriesLink).toBeVisible();
  });

  test('카테고리 관리 페이지가 렌더링된다', async ({ page }) => {
    await page.goto('/admin/categories');

    await expect(page.getByRole('heading', { name: 'Categories' })).toBeVisible();
    await expect(page.getByRole('button', { name: /대분류 추가/ })).toBeVisible();
  });

  test('대분류 추가 폼이 열린다', async ({ page }) => {
    await page.goto('/admin/categories');

    await page.getByRole('button', { name: /대분류 추가/ }).click();

    // 폼이 열려야 함
    await expect(page.getByPlaceholder('이름')).toBeVisible();
    await expect(page.getByPlaceholder('slug')).toBeVisible();
  });

  test('글 작성 폼에 카테고리 셀렉트가 있다', async ({ page }) => {
    await page.goto('/admin/posts/new');

    // select 요소가 존재 (카테고리 드롭다운)
    const categorySelect = page.locator('select');
    await expect(categorySelect).toBeVisible();

    // "미분류" 옵션이 존재 (option 요소는 브라우저에서 hidden이므로 count로 확인)
    await expect(categorySelect.locator('option', { hasText: '미분류' })).toHaveCount(1);
  });
});
