import { test, expect, Page } from '@playwright/test';

/**
 * 個別レベルテスト
 * 各レベルを個別にテストして不具合を確認
 */

async function playLevel(page: Page, level: number) {
  console.log(`\nレベル ${level} を開始...`);

  // レベルボタンをクリック
  await page.getByRole('button', { name: `レベル ${level}` }).click();

  // カウントダウン待ち（記憶フェーズ前）
  await page.waitForTimeout(4000);

  // 記憶フェーズ: 「覚えてください」というテキストが表示されるのを待つ
  await expect(page.getByText('覚えてください')).toBeVisible({ timeout: 10000 });

  // 「覚えた」ボタンが表示されるまで待つ
  const memorizeButton = page.getByRole('button', { name: '覚えた' });
  await expect(memorizeButton).toBeVisible({ timeout: 10000 });

  // 記憶フェーズで表示されている絵文字を記録
  await page.waitForTimeout(500);

  const allTexts = await page.locator('div.css-text-146c3p1').allTextContents();
  const memorizeEmojiTexts = allTexts.filter(text => {
    if (!text || text.trim() === '' || text.includes('レベル') || text.includes('覚え') || text.includes('選') || text.includes('秒')) {
      return false;
    }
    return text.length <= 10 && /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}]/u.test(text);
  });

  const expectedCount = level + 3;
  console.log(`  - 期待: ${expectedCount}個, 実際: ${memorizeEmojiTexts.length}個`);
  console.log(`  - 記憶する絵文字: ${memorizeEmojiTexts.join(', ')}`);

  // 絵文字の数が期待通りかチェック
  expect(memorizeEmojiTexts.length).toBe(expectedCount);

  // 「覚えた」ボタンをクリック
  await memorizeButton.click();

  // カウントダウン待ち（回答フェーズ前）
  await page.waitForTimeout(4000);

  // 回答フェーズ: 選択肢が表示されるまで待つ
  await expect(page.getByText('選んでください')).toBeVisible({ timeout: 10000 });

  // 正解の画像枚数を計算（level + 3）
  const correctImageCount = level + 3;

  // すべてのクリック可能な画像を取得
  await page.waitForTimeout(500);

  const answerAllTexts = await page.locator('div.css-text-146c3p1').allTextContents();
  const answerEmojiTexts = answerAllTexts.filter(text => {
    if (!text || text.trim() === '' || text.includes('レベル') || text.includes('覚え') || text.includes('選') || text.includes('秒')) {
      return false;
    }
    return text.length <= 10 && /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}]/u.test(text);
  });

  console.log(`  - 回答フェーズの絵文字の数: ${answerEmojiTexts.length}`);

  let selectedCount = 0;

  // 記憶した絵文字と一致するものを選択
  const answerEmojiLocators = page.locator('div.css-text-146c3p1');
  const allEmojiElements = await answerEmojiLocators.all();

  for (const emojiElement of allEmojiElements) {
    if (selectedCount >= correctImageCount) break;

    const text = await emojiElement.textContent();
    if (text && memorizeEmojiTexts.includes(text)) {
      console.log(`  - 正解の絵文字を選択: ${text}`);
      await emojiElement.click();
      selectedCount++;
      await page.waitForTimeout(150);
    }
  }

  console.log(`  - ${selectedCount}/${correctImageCount}枚の画像を選択`);

  // 正解数が期待通りかチェック
  expect(selectedCount).toBe(correctImageCount);

  // 「確認する」ボタンをクリック
  const confirmButton = page.getByRole('button', { name: '確認する' });
  await expect(confirmButton).toBeVisible();
  await confirmButton.click();

  // 結果画面に遷移するまで待つ
  await expect(page.getByText(/正解率/).first()).toBeVisible({ timeout: 10000 });

  // 結果を確認
  const resultText = await page.textContent('body');
  const accuracyMatch = resultText?.match(/正解率:\s*(\d+)%/);
  const accuracy = accuracyMatch ? parseInt(accuracyMatch[1]) : 0;

  console.log(`  - 正解率: ${accuracy}%`);

  // 100%の正解率を期待
  expect(accuracy).toBe(100);

  console.log(`✅ レベル ${level} クリア成功！\n`);
}

test.describe('個別レベルテスト（初級モード）', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 90000 });
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('button', { name: 'レベル 1' })).toBeVisible({ timeout: 60000 });
  });

  // レベル1-5
  for (let level = 1; level <= 5; level++) {
    test(`レベル${level}をクリアする`, async ({ page }) => {
      test.setTimeout(120000);
      await playLevel(page, level);
    });
  }

  // レベル6-10
  for (let level = 6; level <= 10; level++) {
    test(`レベル${level}をクリアする`, async ({ page }) => {
      test.setTimeout(120000);
      await playLevel(page, level);
    });
  }

  // レベル11-15
  for (let level = 11; level <= 15; level++) {
    test(`レベル${level}をクリアする`, async ({ page }) => {
      test.setTimeout(120000);
      await playLevel(page, level);
    });
  }

  // レベル16-20
  for (let level = 16; level <= 20; level++) {
    test(`レベル${level}をクリアする`, async ({ page }) => {
      test.setTimeout(120000);
      await playLevel(page, level);
    });
  }
});
