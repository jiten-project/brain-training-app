import { test, expect, Page } from '@playwright/test';

/**
 * レベル進行E2Eテスト
 * 初級モードでレベル1からレベル20までクリアする
 */

/**
 * ゲームをプレイして結果画面まで進む
 * @param page Playwrightページオブジェクト
 * @param level プレイするレベル
 */
async function playLevel(page: Page, level: number) {
  console.log(`レベル ${level} を開始...`);

  // レベルボタンをクリック
  await page.getByRole('button', { name: `レベル ${level}` }).click();

  // カウントダウン待ち（記憶フェーズ前）
  // カウントダウンは3秒
  await page.waitForTimeout(4000);

  // 記憶フェーズ: 「覚えてください」というテキストが表示されるのを待つ
  await expect(page.getByText('覚えてください')).toBeVisible({ timeout: 10000 });

  // 「覚えた」ボタンが表示されるまで待つ
  const memorizeButton = page.getByRole('button', { name: '覚えた' });
  await expect(memorizeButton).toBeVisible({ timeout: 10000 });

  // 記憶フェーズで表示されている絵文字を記録
  await page.waitForTimeout(500); // 要素がレンダリングされるまで待つ

  // すべてのdiv.css-text-146c3p1要素を取得し、その中から絵文字のみを抽出
  const allTexts = await page.locator('div.css-text-146c3p1').allTextContents();

  // 絵文字かどうかを判定する関数（非ASCII文字で、長さが1-2文字のもの）
  const memorizeEmojiTexts = allTexts.filter(text => {
    // 空白やレベル表示などのテキストを除外
    if (!text || text.trim() === '' || text.includes('レベル') || text.includes('覚え') || text.includes('選') || text.includes('秒')) {
      return false;
    }
    // 絵文字は通常1-4文字（結合文字を含む場合がある）
    return text.length <= 10 && /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}]/u.test(text);
  });

  console.log(`  - 記憶する絵文字 (${memorizeEmojiTexts.length}個): ${memorizeEmojiTexts.join(', ')}`);

  // 画像を見る時間を確保（少し待つ）
  await page.waitForTimeout(500);

  // 「覚えた」ボタンをクリック
  await memorizeButton.click();

  // カウントダウン待ち（回答フェーズ前）
  await page.waitForTimeout(4000);

  // 回答フェーズ: 選択肢が表示されるまで待つ
  await expect(page.getByText('選んでください')).toBeVisible({ timeout: 10000 });

  // 正解の画像枚数を計算（level + 3）
  const correctImageCount = level + 3;

  // すべてのクリック可能な画像を取得
  await page.waitForTimeout(500); // 要素がレンダリングされるまで待つ

  const answerAllTexts = await page.locator('div.css-text-146c3p1').allTextContents();
  const answerEmojiTexts = answerAllTexts.filter(text => {
    if (!text || text.trim() === '' || text.includes('レベル') || text.includes('覚え') || text.includes('選') || text.includes('秒')) {
      return false;
    }
    return text.length <= 10 && /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}]/u.test(text);
  });

  console.log(`  - 回答フェーズの絵文字の数: ${answerEmojiTexts.length}`);

  if (answerEmojiTexts.length > 0 && memorizeEmojiTexts.length > 0) {
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
  } else {
    console.log(`  - 警告: 絵文字が見つかりませんでした（記憶: ${memorizeEmojiTexts.length}個, 回答: ${answerEmojiTexts.length}個）`);
    await page.screenshot({ path: 'debug-screenshot.png' });
  }

  // 「確認する」ボタンをクリック
  const confirmButton = page.getByRole('button', { name: '確認する' });
  await expect(confirmButton).toBeVisible();
  await confirmButton.click();

  // 結果画面に遷移するまで待つ
  await expect(page.getByText(/正解率/).first()).toBeVisible({ timeout: 10000 });

  // 結果を確認
  const resultText = await page.textContent('body');
  const isClearedMatch = resultText?.match(/クリア|残念/);
  const isCleared = isClearedMatch?.[0] === 'クリア';

  console.log(`  - 結果: ${isCleared ? 'クリア' : '失敗'}`);

  return isCleared;
}

test.describe('レベル進行テスト（初級モード）', () => {
  test.beforeEach(async ({ page }) => {
    // アプリのホーム画面に移動
    await page.goto('/', { waitUntil: 'networkidle', timeout: 90000 });

    // ページが読み込まれるまで待つ
    // まず、ページに何かコンテンツが表示されるのを待つ
    await page.waitForLoadState('domcontentloaded');

    // レベル1ボタンが表示されるまで待つ
    await expect(page.getByRole('button', { name: 'レベル 1' })).toBeVisible({ timeout: 60000 });
  });

  test('レベル1からレベル20まで順次クリアする', async ({ page }) => {
    test.setTimeout(300000); // 5分のタイムアウト

    for (let level = 1; level <= 20; level++) {
      let cleared = false;
      let attempts = 0;
      const maxAttempts = 5; // 最大5回まで試行

      // クリアするまで繰り返す（ランダム選択なので失敗する可能性がある）
      while (!cleared && attempts < maxAttempts) {
        attempts++;
        console.log(`\nレベル ${level} の試行 ${attempts}/${maxAttempts}`);

        try {
          cleared = await playLevel(page, level);

          if (cleared) {
            // 次のレベルへボタンまたはホームに戻るボタンをクリック
            const nextButton = page.getByRole('button', { name: /次のレベルへ|ホームに戻る/ });
            await expect(nextButton).toBeVisible();
            await nextButton.click();

            // ホーム画面に戻るまで待つ
            await expect(page.getByRole('button', { name: `レベル ${level + 1}` })).toBeVisible({ timeout: 10000 });

            console.log(`✅ レベル ${level} クリア成功！`);
          } else {
            // もう一度挑戦ボタンをクリック
            const retryButton = page.getByRole('button', { name: /もう一度挑戦|ホームに戻る/ });
            await expect(retryButton).toBeVisible();

            if (attempts < maxAttempts) {
              // リトライの場合はホームに戻る
              const homeButton = page.getByRole('button', { name: 'ホームに戻る' });
              if (await homeButton.isVisible()) {
                await homeButton.click();
              } else {
                await retryButton.click();
              }

              // ホーム画面に戻るまで待つ
              await expect(page.getByRole('button', { name: `レベル ${level}` })).toBeVisible({ timeout: 10000 });
            }
          }
        } catch (error) {
          console.error(`レベル ${level} の試行 ${attempts} でエラー:`, error);

          // エラー時はホームに戻る
          await page.goto('/');
          await expect(page.getByRole('button', { name: `レベル ${level}` })).toBeVisible({ timeout: 10000 });
        }
      }

      // クリアできなかった場合はテスト失敗
      expect(cleared).toBe(true);
    }

    console.log('\n🎉 すべてのレベルをクリアしました！');
  });

  test('レベル1をクリアする（単体テスト）', async ({ page }) => {
    test.setTimeout(60000); // 1分のタイムアウト

    let cleared = false;
    let attempts = 0;
    const maxAttempts = 5;

    while (!cleared && attempts < maxAttempts) {
      attempts++;
      console.log(`\nレベル 1 の試行 ${attempts}/${maxAttempts}`);

      cleared = await playLevel(page, 1);

      if (!cleared && attempts < maxAttempts) {
        const homeButton = page.getByRole('button', { name: 'ホームに戻る' });
        if (await homeButton.isVisible()) {
          await homeButton.click();
          await expect(page.getByRole('button', { name: 'レベル 1' })).toBeVisible({ timeout: 10000 });
        }
      }
    }

    expect(cleared).toBe(true);
  });
});
